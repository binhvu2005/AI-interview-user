import OpenAI from 'openai';
import dotenv from 'dotenv';
import { CV_ANALYSIS_SYSTEM_PROMPT, getCVAnalysisUserPrompt } from '../utils/cv-analysis.prompt';
import { INTERVIEW_SYSTEM_PROMPT, getInterviewQuestionsPrompt } from '../utils/interview.prompt';
import { INTERVIEW_CHAT_SYSTEM_PROMPT, getInterviewChatUserPrompt } from '../utils/chat.prompt';
import { INTERVIEW_EVALUATION_SYSTEM_PROMPT, getEvaluationUserPrompt } from '../utils/evaluation.prompt';
import { ChatTurn, PROMPT_BUDGET, PromptBudget, fitHistory, inlineField } from '../utils/prompt-format';
import { getSeniority } from '../utils/seniority';
import {
  PlannedTopic, checkMainQuestion, cleanHistory, countMainQuestions, finalizeChatResult, getInterviewStructure, planTurn,
} from '../utils/interview-flow';
import { clamp, finalizeEvaluation, stringList } from '../utils/evaluation-score';

dotenv.config();

// llama-3.1-8b-instant was retired by Groq (404); override with GROQ_MODEL when the catalogue changes again.
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1',
});

// Returns the parsed object, or null when the text holds no valid JSON object. Callers must not
// treat raw model text as a valid answer: that used to surface broken JSON to the candidate.
export const extractJSON = (text: string): any => {
  if (!text) return null;
  // Strip only an outer ```json fence: fences inside string values (debug code snippets) must survive.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) { }

  // Only the outermost object counts: on truncated output, the last complete inner object (e.g. one
  // detailedFeedback item) must not be mistaken for the whole answer.
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last <= first) return null;
  try {
    return JSON.parse(cleaned.substring(first, last + 1));
  } catch (e) {
    return null;
  }
};

interface CallOptions {
  temperature?: number;
  isVip?: boolean;
  // Groq output cap (includes the model's reasoning tokens); kept modest because Groq's TPM limit counts max_tokens against the request.
  groqMaxTokens?: number;
}

const callGemini = async (systemPrompt: string, userPrompt: string, label: string, temperature: number) => {
  console.log(`[Gemini] Calling: ${label}...`);
  const apiKey = process.env.GEMINI_API_KEY;
  // Use gemini-3-flash-preview for VIP tasks to bypass gemini-2.5-flash rate limits
  const modelName = 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature, responseMimeType: 'application/json', maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Gemini returned empty response content');
  if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error(`Gemini ${label} output truncated`);
  console.log(`[Gemini] ${label} RAW CONTENT:`, content);
  return content as string;
};

const callGroq = async (systemPrompt: string, userPrompt: string, label: string, temperature: number, maxTokens: number) => {
  console.log(`[Groq] Calling: ${label} (prompt chars: ${systemPrompt.length + userPrompt.length})...`);
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature,
    max_tokens: maxTokens,
    ...(GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' as const } : {}),
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error('AI returned empty message');
  if (choice?.finish_reason === 'length') throw new Error(`${label}: output truncated at max_tokens (${maxTokens})`);
  console.log(`[Groq] ${label} RAW CONTENT:`, content);
  return content;
};

// The user prompt is built per provider so a VIP request that falls back to Groq is rebuilt with the
// Groq budget instead of being sent oversized (413).
const callAI = async (
  systemPrompt: string,
  buildUserPrompt: (budget: PromptBudget) => string,
  label: string,
  { temperature = 0.1, isVip = false, groqMaxTokens = 2000 }: CallOptions = {},
): Promise<any> => {
  if (isVip && process.env.GEMINI_API_KEY) {
    try {
      const parsed = extractJSON(await callGemini(systemPrompt, buildUserPrompt(PROMPT_BUDGET.gemini), label, temperature));
      if (parsed) return parsed;
      console.error(`[Gemini] ${label} returned invalid JSON, falling back to Groq.`);
    } catch (geminiErr: any) {
      console.error(`[Gemini] ${label} FAILED, falling back to Groq. Error:`, geminiErr.message);
    }
  }

  const userPrompt = buildUserPrompt(PROMPT_BUDGET.groq);
  // One retry: small models occasionally emit malformed JSON even in json_object mode.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const parsed = extractJSON(await callGroq(systemPrompt, userPrompt, label, temperature, groqMaxTokens));
      if (parsed) return parsed;
      console.error(`[Groq] ${label} returned invalid JSON (attempt ${attempt}).`);
    } catch (err: any) {
      console.error(`[AI Service] ${label} FAILED (attempt ${attempt}):`, err.message);
      // Retrying a rate limit or an oversized request at once only burns the TPM quota again.
      if (attempt === 2 || err?.status === 413 || err?.status === 429) throw err;
    }
  }
  throw new Error(`${label}: AI returned invalid JSON`);
};

