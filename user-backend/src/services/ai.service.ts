import OpenAI from 'openai';
import dotenv from 'dotenv';
import { CV_ANALYSIS_SYSTEM_PROMPT, getCVAnalysisUserPrompt } from '../utils/cv-analysis.prompt';
import { INTERVIEW_SYSTEM_PROMPT, getInterviewQuestionsPrompt } from '../utils/interview.prompt';
import { INTERVIEW_CHAT_SYSTEM_PROMPT, getInterviewChatUserPrompt } from '../utils/chat.prompt';
import {
  GRADING_SYSTEM_PROMPT, GradedItem, GradingItem, SUMMARY_SYSTEM_PROMPT, getGradingUserPrompt, getSummaryUserPrompt,
} from '../utils/evaluation.prompt';
import { ChatTurn, PROMPT_BUDGET, PromptBudget, cvForPrompt, fitHistory, inlineField, truncate } from '../utils/prompt-format';
import { getSeniority } from '../utils/seniority';
import {
  PlannedTopic, checkMainQuestion, cleanHistory, finalizeChatResult, getInterviewStructure, getPhaseForMain, planTurn,
  segmentTranscript,
} from '../utils/interview-flow';
import { clamp, finalizeEvaluation, shouldRecommendInterview, stringList } from '../utils/evaluation-score';

dotenv.config();

// llama-3.1-8b-instant was retired by Groq (404); override with GROQ_MODEL when the catalogue changes again.
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
// A hung Gemini request must fall back to Groq instead of holding the candidate's request open.
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 60_000;
const GROQ_TIMEOUT_MS = 90_000;

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
  // Background work (the evaluation) can wait out Groq rate limits; a live chat turn cannot.
  patient?: boolean;
}

class TruncatedOutputError extends Error {}

// Thinking tokens count against maxOutputTokens: left at the default they push long outputs into MAX_TOKENS.
const geminiThinkingConfig = (model: string) => {
  if (model.startsWith('gemini-3')) return { thinkingLevel: 'low' };
  if (model.startsWith('gemini-2.5')) return { thinkingBudget: 1024 };
  return undefined;
};

const callGemini = async (systemPrompt: string, userPrompt: string, label: string, temperature: number) => {
  console.log(`[Gemini] Calling: ${label} (${GEMINI_MODEL})...`);
  const thinkingConfig = geminiThinkingConfig(GEMINI_MODEL);
  // The key goes in a header: in the query string it ends up in proxy and APM logs.
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature, responseMimeType: 'application/json', maxOutputTokens: 8192, ...(thinkingConfig ? { thinkingConfig } : {}),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText.slice(0, 500)}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  // Thinking models may return a thought part first; the answer is the last non-thought text part.
  const parts: any[] = candidate?.content?.parts || [];
  const content = parts.filter(p => typeof p?.text === 'string' && !p.thought).map(p => p.text).pop();
  if (!content) throw new Error('Gemini returned empty response content');
  if (candidate?.finishReason === 'MAX_TOKENS') throw new Error(`Gemini ${label} output truncated`);
  // Model output quotes the candidate's CV and answers: log its size, never its text.
  console.log(`[Gemini] ${label} OK (${content.length} chars)`);
  return content as string;
};

const callGroq = async (systemPrompt: string, userPrompt: string, label: string, temperature: number, maxTokens: number, patient: boolean) => {
  console.log(`[Groq] Calling: ${label} (prompt chars: ${systemPrompt.length + userPrompt.length}, max_tokens: ${maxTokens})...`);
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
  }, {
    // The SDK retries 429 with the server's retry-after; the evaluation runs in the background and can wait longer.
    maxRetries: patient ? 6 : 2,
    timeout: GROQ_TIMEOUT_MS,
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error('AI returned empty message');
  if (choice?.finish_reason === 'length') throw new TruncatedOutputError(`${label}: output truncated at max_tokens (${maxTokens})`);
  console.log(`[Groq] ${label} OK (${content.length} chars)`);
  return content;
};

