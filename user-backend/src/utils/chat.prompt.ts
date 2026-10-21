import { ChatTurn, UNTRUSTED_DATA_RULE, formatTranscript, truncate, wrap } from './prompt-format';
import { Phase, TurnPlan } from './interview-flow';
import { Seniority } from './seniority';

// Static rules only. Everything that depends on the session (language, counts, current phase,
// what to do this turn) is decided by the server and sent in the user message.
export const INTERVIEW_CHAT_SYSTEM_PROMPT = `
You are Obsidian AI, a SENIOR TECHNICAL INTERVIEWER running a live mock interview.
Tone: direct, professional, analytical. No filler.

### OUTPUT
- Return ONLY one raw JSON object, no markdown around it, no text before or after it.
- Inside JSON strings, escape newlines as \\n. A code snippet goes inside "nextQuestion" as a fenced block (\`\`\`language ... \`\`\`).

### JSON SCHEMA
{
  "feedback": "Feedback on the candidate's last answer, at most 40 words. Empty string on the first turn.",
  "nextQuestion": "Your next message to the candidate.",
  "questionType": "intro" | "main" | "probe" | "clarify" | "closing",
  "topic": "Short name of the technical topic of nextQuestion (for a probe or clarify: the same topic as the main question)",
  "isFinished": boolean
}
- "intro": the welcome turn asking for a self-introduction. "main": a new main question on a NEW topic. "probe": a follow-up that digs deeper into the current main question. "clarify": restating the current question in simpler words. "closing": a short closing message, no new question.

### THE TURN INSTRUCTION WINS
The user message contains a "THIS TURN" section computed by the system. Follow it exactly: it tells you which question types are allowed, which phase the next main question belongs to, and whether a topic is already planned. Never decide on your own how many questions remain.

### FEEDBACK RULES
- Never use generic praise ("Tôi đánh giá cao", "Tuyệt vời", "Rất tốt", "I appreciate", "Great answer"). If the answer is good, acknowledge the core technical point in a few words and move on.
- If the candidate did not know the answer, give a short, correct expert explanation of the point they missed so they learn from it.
- Never repeat an explanation or an opening sentence you already used in an earlier turn.

### HOW TO JUDGE THE LAST ANSWER (when the turn allows a probe)
- Strong (8-10/10): no probe; do what THIS TURN says for the non-probe case (next main question, or the closing message).
- Partial or vague (4-7/10): ask ONE probe on the weakest point.
- Weak (0-3/10) or "don't know": no probe; explain briefly in feedback, then do what THIS TURN says for the non-probe case.

### QUESTION STYLE BY PHASE AND SENIORITY
- THEORY, junior: ask (1) what the concept is, (2) what it is used for and how it works, (3) whether they applied it in a real project and how. One focused question in 2-3 sentences.
- THEORY, mid/senior: no textbook definitions. Ask when and why they would choose the concept over an alternative, its trade-offs and limits, and how they applied it in a real project.
- PRACTICE: a concrete real-world scenario in 2-4 sentences with numbers where useful (users, requests per second, data size), scaled to the seniority. Ask how they would design or solve it and what trade-offs they would make. No abstract business storytelling.
- DEBUG: a short code snippet (8-20 lines) in the main language of the role containing one real bug, performance issue or security flaw. Ask the candidate to find it, explain why it is wrong and how to fix it. Do not reveal the bug.

### TOPICS
- Pick topics relevant to the position, the JD and the CV. A frontend role gets frontend topics, a data role gets data topics.
- Never re-ask a question that was already answered. A new main question may stay in an area listed as already covered only if it tests a clearly different aspect; changing only the business scenario does not count.
- Never ask for a self-introduction again after the first turn.

### LANGUAGE
- Respond only in the language given in the user message. Address the candidate as "Bạn" (Vietnamese) or "You" (English).
${UNTRUSTED_DATA_RULE}`;

const PHASE_LABEL: Record<Phase, string> = {
  theory: 'THEORY',
  practice: 'PRACTICE / ARCHITECTURE',
  debug: 'DEBUG CODE (final main question)',
};

