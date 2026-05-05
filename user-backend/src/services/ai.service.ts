import OpenAI from 'openai';
import dotenv from 'dotenv';
import { CV_ANALYSIS_SYSTEM_PROMPT, getCVAnalysisUserPrompt } from '../utils/cv-analysis.prompt';
import { INTERVIEW_SYSTEM_PROMPT, getInterviewQuestionsPrompt } from '../utils/interview.prompt';
import { INTERVIEW_CHAT_SYSTEM_PROMPT } from '../utils/chat.prompt';
import { INTERVIEW_EVALUATION_SYSTEM_PROMPT, getEvaluationUserPrompt } from '../utils/evaluation.prompt';

dotenv.config();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1',
});

const extractJSON = (text: string): any => {
  try {
    if (!text) return null;
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      let firstBrace = -1;
      let depth = 0;
      for (let i = lastBrace; i >= 0; i--) {
        if (cleaned[i] === '}') depth++;
        if (cleaned[i] === '{') depth--;
        if (depth === 0) { firstBrace = i; break; }
      }
      if (firstBrace !== -1) {
        const potentialJSON = cleaned.substring(firstBrace, lastBrace + 1);
        try {
          const parsed = JSON.parse(potentialJSON);
          Object.keys(parsed).forEach(key => {
            if (typeof parsed[key] === 'string' && /^\d+$/.test(parsed[key])) parsed[key] = Number(parsed[key]);
            if (typeof parsed[key] === 'number' && isNaN(parsed[key])) parsed[key] = 0;
          });
          return parsed;
        } catch (e) { }
      }
    }
    const matchScoreMatch = text.match(/matchScore["\s:]+(\d+)/i) || text.match(/score["\s:]+(\d+)/i);
    const isFinishedMatch = text.match(/isFinished["\s:]+(true|false)/i);
    return {
      matchScore: matchScoreMatch ? parseInt(matchScoreMatch[1]) : 0,
      totalScore: matchScoreMatch ? parseInt(matchScoreMatch[1]) : 0,
      summary: text.substring(0, 2000),
      isFinished: isFinishedMatch ? isFinishedMatch[1] === 'true' : false,
      feedback: "",
      nextQuestion: text.substring(0, 2000)
    };
  } catch (err) {
    return { matchScore: 0, summary: "Error processing AI response", isFinished: false, feedback: "Lỗi hệ thống", nextQuestion: "Vui lòng thử lại" };
  }
};

const callAI = async (systemPrompt: string, userPrompt: string, label: string): Promise<any> => {
  console.log(`[Groq] Calling: ${label}...`);
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 3000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI returned empty message');

    console.log(`[Groq] ${label} RAW CONTENT:`, content);
    return extractJSON(content);
  } catch (err: any) {
    console.error(`[Groq] ${label} FAILED:`, err.message);
    throw err;
  }
};

const truncateCV = (cvData: string) => {
  if (cvData && cvData.length > 6000) {
    return cvData.substring(0, 6000) + "... [Truncated]";
  }
  return cvData;
};

export const analyzeCVJDMatch = async (cvData: string, jdText: string, position: string, level: string, lang: string = 'vi') => {
  const truncatedCV = truncateCV(cvData);
  const userPrompt = getCVAnalysisUserPrompt(truncatedCV, jdText, position, level, lang);
  const result = await callAI(CV_ANALYSIS_SYSTEM_PROMPT, userPrompt, 'CV Analysis');

  // Ensure CV analysis defaults
  return {
    matchScore: result.matchScore ?? 0,
    summary: result.summary ?? (lang === 'vi' ? "Phân tích đang được cập nhật..." : "Analysis is being updated..."),
    matchedSkills: result.matchedSkills ?? [],
    missingSkills: result.missingSkills ?? [],
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    improvementSuggestions: result.improvementSuggestions ?? [],
    experienceAnalysis: result.experienceAnalysis ?? { required: "N/A", candidate: "N/A", gap: "N/A" },
    interviewRecommendation: result.interviewRecommendation ?? { shouldInterview: false, focusAreas: [] }
  };
};

export const generateInterviewQuestions = async (cvData: string, jdText: string, position: string, level: string, lang: string = 'vi') => {
  const truncatedCV = truncateCV(cvData);
  const userPrompt = getInterviewQuestionsPrompt(truncatedCV, jdText, position, level, lang);
  return await callAI(INTERVIEW_SYSTEM_PROMPT, userPrompt, 'Interview Questions');
};

