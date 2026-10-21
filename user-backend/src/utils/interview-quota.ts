import Interview from '../models/Interview';
import InterviewSession from '../models/InterviewSession';

export const FREE_INTERVIEWS_PER_MONTH = 3;

const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// A session counts as soon as it is created, so abandoning an interview before it is saved does not
// give the attempt back. Interviews saved before sessions existed have no sessionId and are added on top.
export const countInterviewsThisMonth = async (userId: any): Promise<number> => {
  const since = startOfMonth();
  const [sessions, legacy] = await Promise.all([
    InterviewSession.countDocuments({ userId, createdAt: { $gte: since } }),
    Interview.countDocuments({ userId, createdAt: { $gte: since }, sessionId: { $exists: false } }),
  ]);
  return sessions + legacy;
};
