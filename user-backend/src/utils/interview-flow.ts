import { Seniority } from './seniority';
import { ChatTurn } from './prompt-format';

export type QuestionType = 'intro' | 'main' | 'probe' | 'clarify' | 'closing';
export type Phase = 'theory' | 'practice' | 'debug';
export type CandidateIntent = 'answer' | 'clarify' | 'dont_know';

export interface PlannedTopic {
  phase: Phase;
  topic: string;
  focus?: string;
}

export interface InterviewStructure {
  maxMain: number;
  theoryCount: number;
  practiceCount: number;
}

export interface TurnPlan {
  structure: InterviewStructure;
  intent: CandidateIntent;
  mainAsked: number;
  probesSinceLastMain: number;
  coveredTopics: string[];
  // Phase of the main question currently on the table (null before the first main question).
  currentPhase: Phase | null;
  // Phase and planned topic of the next main question (null once the debug question has been asked).
  nextMainIndex: number | null;
  nextPhase: Phase | null;
  nextPlannedTopic: PlannedTopic | null;
  canProbe: boolean;
  // Debug question already asked: the only moves left are a probe on it or closing the interview.
  inFinalStage: boolean;
  forceFinish: boolean;
}

export const MAX_PROBES_PER_MAIN = 2;

const VALID_TYPES: QuestionType[] = ['intro', 'main', 'probe', 'clarify', 'closing'];

export const getInterviewStructure = (duration: string | number, seniority: Seniority): InterviewStructure => {
  const mins = parseInt(String(duration)) || 15;
  const maxMain = mins <= 15 ? 6 : Math.min(15, 6 + Math.floor((mins - 15) / 5));
  const theoryRatio = seniority === 'senior' ? 0.3 : 0.6;
  const theoryCount = Math.ceil((maxMain - 1) * theoryRatio);
  return { maxMain, theoryCount, practiceCount: maxMain - 1 - theoryCount };
};

export const getPhaseForMain = (index: number, s: InterviewStructure): Phase => {
  if (index >= s.maxMain) return 'debug';
  return index <= s.theoryCount ? 'theory' : 'practice';
};

const CLARIFY_PHRASES = [
  'chưa rõ câu hỏi', 'chưa hiểu câu hỏi', 'chưa rõ ý', 'chưa hiểu ý', 'giải thích thêm câu hỏi',
  'giải thích lại câu hỏi', 'làm rõ câu hỏi', 'nói rõ hơn', 'hỏi lại được không', 'nhắc lại câu hỏi',
  'clarify the question', 'explain the question', "don't understand the question", 'what do you mean',
  'rephrase the question',
];

// A message is an admission only when, after dropping filler words, nothing but one of these phrases is
// left. Matching a phrase anywhere misread real answers: "pass by value", "skip list", "O(1)", or
// "Dùng ArrayList vì không biết trước số phần tử". Anything less clear-cut is left to the model, which
// classifies the answer itself in answerAssessment.
const ADMISSIONS = [
  'không biết', 'chưa biết', 'không rõ', 'chưa rõ', 'không nhớ', 'chưa nhớ', 'quên rồi', 'chịu', 'bó tay',
  'bỏ qua', 'qua câu khác', 'không có kinh nghiệm', 'chưa có kinh nghiệm', 'chưa từng làm', 'chưa làm bao giờ',
  'chưa tìm hiểu', 'skip', 'pass', 'next', "don't know", 'dont know', 'do not know', 'no idea', 'not sure',
  'no experience', "haven't used it", 'never used it', 'i give up',
];
const FILLER_WORDS = new Set([
  'em', 'anh', 'chị', 'mình', 'tôi', 'tớ', 'dạ', 'vâng', 'ạ', 'à', 'ạh', 'ơi', 'thì', 'là', 'thật', 'sự', 'lắm', 'quá',
  'xin', 'lỗi', 'câu', 'này', 'cái', 'phần', 'đó', 'ấy', 'nha', 'nhé', 'hic', 'huhu', 'hmm', 'ừm', 'ờ', 'uh', 'um',
  'i', "i'm", 'im', 'am', 'sorry', 'honestly', 'really', 'just', 'this', 'that', 'one', 'question', 'the', 'please',
  'actually', 'well', 'ok', 'okay',
]);

