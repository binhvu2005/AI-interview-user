import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/read-all', authenticateToken, markAllAsRead);

export default router;
