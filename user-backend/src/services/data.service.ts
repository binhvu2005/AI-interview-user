import { Question } from '../models/question.model';
import Metadata from '../models/metadata.model';

const LEVEL_ORDER: Record<string, number> = {
  'intern': 1,
  'internship': 1,
  'thực tập': 1,
  'fresher': 2,
  'mới tốt nghiệp': 2,
  'junior': 3,
  'nhân viên': 3,
  'mid': 4,
  'middle': 4,
  'mid-level': 4,
  'chuyên viên': 4,
  'senior': 5,
  'cao cấp': 5,
  'lead': 6,
  'tech lead': 6,
  'team lead': 6,
  'staff': 7,
  'principal': 8,
  'architect': 9,
  'manager': 10,
  'director': 11,
  'executive': 12,
  'vp': 13
};

const getLevelWeight = (name: string): number => {
  const lower = (name || '').toLowerCase().trim();
  for (const [key, weight] of Object.entries(LEVEL_ORDER)) {
    if (lower.includes(key)) return weight;
  }
  return 50;
};

export const fetchSetupOptions = async () => {
  const data: any[] = await Metadata.find();
  const positions = data.filter((i: any) => i.type === 'position').map((i: any) => i.name);
  const levels = data
    .filter((i: any) => i.type === 'level')
    .map((i: any) => i.name)
    .sort((a: string, b: string) => getLevelWeight(a) - getLevelWeight(b));

  return { positions, levels };
};

export const fetchRandomQuestions = async (size: number = 10) => {
  return await Question.aggregate([{ $sample: { size } }]);
};
