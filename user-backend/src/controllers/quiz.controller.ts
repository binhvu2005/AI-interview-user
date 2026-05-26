import { Request, Response } from 'express';
import Question from '../models/question.model';
import QuizHighScore from '../models/QuizResult.model';

// GET /quiz/questions?tags=react,javascript&difficulty=easy&limit=10
export const getQuizQuestions = async (req: Request, res: Response) => {
  try {
    const { tags = '', difficulty = '' } = req.query;
    const tagList = (tags as string).split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    if (tagList.length === 0) {
      return res.status(400).json({ message: 'At least one tag is required' });
    }

    const filter: any = { tags: { $in: tagList } };
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    // Get 5 easy, 3 medium, 2 hard - random from matching pool
    let questions: any[] = [];

    if (!difficulty || difficulty === 'all') {
      const [easy, medium, hard] = await Promise.all([
        Question.aggregate([{ $match: { ...filter, difficulty: 'easy' } }, { $sample: { size: 5 } }]),
        Question.aggregate([{ $match: { ...filter, difficulty: 'medium' } }, { $sample: { size: 3 } }]),
        Question.aggregate([{ $match: { ...filter, difficulty: 'hard' } }, { $sample: { size: 2 } }]),
      ]);
      questions = [...easy, ...medium, ...hard];

      // If not enough questions in some categories, fill from others
      if (questions.length < 10) {
        const existingIds = questions.map(q => q._id);
        const extra = await Question.aggregate([
          { $match: { ...filter, _id: { $nin: existingIds } } },
          { $sample: { size: 10 - questions.length } }
        ]);
        questions = [...questions, ...extra];
      }
    } else {
      questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: 10 } }
      ]);
    }

    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);

    // Remove correctAnswer and explanation from response (anti-cheat)
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      title: q.title,
      content: q.content,
      tags: q.tags,
      difficulty: q.difficulty,
      options: q.options,
    }));

    res.json({ questions: safeQuestions, total: safeQuestions.length });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// POST /quiz/submit
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { answers, tag, timeSpent } = req.body;
    // answers: [{ questionId, selectedAnswer }]
    // tag: primary tag for high score tracking

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const questionIds = answers.map((a: any) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    let correctCount = 0;
    const details = answers.map((a: any) => {
      const q = questionMap.get(a.questionId);
      if (!q) return { questionId: a.questionId, correct: false, selectedAnswer: a.selectedAnswer, correctAnswer: 'N/A', explanation: '' };
      const isCorrect = q.correctAnswer === a.selectedAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        title: q.title,
        content: q.content,
        options: q.options,
        correct: isCorrect,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty,
      };
    });

    const score = Math.round((correctCount / answers.length) * 100);

    // Save/update high score if user is authenticated
    const userId = (req as any).userId;
    let highScore = null;
    if (userId && tag) {
      const existing = await QuizHighScore.findOne({ userId, tag: tag.toLowerCase() });
      if (existing) {
        existing.totalAttempts += 1;
        existing.lastAttemptAt = new Date();
        if (score > existing.highestScore) {
          existing.highestScore = score;
        }
        await existing.save();
        highScore = existing.highestScore;
      } else {
        const newRecord = new QuizHighScore({
          userId,
          tag: tag.toLowerCase(),
          highestScore: score,
          totalAttempts: 1,
          lastAttemptAt: new Date()
        });
        await newRecord.save();
        highScore = score;
      }
    }

    res.json({
      score,
      correctCount,
      total: answers.length,
      highScore,
      timeSpent,
      details
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /quiz/high-scores
export const getHighScores = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.json([]);

    const scores = await QuizHighScore.find({ userId }).select('tag highestScore totalAttempts lastAttemptAt');
    res.json(scores);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