const normalizeWords = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}'\s]+/gu, ' ')
    .split(/\s+/)
    .filter(w => w && !FILLER_WORDS.has(w))
    .join(' ');

export const detectCandidateIntent = (message: string = ''): CandidateIntent => {
  const text = message.trim().toLowerCase();
  // No letter or digit at all ("", "...", "?"): nothing to grade.
  if (!/[\p{L}\p{N}]/u.test(text)) return 'dont_know';
  if (text.length <= 150 && CLARIFY_PHRASES.some(p => text.includes(p))) return 'clarify';
  if (text.length > 80) return 'answer';
  const core = normalizeWords(text);
  return core === '' || ADMISSIONS.includes(core) ? 'dont_know' : 'answer';
};

// Interviewer turns the client tagged as transient (e.g. "AI is busy" errors) are not part of the interview.
export const cleanHistory = (history: ChatTurn[] = []): ChatTurn[] =>
  history.filter(m => (m.role === 'ai' || m.role === 'user') && m.questionType !== 'system');

const isTagged = (history: ChatTurn[]) => history.some(m => m.role === 'ai' && m.questionType);

export const countMainQuestions = (history: ChatTurn[]): number => {
  const aiTurns = history.filter(m => m.role === 'ai');
  if (isTagged(history)) return aiTurns.filter(m => m.questionType === 'main').length;
  // Legacy clients send no tags: treat every interviewer turn after the welcome as a main question.
  return Math.max(0, aiTurns.length - 1);
};

const countProbesSinceLastMain = (history: ChatTurn[]): number => {
  if (!isTagged(history)) return 0;
  let probes = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.role !== 'ai') continue;
    if (m.questionType === 'main') break;
    if (m.questionType === 'probe') probes++;
  }
  return probes;
};

// Look topics up by phase and rank inside that phase: the planner may return fewer topics than asked,
// and a positional lookup would then hand the debug topic to a practice question.
export const pickPlannedTopic = (topics: PlannedTopic[], index: number, s: InterviewStructure): PlannedTopic | null => {
  const phase = getPhaseForMain(index, s);
  const rank = phase === 'theory' ? index - 1 : phase === 'practice' ? index - 1 - s.theoryCount : 0;
  return topics.filter(t => t.phase === phase)[rank] || null;
};

export const planTurn = (
  history: ChatTurn[],
  structure: InterviewStructure,
  plannedTopics: PlannedTopic[] = [],
): TurnPlan => {
  const aiCount = history.filter(m => m.role === 'ai').length;
  const lastUser = [...history].reverse().find(m => m.role === 'user')?.content || '';
  const intent = detectCandidateIntent(lastUser);
  const mainAsked = countMainQuestions(history);
  const probesSinceLastMain = countProbesSinceLastMain(history);
  const coveredTopics = history
    .filter(m => m.role === 'ai' && m.questionType === 'main' && m.topic)
    .map(m => m.topic as string);

  const inFinalStage = mainAsked >= structure.maxMain;
  const nextMainIndex = inFinalStage ? null : mainAsked + 1;

  return {
    structure,
    intent,
    mainAsked,
    probesSinceLastMain,
    coveredTopics,
    currentPhase: mainAsked > 0 ? getPhaseForMain(mainAsked, structure) : null,
    nextMainIndex,
    nextPhase: nextMainIndex ? getPhaseForMain(nextMainIndex, structure) : null,
    nextPlannedTopic: nextMainIndex ? pickPlannedTopic(plannedTopics, nextMainIndex, structure) : null,
    canProbe: mainAsked > 0 && intent === 'answer' && probesSinceLastMain < MAX_PROBES_PER_MAIN,
    inFinalStage,
    forceFinish: aiCount >= structure.maxMain * 3 + 2,
  };
};

const sameTopic = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const INTENTS: CandidateIntent[] = ['answer', 'clarify', 'dont_know'];

// The keyword check only catches clear-cut messages; for everything else the model's own reading of the
// answer (answerAssessment.intent) decides.
export const resolveIntent = (raw: any, plan: TurnPlan): CandidateIntent => {
  if (plan.intent !== 'answer') return plan.intent;
  const modelIntent = raw?.answerAssessment?.intent;
  return INTENTS.includes(modelIntent) ? modelIntent : 'answer';
};

