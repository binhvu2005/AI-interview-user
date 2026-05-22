import { Request, Response } from 'express';
import { JD } from '../models/jd.model';

export const getJDs = async (req: Request, res: Response) => {
  try {
    const { position } = req.query;
    const filter: any = {};
    if (position) {
      filter.position = position;
    }
    const jds = await JD.find(filter).sort({ createdAt: -1 });
    res.json(jds);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
