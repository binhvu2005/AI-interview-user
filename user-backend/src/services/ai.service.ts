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
    if (!text) return { feedback: "", nextQuestion: "...", isFinished: false };

    // 1. Pre-clean: Remove common AI prefixes/suffixes and markdown
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Remove potential leading/trailing garbage like "Here is the JSON:"
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleaned);
      // Ensure it has at least one of the expected keys
      if (parsed.nextQuestion !== undefined || parsed.matchScore !== undefined || parsed.totalScore !== undefined) {
        return parsed;
      }
    } catch (e) {
      console.warn('[AI Service] Initial JSON parse failed. Trying partial extraction...');
    }

    // 2. Fallback: If no valid object structure, wrap raw text
    return {
      feedback: "",
      nextQuestion: text.substring(0, 500), // Safety limit
      isFinished: false,
      summary: text.substring(0, 200),
      matchScore: 0,
      totalScore: 0
    };
  } catch (err: any) {
    console.error('[AI Service] Fatal Extraction Error:', err.message);
    return { feedback: "", nextQuestion: "Hệ thống đang xử lý, bạn hãy tiếp tục câu trả lời nhé.", isFinished: false };
  }
};

const callGroq = async (systemPrompt: string, userPrompt: string, label: string): Promise<any> => {
  console.log(`[Groq] Calling: ${label}...`);
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 2000, 
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI returned empty message');

    console.log(`[Groq] ${label} RAW CONTENT:`, content);
    console.log(`[Groq] ${label} completed. Usage: ${response.usage?.total_tokens} tokens`);
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
  return await callGroq(CV_ANALYSIS_SYSTEM_PROMPT, userPrompt, 'CV Analysis');
};

export const generateInterviewQuestions = async (cvData: string, jdText: string, position: string, level: string, lang: string = 'vi') => {
  const truncatedCV = truncateCV(cvData);
  const userPrompt = getInterviewQuestionsPrompt(truncatedCV, jdText, position, level, lang);
  return await callGroq(INTERVIEW_SYSTEM_PROMPT, userPrompt, 'Interview Questions');
};

export const processInterviewChat = async (history: any[], cvData: string, jdText: string, position: string, level: string, lang: string = 'vi', duration: string = '15') => {
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  
  // Truncate history to stay within token limits (last 10 messages)
  const truncatedHistory = history.slice(-10);

  const userPrompt = `
### CONTEXT
- POSITION: ${position} (${level})
- DURATION: ${duration} mins
- ROUND: ${history.length / 2}
- JD: ${jdText.substring(0, 1000)}
- CV: ${cvData.substring(0, 3000)}

### HISTORY
${truncatedHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

### TASK
Respond in ${languageName}. 
STRICT: DO NOT repeat any project names or technical topics already mentioned in HISTORY.
If candidate said "don't know", pivot to a COMPLETELY NEW technical domain.
`;
  console.log('--- DEBUG: SYSTEM PROMPT ---');
  console.log(INTERVIEW_CHAT_SYSTEM_PROMPT);
  console.log('--- DEBUG: USER PROMPT ---');
  console.log(userPrompt);
  
  return await callGroq(INTERVIEW_CHAT_SYSTEM_PROMPT, userPrompt, 'Interview Chat');
};

export const evaluateInterview = async (history: any[], cvData: string, jdText: string, matchScore: number, lang: string = 'vi') => {
  const userPrompt = getEvaluationUserPrompt(history, cvData, jdText, matchScore, lang);
  return await callGroq(INTERVIEW_EVALUATION_SYSTEM_PROMPT, userPrompt, 'Interview Evaluation');
};