export const processInterviewChat = async (history: any[], cvData: string, jdText: string, position: string, level: string, lang: string = 'vi', duration: string = '15') => {
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';

  // Truncate history to stay within token limits (last 10 messages)
  const truncatedHistory = history.slice(-10);

  // Check for "không biết" in the latest user response
  const lastUserMessage = [...history].reverse().find(m => m.role === 'user')?.content?.toLowerCase() || "";
  const isCandidateStruggling = lastUserMessage === "không" ||
    lastUserMessage.includes("không biết") ||
    lastUserMessage.includes("chưa rõ") ||
    lastUserMessage.includes("không có kinh nghiệm") ||
    lastUserMessage.includes("don't know") ||
    lastUserMessage.includes("not sure") ||
    (lastUserMessage.length < 5 && lastUserMessage.length > 0);


  const aiMessages = history.filter(m => m.role === 'ai');
  const currentTurn = aiMessages.length; // Total AI messages (including probes)
  const mins = parseInt(duration);
  const maxTechQuestions = mins <= 15 ? 6 : Math.min(15, 6 + Math.floor((mins - 15) / 5));

  let steeringInstruction = "";
  if (currentTurn === 0) {
    steeringInstruction = "PHASE: INTRO. Introduce Obsidian AI, welcome the candidate and ask for a BRIEF self-introduction (under 2 minutes).";
  } else if (isCandidateStruggling) {
    steeringInstruction = `
    CRITICAL INSTRUCTION: The candidate explicitly stated they DO NOT KNOW or provided a very poor/short answer. 
    ACTION REQUIRED: 
    1. DO NOT ask a probing question. DO NOT linger on this topic.
    2. In the 'feedback' JSON field, provide a VERY BRIEF correct answer (< 15 words) to the PREVIOUS question you just asked.
    3. In the 'nextQuestion' JSON field, IMMEDIATELY ask a COMPLETELY NEW MAIN QUESTION in a DIFFERENT technical domain.
    `;
  } else {
    steeringInstruction = `
    ACTION REQUIRED:
    - If their previous answer was Excellent (>7/10), DO NOT probe. Ask a NEW MAIN QUESTION.
    - If their previous answer was Vague/Mediocre (4-7/10), you may ask ONE PROBING QUESTION to test depth.
    - Keep in mind the structure: 3 Theory, 2 Practice, 1 Debug. Move towards the next phase when appropriate.
    `;
  }

  const userPrompt = `
### CONTEXT
- POSITION: ${position} (${level})
- DURATION: ${duration} mins
- TOTAL AI MESSAGES SO FAR: ${currentTurn}
- TARGET STRUCTURE: ${maxTechQuestions} MAIN questions (3 Theory, 2 Practice, 1 Debug)
- JD: ${jdText.substring(0, 1000)}
- CV: ${cvData.substring(0, 3000)}

### HISTORY
${truncatedHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

### TASK
Respond in ${languageName}. 

${steeringInstruction}

STRICT RULES:
- Every MAIN question MUST follow "Theory + Practice + Mindset" (Scenario-based). It MUST be a detailed, multi-sentence scenario. DO NOT ask short 1-sentence questions!
- NO HALLUCINATION: If candidate says "don't know", do NOT assume they have that experience.
- NO SOCIAL FILLER & NO PRAISE: Absolutely NO generic praise like "Tôi đánh giá cao", "Tuyệt vời", "Rất tốt", "I appreciate". Be direct.
- NO REPETITION: Do not repeat any question, topic, or feedback explanation from the history above. ALWAYS ask something new if transitioning to a main question.

If you estimate you have asked ${maxTechQuestions} MAIN questions (ignoring probes/intro), set isFinished: true. If currentTurn >= ${maxTechQuestions * 3 + 2}, force isFinished: true to prevent infinite loops.
`;


  return await callAI(INTERVIEW_CHAT_SYSTEM_PROMPT, userPrompt, 'Interview Chat');


};

export const evaluateInterview = async (history: any[], cvData: string, jdText: string, matchScore: number, lang: string = 'vi', position: string = '', level: string = '') => {
  const userPrompt = getEvaluationUserPrompt(history, cvData, jdText, matchScore, lang);
  return await callAI(INTERVIEW_EVALUATION_SYSTEM_PROMPT(lang, position, level), userPrompt, 'Interview Evaluation');
};
