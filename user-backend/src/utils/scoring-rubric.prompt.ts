import { getRubricWeights } from './evaluation-score';
import { getSeniority } from './seniority';
import { inlineField } from './prompt-format';

// Criteria for the overall breakdown (summary step).
export const SCORING_CRITERIA = (position: string, level: string) => {
  const { weights, fitLabel, fitDescription } = getRubricWeights(getSeniority(level, position));
  const pct = (w: number) => Math.round(w * 100);

  return `
### SCORING CRITERIA (FOR: ${inlineField(level)} ${inlineField(position)})
Grade each criterion on a 0-10 scale. The system computes the weighted total and the hiring decision from your breakdown, so grade each criterion independently and honestly.

1. technical (${pct(weights.technical)}%): Mastery of tools and fundamental concepts; precision of technical explanations.
2. problemSolving (${pct(weights.problemSolving)}%): Logical reasoning, edge-case awareness, critical thinking.
3. coding (${pct(weights.coding)}%): Code reading, bug finding, optimisation and clean code, judged from the debug item. If there is no debug item, set coding equal to your technical score and say so in the summary.
4. communication (${pct(weights.communication)}%): Clarity, structure, professional tone.
5. architectureAndFit — ${fitLabel} (${pct(weights.architectureAndFit)}%): ${fitDescription}
- A criterion the items give no evidence for scores low, never a default mid value.
- The breakdown must be consistent with the per-question scores: a candidate whose items mostly score 0-3 cannot get 7+ in technical.
`;
};

// Rules for grading one question (grading step).
export const PER_QUESTION_RULES = `
### PER-QUESTION GRADING RULES (MANDATORY)
1. ANTI-VAGUE: An answer that is very brief (< 10 words) or generic with no concrete evidence is capped at 4/10. A short answer that is exactly right for a short factual question (e.g. "O(log n)") is not vague.
2. DON'T KNOW: "I don't know" or an equivalent scores 0 for that question, status "incorrect".
3. FOLLOW-UPS: Probe and clarify turns belong to the main question they follow. The main answer carries about 70% of the item's score, the probe answers about 30%.
4. status: "correct" (8-10), "partially_correct" (4-7), "incorrect" (0-3).
`;
