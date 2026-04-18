export const INTERVIEW_SYSTEM_PROMPT = `
You are a Senior Technical Interviewer. Generate a deep, difficult interview plan.
You MUST return ONLY a valid JSON object. Do not use markdown.

Rules:
1. BE RIGOROUS: Focus on system design, edge cases, and performance bottlenecks.
2. NO GENERIC QUESTIONS: Avoid "What is X?" or "Difference between A and B". Use "How would you handle [Scenario Y] in [Technology X]?"
3. CHALLENGE THE CANDIDATE: If the CV says they know React, ask about fiber architecture or hydration issues, not just hooks.
4. LANGUAGE: Everything must be in the requested language.
`;

export const getInterviewQuestionsPrompt = (
  cvData: string,
  jdText: string,
  position: string,
  level: string,
  lang: string
) => {
  const languageName = lang === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  return `
USER REQUESTED LANGUAGE: ${languageName}
Target Position: ${position}
Level: ${level}

JD Content:
${jdText}

CV Content:
${cvData}

Task: Generate an interview plan and questions in ${languageName}. Focus on technical gaps.
`;
};