export const analyzeCVJDMatch = async (cvData: string, jdText: string, position: string, level: string, lang: string = 'vi', isVip: boolean = false) => {
  const result = await callAI(
    CV_ANALYSIS_SYSTEM_PROMPT,
    budget => getCVAnalysisUserPrompt(cvData, jdText, position, level, lang, budget),
    'CV Analysis',
    { temperature: 0.1, isVip, groqMaxTokens: 2200 },
  );

  const parts = result.scoreParts;
  const matchScore = parts
    ? Math.round(clamp(parts.skills, 0, 50) + clamp(parts.experience, 0, 25) + clamp(parts.seniority, 0, 25))
    : Math.round(clamp(result.matchScore, 0, 100));

  return {
    matchScore,
    summary: result.summary ?? (lang === 'vi' ? "Phân tích đang được cập nhật..." : "Analysis is being updated..."),
    matchedSkills: stringList(result.matchedSkills),
    missingSkills: stringList(result.missingSkills),
    strengths: stringList(result.strengths),
    weaknesses: stringList(result.weaknesses),
    improvementSuggestions: stringList(result.improvementSuggestions),
    experienceAnalysis: result.experienceAnalysis ?? { required: "N/A", candidate: "N/A", gap: "N/A" },
    interviewRecommendation: {
      shouldInterview: result.interviewRecommendation?.shouldInterview === true,
      focusAreas: stringList(result.interviewRecommendation?.focusAreas),
    },
  };
};

const PHASES = ['theory', 'practice', 'debug'];

// Keeps only well-formed topics; the chat falls back to free topic choice for any missing slot.
export const normalizePlannedTopics = (topics: any): PlannedTopic[] =>
  Array.isArray(topics)
    ? topics
      .filter(t => t && typeof t.topic === 'string' && t.topic.trim() && PHASES.includes(t.phase))
      .slice(0, 15)
      .map(t => ({ phase: t.phase, topic: inlineField(t.topic), focus: typeof t.focus === 'string' ? inlineField(t.focus, 200) : undefined }))
    : [];

export const generateInterviewQuestions = async (cvData: string, jdText: string, position: string, level: string, lang: string = 'vi', duration: string = '15', isVip: boolean = false) => {
  const seniority = getSeniority(level, position);
  const structure = getInterviewStructure(duration, seniority);
  const result = await callAI(
    INTERVIEW_SYSTEM_PROMPT,
    budget => getInterviewQuestionsPrompt(cvData, jdText, position, level, lang, seniority, structure, budget),
    'Interview Questions',
    { temperature: 0.4, isVip, groqMaxTokens: 1800 },
  );
  return {
    interviewPlan: typeof result.interviewPlan === 'string' ? result.interviewPlan : '',
    topics: normalizePlannedTopics(result.topics),
  };
};

export const processInterviewChat = async (history: ChatTurn[], cvData: string, jdText: string, position: string, level: string, lang: string = 'vi', duration: string = '15', isVip: boolean = false, plannedTopics: any = []) => {
  const seniority = getSeniority(level, position);
  const structure = getInterviewStructure(duration, seniority);
  const turns = cleanHistory(history);
  const plan = planTurn(turns, structure, normalizePlannedTopics(plannedTopics));
  const isFirstTurn = !turns.some(m => m.role === 'ai');

  const ask = (correction?: string) => callAI(
    INTERVIEW_CHAT_SYSTEM_PROMPT,
    budget => {
      const { turns: fitted, omitted } = fitHistory(turns, budget.history);
      return getInterviewChatUserPrompt({
        history: fitted, omittedTurns: omitted, cvData, jdText, position, level, seniority, lang, plan, isFirstTurn, budget, correction,
      });
    },
    'Interview Chat',
    { temperature: 0.6, isVip, groqMaxTokens: 1500 },
  );

  let raw = await ask();
  // One corrective retry at most; if it is still off, keep the first reply rather than fail the turn.
  const correction = checkMainQuestion(raw, plan);
  if (correction) {
    console.warn(`[Interview Chat] retrying: ${correction}`);
    const retried = await ask(correction).catch(() => null);
    if (retried && !checkMainQuestion(retried, plan)) raw = retried;
  }

  return finalizeChatResult(raw, plan, isFirstTurn);
};

export const evaluateInterview = async (history: ChatTurn[], cvData: string, jdText: string, matchScore: number, lang: string = 'vi', position: string = '', level: string = '', cheatCount: number = 0, isVip: boolean = false) => {
  const raw = await callAI(
    INTERVIEW_EVALUATION_SYSTEM_PROMPT(lang, position, level),
    budget => {
      const turns = cleanHistory(history);
      // fitHistory measures full turn length, so per-turn cuts only make the result smaller: never oversized.
      const { turns: fitted, omitted } = fitHistory(turns, budget.evalHistory);
      return getEvaluationUserPrompt(fitted, cvData, jdText, matchScore, lang, budget, omitted, omitted ? countMainQuestions(fitted) : countMainQuestions(turns));
    },
    'Interview Evaluation',
    { temperature: 0.1, isVip, groqMaxTokens: 3500 },
  );
  // Without a breakdown every criterion would default to 0 and the interview would be saved as REJECT.
  if (!raw?.breakdown || typeof raw.breakdown !== 'object') throw new Error('Interview Evaluation: missing breakdown');
  return finalizeEvaluation(raw, getSeniority(level, position), cheatCount, lang);
};
