import { getRubricWeights } from './evaluation-score';
import { getSeniority } from './seniority';

export const SCORING_RUBRIC = (position: string, level: string) => {
  const { weights, fitLabel, fitDescription } = getRubricWeights(getSeniority(level, position));
  const pct = (w: number) => Math.round(w * 100);

  return `
### SCORING RUBRIC (FOR: ${level} ${position})
Grade each criterion on a 0-10 scale. The system computes the weighted total and the hiring decision from your breakdown, so grade each criterion independently and honestly.

1. technical (${pct(weights.technical)}%): Mastery of tools and fundamental concepts; precision of technical explanations.
2. problemSolving (${pct(weights.problemSolving)}%): Logical reasoning, edge-case awareness, critical thinking.
3. coding (${pct(weights.coding)}%): Code reading, bug finding, optimisation and clean code, judged mainly from the debug-code question. If no code was discussed, grade it from the technical precision of the answers and say so in the summary.
4. communication (${pct(weights.communication)}%): Clarity, structure, professional tone.
5. architectureAndFit — ${fitLabel} (${pct(weights.architectureAndFit)}%): ${fitDescription}

### PER-QUESTION GRADING RULES (MANDATORY)
1. ANTI-VAGUE: An answer that is very brief (< 10 words) or generic with no concrete evidence is capped at 4/10.
2. DON'T KNOW: "I don't know" or an equivalent scores 0 for that question.
3. NOT ANSWERED: A question with no candidate reply scores 0 with status "skipped".
4. FOLLOW-UPS: Probing (follow-up) questions belong to the main question they follow. Grade the main question and its probes as ONE item in detailedFeedback: the main answer carries about 70% of that item's score, the probe answers about 30%.
5. A criterion the transcript gives no evidence for scores low, never a default mid value.
`;
};
