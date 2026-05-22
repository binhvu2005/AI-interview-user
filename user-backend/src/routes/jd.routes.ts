import { Router } from 'express';
import * as JDController from '../controllers/jd.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, JDController.getJDs);

export default router;
