import { Request, Response } from 'express';
import StudyMaterial from '../models/studyMaterial.model';

export const getStudyMaterials = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '12', search = '', category = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isPublished: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      StudyMaterial.find(filter)
        .select('name slug category bannerImage shortDescription tags order')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      StudyMaterial.countDocuments(filter)
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudyMaterialBySlug = async (req: Request, res: Response) => {
  try {
    const material = await StudyMaterial.findOne({
      slug: req.params.slug,
      isPublished: true
    });
    if (!material) return res.status(404).json({ message: 'Not found' });
    res.json(material);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
