import { Question } from '../models/question.model';
import Metadata from '../models/metadata.model';

export const fetchSetupOptions = async () => {
  const data: any[] = await Metadata.find();
  const positions = data.filter((i: any) => i.type === 'position').map((i: any) => i.name);
  const levels = data.filter((i: any) => i.type === 'level').map((i: any) => i.name);
  return { positions, levels };
};

export const fetchRandomQuestions = async (size: number = 5) => {
  return await Question.aggregate([{ $sample: { size } }]);
};