// The user prompt is built per provider so a VIP request that falls back to Groq is rebuilt with the
// Groq budget instead of being sent oversized (413).
const callAI = async (
  systemPrompt: string,
  buildUserPrompt: (budget: PromptBudget) => string,
  label: string,
  { temperature = 0.1, isVip = false, groqMaxTokens = 2000, patient = false }: CallOptions = {},
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
  let maxTokens = groqMaxTokens;
  // One retry: small models occasionally emit malformed JSON even in json_object mode.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const parsed = extractJSON(await callGroq(systemPrompt, userPrompt, label, temperature, maxTokens, patient));
      if (parsed) return parsed;
      console.error(`[Groq] ${label} returned invalid JSON (attempt ${attempt}).`);
    } catch (err: any) {
      console.error(`[AI Service] ${label} FAILED (attempt ${attempt}):`, err.message);
      // The SDK has already waited out a rate limit; an oversized request will not shrink on its own.
      if (attempt === 2 || err?.status === 413 || err?.status === 429) throw err;
      // The same prompt under the same cap would be cut off again.
      if (err instanceof TruncatedOutputError) maxTokens = Math.round(maxTokens * 1.6);
    }
  }
  throw new Error(`${label}: AI returned invalid JSON`);
};

export interface CandidateContext {
  cvData: string;
  // Compact profile from the CV analysis; used when the raw CV does not fit a prompt budget.
  cvProfile?: string;
  jdText: string;
  position: string;
  level: string;
  lang: string;
  isVip: boolean;
}

const cvFor = (ctx: CandidateContext, budget: PromptBudget) => cvForPrompt(ctx.cvData, ctx.cvProfile, budget.cv);

