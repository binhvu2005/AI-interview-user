export interface AnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  experienceAnalysis: {
    required: string;
    candidate: string;
    gap: string;
  };
  interviewRecommendation: {
    shouldInterview: boolean;
    focusAreas: string[];
  };
}

export interface Evaluation {
  totalScore: number;
  decision: string;
  breakdown: {
    technical: number;
    problemSolving: number;
    coding: number;
    communication: number;
    architectureAndFit: number;
  };
  summary: string;
  pros: string[];
  cons: string[];
  improvements: string[];
  detailedFeedback: {
    question: string;
    answer: string;
    score: number;
    status: 'correct' | 'partially_correct' | 'incorrect' | 'skipped';
    pros: string[];
    cons: string[];
    correctReview: string;
    feedback: string;
  }[];
}

export interface Interview {
  _id: string;
  position: string;
  level: string;
  matchScore: number;
  matchAnalysis: string;
  evaluation: Evaluation;
  isPublic?: boolean;
  createdAt: string;
}

export interface ShowcaseInterview {
  _id: string;
  position: string;
  level: string;
  duration: number;
  evaluation: {
    totalScore: number;
  };
  userId: {
    _id: string;
    fullName: string;
    targetRole: string;
    avatar: string;
  };
  createdAt: string;
}
