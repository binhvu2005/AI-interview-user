import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
}

interface QuizDetailResult {
  questionId: string;
  title: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: string;
}

interface SubmitResponse {
  score: number;
  correctCount: number;
  total: number;
  highScore: number | null;
  timeSpent: number;
  details: QuizDetailResult[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#34D399',
  medium: '#F59E0B',
  hard: '#EF4444'
};

export default function StudyQuizPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTags = searchParams.get('tags');
  const urlDifficulty = searchParams.get('difficulty') || 'all';

  // State: 'config' | 'playing' | 'result'
  const [gameState, setGameState] = useState<'config' | 'playing' | 'result'>('config');

  // Available tags compiled from study materials
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Quiz config selection
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Playing state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Result state
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load available tags on mount
  useEffect(() => {
    fetchAvailableTags();
  }, []);

  // When tags from URL are present, try to start quiz immediately
  useEffect(() => {
    if (urlTags && availableTags.length > 0) {
      const parsedTags = urlTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      setSelectedTags(parsedTags);
      setSelectedDifficulty(urlDifficulty);
      startQuiz(parsedTags, urlDifficulty);
    }
  }, [urlTags, availableTags, urlDifficulty]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [gameState]);

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return t('study.difficulty_easy');
      case 'medium': return t('study.difficulty_medium');
      case 'hard': return t('study.difficulty_hard');
      default: return t('study.difficulty_all');
    }
  };

  const fetchAvailableTags = async () => {
    setLoadingTags(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.STUDY_MATERIALS.GET_ALL}?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const materials = data.items || [];
        const tagsSet = new Set<string>();
        materials.forEach((m: any) => {
          if (m.tags && Array.isArray(m.tags)) {
            m.tags.forEach((t: string) => tagsSet.add(t.toLowerCase()));
          }
          if (m.slug) {
            tagsSet.add(m.slug.toLowerCase());
          }
        });
        // Fallback popular tags if none returned
        if (tagsSet.size === 0) {
          ['html', 'css', 'javascript', 'typescript', 'react', 'nodejs', 'mongodb', 'python', 'java'].forEach(t => tagsSet.add(t));
        }
        setAvailableTags(Array.from(tagsSet));
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      // Fallback
      setAvailableTags(['html', 'css', 'javascript', 'typescript', 'react', 'nodejs', 'mongodb', 'python', 'java']);
    } finally {
      setLoadingTags(false);
    }
  };

  const startQuiz = async (tagsToUse = selectedTags, difficultyToUse = selectedDifficulty) => {
    if (tagsToUse.length === 0) {
      toast.error(t('study.select_tags_error'));
      return;
    }

    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers([]);
    setTimeSpent(0);

    try {
      const params = new URLSearchParams({
        tags: tagsToUse.join(','),
        difficulty: difficultyToUse
      });
      const res = await fetch(`${API_ENDPOINTS.QUIZ.GET_QUESTIONS}?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('study.load_questions_error'));
      }

      if (!data.questions || data.questions.length === 0) {
        toast.error(t('study.no_questions_error'));
        setLoadingQuestions(false);
        return;
      }

      setQuestions(data.questions);
      setGameState('playing');
    } catch (err: any) {
      toast.error(err.message || t('study.load_questions_error'));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionKey: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, selectedAnswer: optionKey } : a);
      } else {
        return [...prev, { questionId, selectedAnswer: optionKey }];
      }
    });
  };

  const getSelectedAnswerForQuestion = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.selectedAnswer || '';
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - answers.length;
    if (unansweredCount > 0) {
      const confirm = window.confirm(t('results.unanswered_confirm', { count: unansweredCount }) || `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn vẫn muốn nộp bài?`);
      if (!confirm) return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(t('study.grading'));
    try {
      // Find a primary tag for high score tracking (e.g. the first tag that match our material)
      const primaryTag = selectedTags[0] || 'general';
      
      const payload = {
        answers,
        tag: primaryTag,
        timeSpent
      };

      const res = await fetchWithAuth(API_ENDPOINTS.QUIZ.SUBMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t('study.load_questions_error'));
      }

      setResult(data);
      setGameState('result');
      toast.success(t('study.submit_success'), { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || t('study.load_questions_error'), { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen pb-20 pt-6 animate-fade-in max-w-4xl mx-auto px-4 md:px-8 bg-background text-on-surface">
      
      {/* 1. CONFIG STATE */}
      {gameState === 'config' && (
        <div className="pt-6 bg-background">
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-semibold uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-[12px]">quiz</span>
            {t('study.quiz_practice')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-3">
            {t('study.quiz_title')} <span className="text-primary">{t('study.quiz_title_highlight')}</span>
          </h1>
          <p className="text-on-surface-variant text-sm mb-8 max-w-xl">
            {t('study.quiz_desc')}
          </p>

          <div className="bento-card p-6 md:p-8 space-y-8 bg-surface-container border border-outline-variant/30 rounded-2xl shadow-xl">
            {/* Tag Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {t('study.select_tags')}
              </label>
              {loadingTags ? (
                <div className="flex gap-2 flex-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-surface-container-high animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {availableTags.map(tag => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all duration-200 cursor-pointer border ${
                          active
                            ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {t('study.desired_difficulty')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['all', 'easy', 'medium', 'hard'].map(diff => {
                  const active = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold text-center border cursor-pointer transition-all duration-200 ${
                        active
                          ? 'bg-primary/10 text-primary border-primary shadow-inner'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {getDifficultyLabel(diff)}
                      {diff !== 'all' && (
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full ml-2"
                          style={{ backgroundColor: DIFFICULTY_COLORS[diff] }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => startQuiz()}
                disabled={loadingQuestions || selectedTags.length === 0}
                className="flex-1 py-3 px-6 rounded-xl bg-primary hover:bg-primary-dim text-on-primary text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                {loadingQuestions ? t('study.preparing') : t('study.start_quiz')}
              </button>
              <button
                onClick={() => navigate('/study')}
                className="py-3 px-6 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('study.back')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLAYING STATE */}
      {gameState === 'playing' && questions.length > 0 && (
        <div className="space-y-6 bg-background">
          {/* Header Dashboard of current Quiz session */}
          <div className="flex items-center justify-between bg-surface-container border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-on-surface-variant">
                {t('study.question')} <span className="text-primary text-base">{currentIdx + 1}</span> / {questions.length}
              </span>
              <div className="flex gap-1.5">
                {questions[currentIdx].tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded bg-primary/10 border border-primary/25 text-[9px] font-bold text-primary uppercase">
                    {t}
                  </span>
                ))}
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                  style={{ backgroundColor: DIFFICULTY_COLORS[questions[currentIdx].difficulty] }}
                >
                  {getDifficultyLabel(questions[currentIdx].difficulty)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
              <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
              <span className="font-mono text-sm font-bold text-on-surface">{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bento-card p-6 md:p-8 bg-surface-container border border-outline-variant/30 rounded-2xl shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-2 leading-snug">
                {questions[currentIdx].title || `${t('study.question')} ${currentIdx + 1}`}
              </h2>
              <div
                className="text-on-surface-variant text-sm leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: questions[currentIdx].content }}
              />
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {Object.entries(questions[currentIdx].options).map(([key, val]) => {
                if (!val) return null;
                const isSelected = getSelectedAnswerForQuestion(questions[currentIdx]._id) === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectAnswer(questions[currentIdx]._id, key)}
                    className={`p-4 rounded-xl text-left text-sm transition-all duration-200 flex items-start gap-3.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-inner text-primary font-semibold'
                        : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {key}
                    </span>
                    <span className="leading-relaxed">{val}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              {t('study.prev_question')}
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1 cursor-pointer"
              >
                {t('study.next_question')}
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#34D399] hover:bg-[#10B981] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-[#34D399]/20"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                {t('study.submit_quiz')}
              </button>
            )}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center items-center gap-2 flex-wrap pt-4">
            {questions.map((q, idx) => {
              const isAnswered = getSelectedAnswerForQuestion(q._id) !== '';
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-on-primary ring-2 ring-primary/30 shadow-md'
                      : isAnswered
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Quit button */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                if (window.confirm(t('study.cancel_quiz_confirm'))) {
                  setGameState('config');
                }
              }}
              className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              {t('study.cancel_quiz')}
            </button>
          </div>
        </div>
      )}

      {/* 3. RESULT STATE */}
      {gameState === 'result' && result && (
        <div className="space-y-8 animate-fade-in bg-background">
          {/* Result Card */}
          <div className="bento-card p-6 md:p-8 bg-surface-container border border-outline-variant/30 rounded-2xl shadow-xl text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full relative"
              style={{
                background: `conic-gradient(var(--c-primary) ${result.score}%, var(--c-surface-container-high) 0%)`
              }}
            >
              <div className="absolute inset-2 rounded-full bg-surface-container flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-on-surface">{result.score}%</span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {result.correctCount}/{result.total} {t('study.question').toLowerCase()}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-on-surface mb-2">{t('study.completed_title')}</h2>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                {t('study.selected_difficulty')}: <span className="font-bold text-on-surface uppercase">{getDifficultyLabel(selectedDifficulty)}</span> •
                {t('study.time_spent')}: <span className="font-bold text-on-surface">{formatTime(result.timeSpent)}</span>
              </p>
            </div>

            {/* High Score Badge */}
            {result.highScore !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 max-w-xs mx-auto">
                <span className="material-symbols-outlined text-[18px] animate-bounce">emoji_events</span>
                <div className="text-left">
                  <div className="text-[8px] font-bold uppercase tracking-wider opacity-80">{t('study.your_highest_score')}</div>
                  <div className="text-sm font-black">{result.highScore}%</div>
                </div>
              </div>
            )}

            {/* Navigation options */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={() => startQuiz()}
                className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-dim text-on-primary text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/25"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {t('study.retry')}
              </button>
              <button
                onClick={() => setGameState('config')}
                className="py-2.5 px-5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('study.change_config')}
              </button>
              <button
                onClick={() => navigate('/study')}
                className="py-2.5 px-5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('study.back_to_materials')}
              </button>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface tracking-tight px-1">{t('study.answer_details')}</h3>
            
            {result.details.map((detail, idx) => {
              const answered = detail.selectedAnswer;
              return (
                <div
                  key={detail.questionId}
                  className={`bento-card p-5 border rounded-2xl space-y-4 transition-all ${
                    detail.correct
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                          detail.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface leading-tight">
                        {detail.title || `${t('study.question')} ${idx + 1}`}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className="px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase"
                        style={{ backgroundColor: DIFFICULTY_COLORS[detail.difficulty] }}
                      >
                        {getDifficultyLabel(detail.difficulty)}
                      </span>
                      {detail.correct ? (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-400">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          {t('study.correct')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-rose-400">
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          {t('study.incorrect')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="text-on-surface-variant text-xs leading-relaxed pl-8 prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: detail.content }}
                  />

                  {/* Options display with correct/user choice indicator */}
                  <div className="grid grid-cols-1 gap-2.5 pl-8">
                    {Object.entries(detail.options).map(([key, val]) => {
                      if (!val) return null;
                      const isUserSelected = answered === key;
                      const isCorrectAnswer = detail.correctAnswer === key;
                      
                      let btnClass = 'bg-surface-container-low border-outline-variant/15 text-on-surface-variant';
                      if (isCorrectAnswer) {
                        btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold';
                      } else if (isUserSelected && !detail.correct) {
                        btnClass = 'bg-rose-500/10 border-rose-500 text-rose-400 font-semibold';
                      }

                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg text-xs leading-normal flex items-start gap-3 border ${btnClass}`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                              isCorrectAnswer
                                ? 'bg-emerald-500 text-white'
                                : isUserSelected && !detail.correct
                                ? 'bg-rose-500 text-white'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="leading-relaxed">{val}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  {detail.explanation && (
                    <div className="pl-8 pt-1">
                      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs leading-relaxed text-on-surface-variant">
                        <div className="flex items-center gap-1 text-primary font-bold uppercase tracking-wider text-[9px] mb-1">
                          <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                          {t('study.explanation')}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: detail.explanation }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