export const analyzeCVJDMatch = async (cvData: string, jdText: string, position: string, level: string, lang: string = 'vi', isVip: boolean = false) => {
  const result = await callAI(
    CV_ANALYSIS_SYSTEM_PROMPT,
    budget => getCVAnalysisUserPrompt(cvData, jdText, position, level, lang, budget),
    'CV Analysis',
    { temperature: 0.1, isVip, groqMaxTokens: 2600 },
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
      shouldInterview: shouldRecommendInterview(matchScore, result.interviewRecommendation?.coreSkillMissing),
      focusAreas: stringList(result.interviewRecommendation?.focusAreas),
    },
    candidateProfile: typeof result.candidateProfile === 'string' ? result.candidateProfile.trim().slice(0, 1500) : '',
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

export const generateInterviewQuestions = async (ctx: CandidateContext, duration: string | number = '15') => {
  const seniority = getSeniority(ctx.level, ctx.position);
  const structure = getInterviewStructure(duration, seniority);
  const result = await callAI(
    INTERVIEW_SYSTEM_PROMPT,
    budget => getInterviewQuestionsPrompt(cvFor(ctx, budget), ctx.jdText, ctx.position, ctx.level, ctx.lang, seniority, structure, budget),
    'Interview Questions',
    { temperature: 0.4, isVip: ctx.isVip, groqMaxTokens: 1800 },
  );
  return {
    interviewPlan: typeof result.interviewPlan === 'string' ? result.interviewPlan : '',
    topics: normalizePlannedTopics(result.topics),
  };
};

export const processInterviewChat = async (history: ChatTurn[], ctx: CandidateContext, duration: string | number = '15', plannedTopics: any = []) => {
  const seniority = getSeniority(ctx.level, ctx.position);
  const structure = getInterviewStructure(duration, seniority);
  const turns = cleanHistory(history);
  const plan = planTurn(turns, structure, normalizePlannedTopics(plannedTopics));
  const isFirstTurn = !turns.some(m => m.role === 'ai');

  const ask = (correction?: string) => callAI(
    INTERVIEW_CHAT_SYSTEM_PROMPT,
    budget => {
      const { turns: fitted, omitted } = fitHistory(turns, budget.history);
      return getInterviewChatUserPrompt({
        history: fitted, omittedTurns: omitted, cvData: cvFor(ctx, budget), jdText: ctx.jdText, position: ctx.position,
        level: ctx.level, seniority, lang: ctx.lang, plan, isFirstTurn, budget, correction,
      });
    },
    'Interview Chat',
    { temperature: 0.6, isVip: ctx.isVip, groqMaxTokens: 1500 },
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

// Questions per grading call. Each call stays far below max_tokens, so a long interview no longer
// overflows the output and one bad call does not sink the whole report.
const GRADING_BATCH = { gemini: 8, groq: 3 };
const GROQ_TOKENS_PER_ITEM = 450;

const gradeBatch = async (batch: GradingItem[], ctx: CandidateContext, label: string): Promise<Map<number, any>> => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await callAI(
      GRADING_SYSTEM_PROMPT(ctx.lang),
      budget => getGradingUserPrompt(batch, { cv: cvFor(ctx, budget), jd: truncate(ctx.jdText, budget.jd) }, ctx.lang, budget.turn),
      label,
      { temperature: 0.1, isVip: ctx.isVip, groqMaxTokens: 400 + GROQ_TOKENS_PER_ITEM * batch.length, patient: true },
    );
    const graded = new Map<number, any>(
      (Array.isArray(raw?.items) ? raw.items : []).map((g: any) => [Number(g?.index), g] as [number, any]),
    );
    if (batch.every(item => graded.has(item.index))) return graded;
    console.error(`[Evaluation] ${label}: model skipped items (attempt ${attempt}).`);
  }
  throw new Error(`${label}: model did not grade every question`);
};

const answerOf = (item: GradingItem) =>
  item.segment.turns.filter(t => t.role === 'user').map(t => t.content || '').join('\n\n');

// Returns null when the candidate never answered anything gradable.
export const evaluateInterview = async (
  history: ChatTurn[],
  ctx: CandidateContext & { duration: string | number; matchScore: number },
  cheatCount: number = 0,
) => {
  const segments = segmentTranscript(history);
  if (!segments.length) return null;

  const seniority = getSeniority(ctx.level, ctx.position);
  const structure = getInterviewStructure(ctx.duration, seniority);
  let mainIndex = 0;
  const items: GradingItem[] = segments.map((segment, i) => ({
    index: i + 1,
    kind: segment.kind === 'intro' ? 'intro' : getPhaseForMain(++mainIndex, structure),
    segment,
  }));

  const batchSize = ctx.isVip && process.env.GEMINI_API_KEY ? GRADING_BATCH.gemini : GRADING_BATCH.groq;
  const batches: GradingItem[][] = [];
  for (let i = 0; i < items.length; i += batchSize) batches.push(items.slice(i, i + batchSize));

  // Sequential on purpose: parallel calls would only collide on Groq's per-minute token limit.
  const graded: GradedItem[] = [];
  for (const [n, batch] of batches.entries()) {
    const results = await gradeBatch(batch, ctx, `Interview Grading ${n + 1}/${batches.length}`);
    for (const item of batch) {
      const g = results.get(item.index);
      graded.push({
        index: item.index,
        kind: item.kind,
        // Question and answer come from the stored transcript, not from the model: copying them back
        // cost output tokens and let the model paraphrase what the candidate said.
        question: item.segment.turns[0]?.content || '',
        answer: answerOf(item),
        score: clamp(g?.score, 0, 10),
        status: typeof g?.status === 'string' ? g.status : 'incorrect',
        correctReview: typeof g?.correctReview === 'string' ? g.correctReview : '',
        feedback: typeof g?.feedback === 'string' ? g.feedback : '',
      });
    }
  }

  const summary = await callAI(
    SUMMARY_SYSTEM_PROMPT(ctx.lang, ctx.position, ctx.level),
    budget => getSummaryUserPrompt(
      graded,
      { cv: cvFor(ctx, budget), jd: truncate(ctx.jdText, budget.jd), matchScore: ctx.matchScore },
      ctx.lang,
      Math.min(1500, Math.max(150, Math.floor(budget.evalHistory / (graded.length * 3)))),
    ),
    'Interview Summary',
    { temperature: 0.1, isVip: ctx.isVip, groqMaxTokens: 1800, patient: true },
  );
  // Without a breakdown every criterion would default to 0 and the interview would be saved as REJECT.
  if (!summary?.breakdown || typeof summary.breakdown !== 'object') throw new Error('Interview Summary: missing breakdown');
  return finalizeEvaluation({ ...summary, detailedFeedback: graded }, seniority, cheatCount, ctx.lang);
};
