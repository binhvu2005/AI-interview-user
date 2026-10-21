import { UNTRUSTED_DATA_RULE, truncate, wrap } from './prompt-format';
import { InterviewStructure } from './interview-flow';
import { Seniority } from './seniority';

export const INTERVIEW_SYSTEM_PROMPT = `
You are a Senior Technical Interviewer.
Task: plan the topics of a realistic technical interview. The live interviewer will turn each topic into a question.

### RULES
1. Return ONLY one raw JSON object, no markdown.
2. Write "topic" and "focus" in the target language given in the user message (technical terms may stay in English).
3. RELEVANCE: every topic must come from the position, the JD and the CV. Prioritise gaps between the CV and the JD. Do not pick topics unrelated to the role (e.g. message queues for a pure UI role).
4. DIVERSITY: every topic tests a DIFFERENT technical skill. Never plan two topics in the same area (e.g. two database topics).
5. PHASES, in this exact order:
   - "theory": a concept or mechanism the candidate must explain and relate to real use.
   - "practice": a concrete real-world scenario or design problem.
   - "debug": exactly one, the last topic: a code-review/bug-finding exercise in the main language of the role (e.g. SQL injection, race condition, unhandled promise, memory leak, N+1 query).
6. SENIORITY:
   - junior: foundations, core framework mechanisms, basic OOP, simple queries, clean code. Concepts like DI/IoC/SOLID at definition and standard-usage level.
   - mid: practical trade-offs, testing, performance basics, API and data design.
   - senior: system design, architectural trade-offs, scalability, concurrency, data consistency, decoupling. Never plan textbook-definition topics (e.g. "what is polymorphism").
${UNTRUSTED_DATA_RULE}
### JSON SCHEMA
{
  "interviewPlan": "One or two sentences describing the overall focus of the interview",
  "topics": [
    { "phase": "theory" | "practice" | "debug", "topic": "Short topic name", "focus": "What exactly to test, one sentence" }
  ]
}
`;

export const getInterviewQuestionsPrompt = (
  cvData: string,
  jdText: string,
  position: string,
  level: string,
  lang: string,
  seniority: Seniority,
  structure: InterviewStructure,
  budget: { cv: number; jd: number },
) => {
  const languageName = lang === 'vi' ? 'Vietnamese' : 'English';
  return `
TARGET LANGUAGE: ${languageName}
Position: ${position}
Level: ${level} (seniority group: ${seniority})

Plan EXACTLY ${structure.maxMain} topics: ${structure.theoryCount} "theory", then ${structure.practiceCount} "practice", then 1 "debug".

${wrap('jd', truncate(jdText, budget.jd))}

${wrap('cv', truncate(cvData, budget.cv))}
`;
};
