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

    // 1. Pre-clean: Remove markdown blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(cleaned);
        // Ensure matchScore is a number if it exists
        if (parsed.matchScore !== undefined) parsed.matchScore = Number(parsed.matchScore);
        return parsed;
      } catch (e) {
        console.warn('[AI Service] JSON parse failed on extracted block. Trying regex fallback...');
      }
    }

    // 2. Regex Fallback: Try to find matchScore in text if JSON fails
    const scoreMatch = text.match(/matchScore["\s:]+(\d+)/i) || text.match(/score["\s:]+(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    return {
      feedback: "",
      nextQuestion: text.substring(0, 500),
      isFinished: false,
      summary: text.substring(0, 500),
      matchScore: score,
      totalScore: 0,
      matchedSkills: [],
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      improvementSuggestions: []
    };
  } catch (err: any) {
    console.error('[AI Service] Fatal Extraction Error:', err.message);
    return { feedback: "", nextQuestion: "Hệ thống đang xử lý...", isFinished: false, matchScore: 0 };
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
      temperature: 0.2, // Lower temperature for more consistent JSON
      max_tokens: 2000,
      response_format: { type: "json_object" } // Mandatory JSON
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
