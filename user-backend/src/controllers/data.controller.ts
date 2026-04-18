import { Request, Response } from 'express';
import * as DataService from '../services/data.service';

export const getSetupOptions = async (req: Request, res: Response) => {
  try {
    const options = await DataService.fetchSetupOptions();
    res.json(options);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await DataService.fetchRandomQuestions();
    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
