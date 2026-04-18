import express from 'express';
import * as DataController from '../controllers/data.controller';

const router = express.Router();

router.get('/setup-options', DataController.getSetupOptions);
router.get('/questions', DataController.getQuestions);

export default router;
