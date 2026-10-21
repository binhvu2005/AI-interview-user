import { SCORING_RUBRIC } from './scoring-rubric.prompt';
import { ChatTurn, UNTRUSTED_DATA_RULE, formatTranscript, truncate, wrap } from './prompt-format';
import { clamp } from './evaluation-score';
import { countMainQuestions } from './interview-flow';

export const INTERVIEW_EVALUATION_SYSTEM_PROMPT = (lang: string, position: string, level: string) => {
  const languageName = lang === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
  const noData = lang === 'vi' ? 'Chưa đủ dữ liệu từ buổi phỏng vấn' : 'Not enough data from the interview';

  return `
You are a TOUGH BUT FAIR MENTOR and SENIOR ARCHITECT.
Give a rigorous technical audit and direct feedback to the candidate after a mock interview.

### TONE & ADDRESSING
- Address the candidate directly as "Bạn" (Vietnamese) or "You" (English). Never write "the candidate", "he" or "she".
- Speak like a mentor giving feedback: "Bạn nên lưu ý...", "Your strength is...".
${UNTRUSTED_DATA_RULE}
### GROUNDING RULES (CRITICAL)
- Evaluate ONLY the turns inside <transcript>. Never invent questions, answers or discussions.
- The CV and JD are context only. Never credit a skill that the candidate did not demonstrate in the transcript.
- detailedFeedback has ONE item per MAIN question the interviewer asked, in order, starting with the self-introduction. Follow-up (probing) and clarification turns are folded into the item of the main question they follow. Interviewer turns may carry type="intro|main|probe|clarify|closing"; when the type is missing, judge from the content.
- The FIRST item is always the self-introduction, even if it was a single sentence.
- "... [truncated]" marks text the SYSTEM cut for length. Never treat it as the candidate stopping early and never lower a score because of it. In "question"/"answer", copy the text up to the marker.
- For a question with no candidate reply: "answer" = "${lang === 'vi' ? 'Không có câu trả lời' : 'No answer provided'}", "score" = 0, "status" = "skipped".
- Very short (< 10 words), generic or irrelevant answers follow the rubric's ANTI-VAGUE cap. Never write a good answer on the candidate's behalf in "answer".

### LANGUAGE & LENGTH
- All text (except technical terms and code) MUST be in ${languageName}.
- summary: 6-8 analytical sentences about mindset and technical skills.
- pros, cons, improvements: up to 5 concrete items each, every item grounded in the transcript. If the transcript does not support any item, return a single item "${noData}".
- correctReview: concise and structured (bullet points), at most about 120 words, plus a code block only for the debug question.
- Return ONLY one raw JSON object. No markdown around it. Inside JSON strings, escape newlines as \\n.

### OUTPUT JSON SCHEMA
{
  "breakdown": {
    "technical": number (0-10),
    "problemSolving": number (0-10),
    "coding": number (0-10),
    "communication": number (0-10),
    "architectureAndFit": number (0-10)
  },
  "summary": "string",
  "pros": ["string"],
  "cons": ["string"],
  "improvements": ["string"],
  "detailedFeedback": [
    {
      "question": "The exact main question asked by the interviewer",
      "answer": "The exact answer given by the candidate (main answer, then probe answers)",
      "score": number (0-10),
      "status": "correct" | "partially_correct" | "incorrect" | "skipped",
      "correctReview": "How to answer this question well. Structure by question type:
        - SELF-INTRODUCTION: a framework, not a ready-made script, customised to the CV: (1) polite opening, (2) core tech stack and projects from the CV, (3) career orientation, (4) short- and long-term goals, (5) professional closing. Give sample structural phrases.
        - THEORY: (a) core concept in 1-2 sentences, (b) key talking points, (c) common pitfalls.
        - PRACTICE / ARCHITECTURE: (a) architectural components, (b) main processing flow, (c) trade-offs and edge cases.
        - DEBUG CODE: (a) the faulty line and bug type, (b) root cause, (c) fix steps, (d) the corrected code.",
      "feedback": "Start with one sentence summarising performance (e.g. 'Your answer is partially correct'), then justify the score by stating exactly what was missing or wrong."
    }
  ]
}

### RUBRIC
${SCORING_RUBRIC(position, level)}
`;
};

export const getEvaluationUserPrompt = (
  history: ChatTurn[],
  cv: string,
  jd: string,
  matchScore: number,
  lang: string = 'vi',
  budget: { cv: number; jd: number; turn: number },
  omittedTurns: number = 0,
  mainQuestions: number = countMainQuestions(history),
) => `
### LANGUAGE: ${lang === 'vi' ? 'VIETNAMESE' : 'ENGLISH'}

### TRANSCRIPT
<transcript>${omittedTurns > 0 ? `\n[${omittedTurns} earlier turns omitted for length; grade only what is shown]` : ''}
${formatTranscript(history, budget.turn)}
</transcript>

### CONTEXT
${wrap('cv', truncate(cv, budget.cv))}
${wrap('jd', truncate(jd, budget.jd))}
Initial CV-JD match score: ${Math.round(clamp(matchScore, 0, 100))}%
${history.some(m => m.role === 'ai' && m.questionType)
  ? `Expected detailedFeedback items: ${1 + mainQuestions} (1 self-introduction + ${mainQuestions} main questions; type="probe" and type="clarify" turns are merged into their main question${omittedTurns > 0 ? '; questions in omitted turns are left out' : ''}).`
  : ''}

Audit this interview and return the JSON object described in the system prompt.
`;