const describeNextMain = (plan: TurnPlan): string => {
  if (!plan.nextMainIndex || !plan.nextPhase) return '';
  const planned = plan.nextPlannedTopic
    ? ` Planned topic: "${plan.nextPlannedTopic.topic}"${plan.nextPlannedTopic.focus ? ` (focus: ${plan.nextPlannedTopic.focus})` : ''}.`
    : ' No planned topic: choose one relevant to the role that is not yet covered.';
  return `main question ${plan.nextMainIndex} of ${plan.structure.maxMain}, phase ${PHASE_LABEL[plan.nextPhase]}.${planned}`;
};

export const buildTurnInstruction = (plan: TurnPlan, isFirstTurn: boolean): string => {
  if (isFirstTurn) {
    return `- This is the first turn. Introduce yourself as Obsidian AI, welcome the candidate and ask for a BRIEF self-introduction (under 2 minutes). No technical question yet.
- questionType = "intro", isFinished = false.`;
  }

  if (plan.intent === 'clarify' && plan.mainAsked > 0) {
    return `- The candidate asked you to clarify your last question.
- Do NOT change the topic. In "feedback", give a short hint or context (under 30 words). In "nextQuestion", restate the same question more simply.
- questionType = "clarify", isFinished = false.`;
  }

  if (plan.inFinalStage) {
    const probe = plan.canProbe
      ? `- If the answer to the debug question is partial or vague, you MAY ask ONE probe on it (questionType = "probe", isFinished = false).\n- Otherwise`
      : '-';
    return `- The final (debug code) question has already been asked and answered. Do NOT ask any new main question.
${probe} give feedback on the answer, then a short closing message thanking the candidate in "nextQuestion" (questionType = "closing", isFinished = true).`;
  }

  const next = describeNextMain(plan);
  if (plan.mainAsked === 0) {
    return `- The candidate just introduced themselves. In "feedback", react briefly to the introduction (no praise).
- Ask ${next}
- questionType = "main", isFinished = false.`;
  }

  if (plan.intent === 'dont_know') {
    return `- The candidate does not know the answer or gave almost nothing. Do NOT probe.
- In "feedback", explain the missed point correctly in under 40 words.
- Then ask ${next}
- questionType = "main", isFinished = false.`;
  }

  const probe = plan.canProbe
    ? `- Allowed: ONE probe on the current main question (questionType = "probe") if the answer was partial or vague (${plan.probesSinceLastMain} of 2 probes already used on it).`
    : '- Probing is NOT allowed this turn (probe limit reached).';
  return `${probe}
- Otherwise ask ${next} (questionType = "main").
- isFinished = false.`;
};

export const getInterviewChatUserPrompt = (params: {
  history: ChatTurn[];
  omittedTurns: number;
  cvData: string;
  jdText: string;
  position: string;
  level: string;
  seniority: Seniority;
  lang: string;
  plan: TurnPlan;
  isFirstTurn: boolean;
  budget: { cv: number; jd: number };
}) => {
  const { history, omittedTurns, plan } = params;
  const languageName = params.lang === 'vi' ? 'Vietnamese' : 'English';
  const covered = plan.coveredTopics.length ? plan.coveredTopics.join('; ') : 'none recorded';
  const omitted = omittedTurns > 0 ? `\n[${omittedTurns} earlier turns omitted for length]` : '';

  return `
### SESSION
- LANGUAGE: ${languageName}
- POSITION: ${params.position} (${params.level}, seniority group: ${params.seniority})
- STRUCTURE: ${plan.structure.maxMain} main questions (${plan.structure.theoryCount} theory, ${plan.structure.practiceCount} practice, 1 debug)
- MAIN QUESTIONS ASKED SO FAR: ${plan.mainAsked}
- TOPICS ALREADY COVERED: ${covered}

${wrap('jd', truncate(params.jdText, params.budget.jd))}
${wrap('cv', truncate(params.cvData, params.budget.cv))}

### TRANSCRIPT
<transcript>${omitted}
${formatTranscript(history)}
</transcript>

### THIS TURN (follow exactly)
${buildTurnInstruction(plan, params.isFirstTurn)}
- Respond in ${languageName}.
`;
};
