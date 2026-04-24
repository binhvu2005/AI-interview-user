export const SCORING_RUBRIC = (position: string, level: string) => {
  const isSenior = /senior|lead|staff|architect|manager/i.test(level) || /senior|lead|staff|architect|manager/i.test(position);
  const isJunior = /junior|entry|intern|fresher/i.test(level) || /junior|entry|intern|fresher/i.test(position);

  // Default Weights (Middle)
  let weights = { tech: 0.35, logic: 0.25, code: 0.20, comm: 0.10, fit: 0.10 };
  let categoryLabel = "ARCHITECTURE & POTENTIAL";
  let categoryDesc = "Growth mindset, suitability, and learning potential.";

  if (isSenior) {
    weights = { tech: 0.30, logic: 0.20, code: 0.10, comm: 0.10, fit: 0.30 };
    categoryLabel = "ARCHITECTURE & SYSTEM DESIGN";
    categoryDesc = "System design, scalability, trade-offs, and high-level architecture.";
  } else if (isJunior) {
    weights = { tech: 0.30, logic: 0.25, code: 0.15, comm: 0.20, fit: 0.10 };
    categoryLabel = "POTENTIAL & ADAPTABILITY";
    categoryDesc = "Learning speed, basic potential, and team adaptability.";
  }

  return `
### MASTER SCORING RUBRIC (DYNAMICS FOR: ${level} ${position})
Final Score (0.0 - 10.0) = Σ(Score_i * Weight_i)

1. TECHNICAL SKILLS (${weights.tech * 100}%):
   - Mastery of tools, syntax, and fundamental concepts.
   - Precision in technical explanations.

2. PROBLEM SOLVING (${weights.logic * 100}%):
   - Logical reasoning, edge-case awareness, and critical thinking.

3. CODING ABILITY (${weights.code * 100}%):
   - Optimization, clean code principles, and logic flow.

4. COMMUNICATION (${weights.comm * 100}%):
   - Clarity, structured presentation, and professional tone.

5. ${categoryLabel} (${weights.fit * 100}%):
   - ${categoryDesc}

### THE IRON RULES - MANDATORY
1. ANTI-VAGUE PENALTY: Any answer that is too brief (< 10 words) or generic (no evidence) MUST be capped at a maximum of 4/10 for that turn.
2. TECHNICAL FLOOR: If the 'Technical Skills' score is below 5.0, the system MUST automatically evaluate as REJECT, regardless of other scores.
3. FOLLOW-UP SCORING:
   - Each topic has 1 Main question (70% weight of the topic) and up to 2 Probing questions.
   - If the candidate fails a probing question (drill-down), they get 0 for that turn and the AI moves to a new topic immediately.
4. NO HALLUCINATION: If the candidate says "I don't know" or equivalent, score 0 for that turn. Briefly explain the answer and pivot.

### DECISION MAPPING
- 8.5 - 10.0: STRONG HIRE - Outstanding candidate, masters architecture and systems thinking.
- 7.0 - 8.4: HIRE - Meets standards, capable of handling the job well.
- 6.0 - 6.9: WEAK HIRE - Has foundation but many gaps, needs training.
- < 6.0: REJECT - Does not meet minimum technical requirements.
`;
};
