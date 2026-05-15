import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware as any, getNotifications);
router.patch('/:id/read', authMiddleware as any, markAsRead);
router.patch('/read-all', authMiddleware as any, markAllAsRead);

export default router;
