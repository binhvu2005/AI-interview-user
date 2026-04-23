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
  const result = await callAI(CV_ANALYSIS_SYSTEM_PROMPT(lang), userPrompt, 'CV Analysis');
  
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
  const currentTurn = aiMessages.length;
  const mins = parseInt(duration);
  const maxTechQuestions = mins <= 15 ? 6 : Math.min(15, 6 + Math.floor((mins - 15) / 5));


  const totalTech = maxTechQuestions;
  const theoryCount = Math.max(1, Math.floor(totalTech * 0.5));
  const debugCount = Math.max(1, Math.floor(totalTech * 0.2));
  const practiceCount = totalTech - theoryCount - debugCount;


  const theoryEnd = theoryCount;
  const practiceEnd = theoryCount + practiceCount;

  let turnTask = "";
  if (currentTurn === 0) {
    turnTask = lang === 'vi' 
      ? "Chào mừng ứng viên bằng tư cách Obsidian AI. Yêu cầu ứng viên giới thiệu bản thân ngắn gọn. Tuyệt đối chưa hỏi kiến thức chuyên môn ở Turn 0."
      : "Welcome the candidate as Obsidian AI. Ask for a brief self-introduction. DO NOT ask technical questions yet.";
  } else if (currentTurn <= theoryEnd) {
    turnTask = lang === 'vi'
      ? "GIAI ĐOẠN 1: KIẾN THỨC NỀN TẢNG. Phản hồi tự nhiên (ví dụ: 'Tôi đã rõ', 'Cảm ơn bạn') rồi hỏi 1 câu hỏi lý thuyết chuyên sâu. Cấm dùng câu 'Câu trả lời ngắn gọn và rõ ràng'."
      : "PHASE 1: FUNDAMENTALS. Provide a natural human-like reaction, then ask a deep theoretical question. AVOID repetitive robotic phrases.";
  } else if (currentTurn <= practiceEnd) {
    turnTask = lang === 'vi'
      ? "GIAI ĐOẠN 2: TÌNH HUỐNG THỰC TẾ. Phản hồi như một người phỏng vấn thật, sau đó đưa ra một kịch bản dự án phức tạp liên quan đến CV/JD và hỏi cách giải quyết."
      : "PHASE 2: PRACTICAL SCENARIOS. React naturally, then present a complex project scenario from the CV/JD and ask for a solution.";
  } else if (currentTurn <= totalTech) {
    turnTask = lang === 'vi'
      ? "GIAI ĐOẠN 3: TƯ DUY KIẾN TRÚC & DEBUG. Đưa ra một đoạn mã có lỗi hoặc một vấn đề hệ thống hóc búa để ứng viên tìm lỗi và tối ưu hóa."
      : "PHASE 3: ARCHITECTURE & DEBUGGING. Provide a buggy code snippet or a tough system issue for the candidate to fix and optimize.";
  } else {
    turnTask = lang === 'vi'
      ? "KẾT THÚC. Tổng kết ngắn gọn buổi phỏng vấn và chào tạm biệt. Đặt 'isFinished' là true."
      : "CONCLUSION. Briefly summarize and say goodbye. Set 'isFinished' to true.";
  }




  const userPrompt = `
### CONTEXT
- POSITION: ${position} (${level})
- DURATION: ${duration} mins
- CURRENT_TURN: ${currentTurn}
- MAX_TURNS: ${maxTechQuestions}
- JD: ${jdText.substring(0, 1000)}
- CV: ${cvData.substring(0, 3000)}

### HISTORY
${truncatedHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

### TASK
Respond in ${languageName}. 
<<<<<<< HEAD
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

  
=======
${turnTask}

STRICT: NEVER repeat greetings, "Welcome", or social filler after Turn 0.
STRICT: All questions MUST follow "Theory + Practice + Mindset" (Scenario-based).
${isCandidateStruggling ? "FORCED PIVOT: Candidate doesn't know. 1. Explain the previous topic briefly (< 10 words). 2. IMMEDIATELY switch to a COMPLETELY DIFFERENT skill from the CV/JD. 3. Ask a NEW technical scenario-based question (T-P-M). DO NOT ask 'Have you used X?', instead ask 'How would you handle Scenario Y using X?'." : ""}
STRICT: DO NOT repeat any topic, technology, or question from the history above.
STRICT: DO NOT list skills or use introductory fluff.
`;


>>>>>>> 3048a86 (Update: sửa lỗi gọi API và CORS)
  return await callAI(INTERVIEW_CHAT_SYSTEM_PROMPT, userPrompt, 'Interview Chat');


};

export const evaluateInterview = async (history: any[], cvData: string, jdText: string, matchScore: number, lang: string = 'vi', position: string = '', level: string = '') => {
  const userPrompt = getEvaluationUserPrompt(history, cvData, jdText, matchScore, lang);
  return await callAI(INTERVIEW_EVALUATION_SYSTEM_PROMPT(lang, position, level), userPrompt, 'Interview Evaluation');
};
