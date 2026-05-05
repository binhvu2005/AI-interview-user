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
  const currentTurn = aiMessages.length;
  const mins = parseInt(duration);
  const maxTechQuestions = mins <= 15 ? 6 : Math.min(15, 6 + Math.floor((mins - 15) / 5));


  const totalTech = maxTechQuestions;
  const theoryCount = Math.max(1, Math.floor(totalTech * 0.5));
  const debugCount = Math.max(1, Math.floor(totalTech * 0.2));
  const practiceCount = totalTech - theoryCount - debugCount;


  const phase = currentTurn === 0 ? 'INTRO' : 
                currentTurn <= theoryCount ? 'THEORY' :
                currentTurn <= theoryCount + practiceCount ? 'PRACTICE' :
                currentTurn < maxTechQuestions ? 'DEBUG' : 'WRAP_UP';

  let turnTask = "";
  if (currentTurn === 0) {
    turnTask = "PHASE: INTRO. Introduce Obsidian AI, welcome the candidate and ask for a BRIEF self-introduction (under 2 minutes).";
  } else if (phase === 'THEORY') {
    turnTask = `PHASE: THEORY (Question ${currentTurn}/${maxTechQuestions - 1}). Ask a deep theoretical question about CORE KNOWLEDGE of the ${position} position.`;
  } else if (phase === 'PRACTICE') {
    turnTask = `PHASE: PRACTICE (Question ${currentTurn}/${maxTechQuestions - 1}). Ask a REAL-WORLD SCENARIO or ARCHITECTURE problem related to ${position} (${level}).`;
  } else if (phase === 'DEBUG') {
    turnTask = `PHASE: DEBUG CODE (Question ${currentTurn}/${maxTechQuestions - 1}). Provide a BUGGY CODE snippet or an edge-case logic issue and ask the candidate how to debug and fix it.`;
  } else {
    turnTask = "PHASE: WRAP_UP. Ask a final challenge question (Edge case) and conclude the interview. Set isFinished: true.";
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
${turnTask}

STRICT TECHNICAL STEERING (THE IRON RULES):
1. ANALYZE the LAST CANDIDATE RESPONSE in HISTORY.
2. IF score would be > 7 (Excellent): DO NOT ask follow-ups. Transition to a NEW technical domain from CV/JD immediately to save time.
3. IF score would be 4-7 (Vague/Mediocre): Ask ONE professional probing question (drill-down) to test depth. (Max 2 probing per topic).
4. IF score would be < 4 (Poor) or "don't know": 
   - Briefly explain the answer/concept (< 15 words) to maintain flow.
   - AGGRESSIVE PIVOT: IMMEDIATELY move to a COMPLETELY DIFFERENT skill/technology from CV/JD to give them a fresh chance.
   - DO NOT linger on failed topics.
5. ANTI-VAGUE PENALTY: If answer is < 10 words or generic, apply a max cap of 4/10 for this turn in your internal evaluation.

STRICT RULES:
- Every question MUST follow "Theory + Practice + Mindset" (Scenario-based).
- NO HALLUCINATION: If candidate says "don't know", do NOT assume they have that experience.
- NO SOCIAL FILLER & NO PRAISE: Absolutely NO generic praise like "Tôi đánh giá cao", "Tuyệt vời", "Rất tốt", "I appreciate". It sounds artificial. Be direct.
- NO REPETITION: Do not repeat any question or topic from the history above. ALWAYS ask something new.

If currentTurn is ${maxTechQuestions - 1}, you MUST ask a REAL-WORLD ARCHITECTURE/DEBUGGING scenario.
If currentTurn >= ${maxTechQuestions}, set isFinished: true.
`;


  return await callAI(INTERVIEW_CHAT_SYSTEM_PROMPT, userPrompt, 'Interview Chat');


};

export const evaluateInterview = async (history: any[], cvData: string, jdText: string, matchScore: number, lang: string = 'vi', position: string = '', level: string = '') => {
  const userPrompt = getEvaluationUserPrompt(history, cvData, jdText, matchScore, lang);
  return await callAI(INTERVIEW_EVALUATION_SYSTEM_PROMPT(lang, position, level), userPrompt, 'Interview Evaluation');
};
