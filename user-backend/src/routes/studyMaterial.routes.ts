import express from 'express';
import * as StudyMaterialController from '../controllers/studyMaterial.controller';

const router = express.Router();

router.get('/', StudyMaterialController.getStudyMaterials);
router.get('/:slug', StudyMaterialController.getStudyMaterialBySlug);

export default router;