// Small models sometimes ignore the turn instruction: they re-ask a covered topic or skip the code snippet
// of the debug question. Returns a correction to send back to the model, or null when the reply is usable.
export const checkMainQuestion = (raw: any, plan: TurnPlan): string | null => {
  if (raw?.questionType !== 'main' || !plan.nextPhase || resolveIntent(raw, plan) === 'clarify') return null;
  const question = typeof raw?.nextQuestion === 'string' ? raw.nextQuestion : '';
  if (plan.nextPhase === 'debug' && !question.includes('```')) {
    return 'Your previous reply was the DEBUG CODE main question but contained no code. Ask it again with a fenced code snippet (8-20 lines) containing one real bug.';
  }
  const topic = typeof raw?.topic === 'string' ? raw.topic : '';
  const planned = plan.nextPlannedTopic?.topic;
  if (topic && !(planned && sameTopic(planned, topic)) && plan.coveredTopics.some(t => sameTopic(t, topic))) {
    return `Your previous reply re-asked the covered topic "${topic}". Ask the required main question on a different topic.`;
  }
  return null;
};

export interface ChatResult {
  feedback: string;
  nextQuestion: string;
  isFinished: boolean;
  questionType: QuestionType;
  topic: string;
}

// The model proposes; the code decides when the interview ends. The model's own isFinished is only
// honoured once the debug question has been asked and answered.
export const finalizeChatResult = (raw: any, plan: TurnPlan, isFirstTurn: boolean): ChatResult => {
  let questionType: QuestionType = VALID_TYPES.includes(raw?.questionType) ? raw.questionType : 'main';
  if (isFirstTurn) questionType = 'intro';
  // Only a main question already on the table can be clarified.
  const clarifying = !isFirstTurn && plan.mainAsked > 0 && (questionType === 'clarify' || resolveIntent(raw, plan) === 'clarify');
  if (questionType === 'clarify' && !clarifying) questionType = 'main';
  if (!plan.canProbe && questionType === 'probe' && !clarifying) questionType = 'main';

  const modelWantsToStop = raw?.isFinished === true || questionType === 'closing' || questionType === 'main';
  const isFinished = plan.forceFinish || (plan.inFinalStage && !clarifying && modelWantsToStop);
  // A question the candidate can no longer answer must not be shown as the interview closes.
  const dropQuestion = isFinished && questionType !== 'closing';
  if (isFinished) questionType = 'closing';

  return {
    feedback: typeof raw?.feedback === 'string' ? raw.feedback : '',
    nextQuestion: !dropQuestion && typeof raw?.nextQuestion === 'string' ? raw.nextQuestion : '',
    isFinished,
    questionType,
    topic: typeof raw?.topic === 'string' ? raw.topic : '',
  };
};

export interface GradedSegment {
  kind: 'intro' | 'main';
  turns: ChatTurn[];
}

// One item per main question (with its probes and clarifications) plus the self-introduction, in order.
// A question with no candidate reply is left out: it is the question the timer cut off, and grading it 0
// would punish the time limit rather than the answer.
export const segmentTranscript = (history: ChatTurn[]): GradedSegment[] => {
  const turns = cleanHistory(history);
  const tagged = isTagged(turns);
  const segments: GradedSegment[] = [];
  let seenAi = false;

  for (const m of turns) {
    if (m.role === 'ai') {
      // Legacy clients send no tags: the first interviewer turn is the welcome, every later one a main question.
      const type = tagged ? m.questionType : seenAi ? 'main' : 'intro';
      seenAi = true;
      if (type === 'closing') continue;
      if (type === 'intro' || type === 'main' || segments.length === 0) {
        segments.push({ kind: type === 'intro' ? 'intro' : 'main', turns: [m] });
        continue;
      }
    }
    segments[segments.length - 1]?.turns.push(m);
  }

  return segments
    .map(s => {
      const kept = [...s.turns];
      while (kept.length && kept[kept.length - 1].role === 'ai') kept.pop();
      return { ...s, turns: kept };
    })
    .filter(s => s.turns.some(t => t.role === 'user'));
};
