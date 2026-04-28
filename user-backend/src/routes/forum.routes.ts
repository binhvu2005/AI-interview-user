import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as forumController from '../controllers/forum.controller';

const router = Router();

router.get('/posts', forumController.getPosts);
router.post('/posts', authMiddleware as any, forumController.createPost);
router.get('/posts/:id', forumController.getPostDetail);
router.post('/posts/:id/like', authMiddleware as any, forumController.likePost);
router.post('/posts/:id/replies', authMiddleware as any, forumController.addReply);
router.post('/posts/:postId/replies/:replyId/like', authMiddleware as any, forumController.likeReply);

export default router;
