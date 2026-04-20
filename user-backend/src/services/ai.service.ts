import OpenAI from 'openai';
import dotenv from 'dotenv';
import { CV_ANALYSIS_SYSTEM_PROMPT, getCVAnalysisUserPrompt } from '../utils/cvAnalysisPrompt';
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
    summary: result.summary ?? "Phân tích đang được cập nhật...",
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
  const isCandidateStruggling = lastUserMessage.includes("không biết") || 
                               lastUserMessage.includes("chưa rõ") || 
                               lastUserMessage.includes("không có kinh nghiệm") ||
                               lastUserMessage.length < 5;

  // Calculate actual technical questions asked
  const hasIntro = history.some(m => 
    m.role === 'ai' && 
    (m.content.toLowerCase().includes("giới thiệu") || m.content.toLowerCase().includes("bản thân"))
  );

  const technicalQuestionsCount = history.filter(m => 
    m.role === 'ai' && 
    !m.content.includes("Chào mừng bạn") && 
    !m.content.toLowerCase().includes("giới thiệu") &&
    !m.content.toLowerCase().includes("bản thân") &&
    !m.content.toLowerCase().includes("gợi ý")
  ).length;

  const currentTurn = !hasIntro ? 0 : Math.min(technicalQuestionsCount + 1, 6);

  const userPrompt = `
### CONTEXT
- POSITION: ${position} (${level})
- DURATION: ${duration} mins
- CURRENT_TURN: ${currentTurn} of 6
- JD: ${jdText.substring(0, 1000)}
- CV: ${cvData.substring(0, 3000)}

### HISTORY
${truncatedHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

### TASK
Respond in ${languageName}. 
STRICT: Every question MUST follow the "Theory + Practice + Mindset" (T-P-M) structure.
STRICT TRUTH: If the candidate said "không biết" in HISTORY, do NOT claim they have experience in that area. Prioritize the USER's actual words over previous AI feedback.
STRICT: Ask a NEW question about a technical area NOT YET DISCUSSED in HISTORY.
${isCandidateStruggling ? "FORCED PIVOT: Candidate said they don't know. Briefly explain the previous topic in max 10 words, then IMMEDIATELY switch to a COMPLETELY DIFFERENT skill from the CV/JD." : ""}
STRICT: DO NOT repeat any topic, technology, or question from the history above.
STRICT: DO NOT list skills or use introductory fluff.
STRICT: DO NOT ask "What is X?" or "Can you explain Y?". 
STRICT: You MUST create a technical scenario and ask the candidate how they would solve it (Practice) and what trade-offs they see (Mindset).


If currentTurn is 6, you MUST ask a CODE DEBUGGING question.
If currentTurn > 6, you MUST set isFinished to true.
`;

  
  return await callAI(INTERVIEW_CHAT_SYSTEM_PROMPT, userPrompt, 'Interview Chat');
};

export const evaluateInterview = async (history: any[], cvData: string, jdText: string, matchScore: number, lang: string = 'vi') => {
  const userPrompt = getEvaluationUserPrompt(history, cvData, jdText, matchScore, lang);
  return await callAI(INTERVIEW_EVALUATION_SYSTEM_PROMPT, userPrompt, 'Interview Evaluation');
};
