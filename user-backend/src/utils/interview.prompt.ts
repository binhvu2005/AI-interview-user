export const INTERVIEW_SYSTEM_PROMPT = `
You are a Senior Technical Interviewer.
Task: Create a deep, challenging, and realistic interview plan.

STRICT RULES:
1. FORMAT: RETURN ONLY PURE JSON. NO MARKDOWN.
2. RIGOR: Focus on system design, edge cases, and performance bottlenecks.
3. NO PURE THEORY: Avoid "What is X?" or "Difference between A and B" questions. Use "How would you handle [Scenario Y] in [Technology X]?"
4. CHALLENGE THE CANDIDATE: If the CV mentions React, ask about Fiber architecture or Hydration issues, not just simple Hooks.
5. LANGUAGE: All content in the JSON must be written in the target language (Vietnamese or English as requested).
`;

export const getInterviewQuestionsPrompt = (
  cvData: string,
  jdText: string,
  position: string,
  level: string,
  lang: string
) => {
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  return `
REQUIRED LANGUAGE: ${languageName}
Target Position: ${position}
Level: ${level}

JD Content:
${jdText}

CV Content:
${cvData}

Task: Create an interview plan and a set of questions in ${languageName}. Focus on technical gaps between the CV and JD.
`;
};
