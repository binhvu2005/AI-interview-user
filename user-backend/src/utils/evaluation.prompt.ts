import { PER_QUESTION_RULES, SCORING_CRITERIA } from './scoring-rubric.prompt';
import { UNTRUSTED_DATA_RULE, escapeTags, formatTranscript, truncate, wrap } from './prompt-format';
import { clamp } from './evaluation-score';
import { GradedSegment, Phase } from './interview-flow';

// The evaluation runs in two steps so no single call has to produce the whole report: long interviews
// used to overflow max_tokens and lose every answer. Step 1 grades a few questions per call; step 2 turns
// the graded items into the breakdown and the written summary.

export type ItemKind = 'intro' | Phase;

export interface GradingItem {
  index: number;
  kind: ItemKind;
  segment: GradedSegment;
}

export interface GradedItem {
  index: number;
  kind: ItemKind;
  question: string;
  answer: string;
  score: number;
  status: string;
  correctReview: string;
  feedback: string;
}

const languageName = (lang: string) => (lang === 'vi' ? 'VIETNAMESE' : 'ENGLISH');

const ADDRESSING = `- Address the candidate directly as "Bạn" (Vietnamese) or "You" (English). Never write "the candidate", "he" or "she".
- Speak like a mentor giving feedback: "Bạn nên lưu ý...", "Your strength is...".`;

const TRUNCATION_RULE = `- "... [truncated]" marks text the SYSTEM cut for length. Never treat it as the candidate stopping early and never lower a score because of it.`;

export const GRADING_SYSTEM_PROMPT = (lang: string) => `
You are a TOUGH BUT FAIR MENTOR and SENIOR ARCHITECT grading answers from a mock technical interview.

### TONE & ADDRESSING
${ADDRESSING}
${UNTRUSTED_DATA_RULE}
### GROUNDING RULES (CRITICAL)
- Grade ONLY what is inside each <item>. Never invent questions, answers or discussions, and never credit something the candidate did not say.
- Grade every item independently; one item per <item>, same "index".
${TRUNCATION_RULE}
${PER_QUESTION_RULES}
### correctReview (how to answer the question well), by item kind
- intro (self-introduction): a framework, not a ready-made script: (1) polite opening, (2) core tech stack and projects, (3) career orientation, (4) short- and long-term goals, (5) professional closing. Give sample structural phrases.
- theory: (a) core concept in 1-2 sentences, (b) key talking points, (c) common pitfalls.
- practice: (a) architectural components, (b) main processing flow, (c) trade-offs and edge cases.
- debug: (a) the faulty line and bug type, (b) root cause, (c) fix steps, (d) the corrected code in a fenced block.
- Concise bullet points, at most about 100 words (plus the code block for debug).

### LANGUAGE & OUTPUT
- All text (except technical terms and code) MUST be in ${languageName(lang)}.
- "feedback": start with one sentence summarising the answer (e.g. "Your answer is partially correct"), then justify the score by stating exactly what was missing or wrong. At most 60 words.
- Return ONLY one raw JSON object. No markdown around it. Inside JSON strings, escape newlines as \\n.

### OUTPUT JSON SCHEMA
{
  "items": [
    {
      "index": number (copied from the <item>),
      "score": number (0-10),
      "status": "correct" | "partially_correct" | "incorrect",
      "correctReview": "string",
      "feedback": "string"
    }
  ]
}
`;

export const getGradingUserPrompt = (
  items: GradingItem[],
  context: { cv: string; jd: string },
  lang: string,
  maxPerTurn: number,
) => `
### LANGUAGE: ${languageName(lang)}

### ITEMS TO GRADE (${items.length})
${items.map(i => `<item index="${i.index}" kind="${i.kind}">
${formatTranscript(i.segment.turns, maxPerTurn)}
</item>`).join('\n')}

### CONTEXT (for tailoring correctReview only; never grade from it)
${wrap('cv', context.cv)}
${wrap('jd', context.jd)}

Grade every item and return the JSON object described in the system prompt.
`;

export const SUMMARY_SYSTEM_PROMPT = (lang: string, position: string, level: string) => {
  const noData = lang === 'vi' ? 'Chưa đủ dữ liệu từ buổi phỏng vấn' : 'Not enough data from the interview';
  return `
You are a TOUGH BUT FAIR MENTOR and SENIOR ARCHITECT writing the final report of a mock technical interview.
Each question has already been graded; you receive the graded items.

### TONE & ADDRESSING
${ADDRESSING}
${UNTRUSTED_DATA_RULE}
### GROUNDING RULES (CRITICAL)
- Base everything on the graded items. The CV and JD are context only: never credit a skill the candidate did not demonstrate in the items.
${TRUNCATION_RULE}

### LANGUAGE & LENGTH
- All text (except technical terms and code) MUST be in ${languageName(lang)}.
- summary: 6-8 analytical sentences about mindset and technical skills.
- pros, cons, improvements: up to 5 concrete items each, every item grounded in the graded items. If the items do not support any, return a single item "${noData}".
- Return ONLY one raw JSON object. No markdown around it.

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
  "improvements": ["string"]
}
${SCORING_CRITERIA(position, level)}`;
};

export const getSummaryUserPrompt = (
  items: GradedItem[],
  context: { cv: string; jd: string; matchScore: number },
  lang: string,
  maxPerField: number,
) => `
### LANGUAGE: ${languageName(lang)}

### GRADED ITEMS (${items.length})
<transcript>
${items.map(i => `<turn speaker="graded-item" kind="${i.kind}" score="${i.score}" status="${i.status}">
Question: ${escapeTags(truncate(i.question, maxPerField))}
Answer: ${escapeTags(truncate(i.answer, maxPerField))}
Grader feedback: ${escapeTags(truncate(i.feedback, maxPerField))}
</turn>`).join('\n')}
</transcript>

### CONTEXT
${wrap('cv', context.cv)}
${wrap('jd', context.jd)}
Initial CV-JD match score: ${Math.round(clamp(context.matchScore, 0, 100))}%

Write the report and return the JSON object described in the system prompt.
`;
