import { Seniority } from './seniority';

export type Decision = 'STRONG HIRE' | 'HIRE' | 'WEAK HIRE' | 'REJECT';

export interface Breakdown {
  technical: number;
  problemSolving: number;
  coding: number;
  communication: number;
  architectureAndFit: number;
}

export interface RubricWeights {
  weights: Breakdown;
  fitLabel: string;
  fitDescription: string;
}

const STATUSES = ['correct', 'partially_correct', 'incorrect', 'skipped'];

// Tab switches below this are treated as noise (a notification, an accidental alt-tab).
export const CHEAT_FLAG_THRESHOLD = 3;
const PENALTY_PER_SWITCH = 2;
const MAX_CHEAT_PENALTY = 20;

export const TECHNICAL_FLOOR = 5;

export const getRubricWeights = (seniority: Seniority): RubricWeights => {
  if (seniority === 'senior') {
    return {
      weights: { technical: 0.3, problemSolving: 0.2, coding: 0.1, communication: 0.1, architectureAndFit: 0.3 },
      fitLabel: 'ARCHITECTURE & SYSTEM DESIGN',
      fitDescription: 'System design, scalability, trade-offs, and high-level architecture.',
    };
  }
  if (seniority === 'junior') {
    return {
      weights: { technical: 0.3, problemSolving: 0.25, coding: 0.15, communication: 0.2, architectureAndFit: 0.1 },
      fitLabel: 'POTENTIAL & ADAPTABILITY',
      fitDescription: 'Learning speed, basic potential, and team adaptability.',
    };
  }
  return {
    weights: { technical: 0.35, problemSolving: 0.25, coding: 0.2, communication: 0.1, architectureAndFit: 0.1 },
    fitLabel: 'ARCHITECTURE & POTENTIAL',
    fitDescription: 'Growth mindset, suitability, and learning potential.',
  };
};

export const clamp = (value: any, min: number, max: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

export const stringList = (value: any, max = 5): string[] =>
  Array.isArray(value) ? value.filter(v => typeof v === 'string' && v.trim()).slice(0, max) : [];

export const decide = (totalScore: number, technical: number): Decision => {
  if (technical < TECHNICAL_FLOOR) return 'REJECT';
  const score = totalScore / 10;
  if (score >= 8.5) return 'STRONG HIRE';
  if (score >= 7) return 'HIRE';
  if (score >= 6) return 'WEAK HIRE';
  return 'REJECT';
};

export const INTERVIEW_RECOMMENDATION_THRESHOLD = 50;

// Computed from the same matchScore the UI shows, so "42% match" can never sit next to "should interview".
// The model only reports whether a core skill is missing; it does not add up scores.
export const shouldRecommendInterview = (matchScore: number, coreSkillMissing: unknown): boolean =>
  matchScore >= INTERVIEW_RECOMMENDATION_THRESHOLD && coreSkillMissing !== true;

export const getCheatPenalty =(cheatCount: number) => {
  const tabSwitches = Math.max(0, Math.floor(Number(cheatCount) || 0));
  const flagged = tabSwitches >= CHEAT_FLAG_THRESHOLD;
  const penalty = flagged ? Math.min(MAX_CHEAT_PENALTY, tabSwitches * PENALTY_PER_SWITCH) : 0;
  return { tabSwitches, flagged, penalty };
};

// The model only grades; totalScore, decision and the integrity penalty are computed here because
// LLMs are unreliable at arithmetic and at applying hard rules.
export const finalizeEvaluation = (raw: any, seniority: Seniority, cheatCount: number, lang: string) => {
  const { weights } = getRubricWeights(seniority);
  const b = raw?.breakdown || {};
  const breakdown: Breakdown = {
    technical: clamp(b.technical, 0, 10),
    problemSolving: clamp(b.problemSolving, 0, 10),
    coding: clamp(b.coding, 0, 10),
    communication: clamp(b.communication, 0, 10),
    architectureAndFit: clamp(b.architectureAndFit, 0, 10),
  };

  const weighted = (Object.keys(weights) as (keyof Breakdown)[])
    .reduce((acc, key) => acc + breakdown[key] * weights[key], 0);
  const integrity = getCheatPenalty(cheatCount);
  const totalScore = Math.max(0, Math.round(weighted * 10) - integrity.penalty);

  const cons = stringList(raw?.cons);
  if (integrity.flagged) {
    cons.unshift(lang === 'vi'
      ? `Hệ thống ghi nhận bạn rời khỏi tab phỏng vấn ${integrity.tabSwitches} lần; điểm tổng bị trừ ${integrity.penalty} điểm.`
      : `The system recorded ${integrity.tabSwitches} tab switches during the interview; ${integrity.penalty} points were deducted from the total score.`);
  }

  const detailedFeedback = Array.isArray(raw?.detailedFeedback)
    ? raw.detailedFeedback.map((item: any) => ({
      question: String(item?.question ?? ''),
      answer: String(item?.answer ?? ''),
      score: clamp(item?.score, 0, 10),
      status: STATUSES.includes(item?.status) ? item.status : 'incorrect',
      correctReview: String(item?.correctReview ?? ''),
      feedback: String(item?.feedback ?? ''),
    }))
    : [];

  return {
    totalScore,
    decision: decide(totalScore, breakdown.technical),
    breakdown,
    summary: typeof raw?.summary === 'string' ? raw.summary : '',
    pros: stringList(raw?.pros),
    cons: cons.slice(0, 6),
    improvements: stringList(raw?.improvements),
    detailedFeedback,
    integrity,
  };
};
