import express from 'express';
  import { authMiddleware } from '../middlewares/auth.middleware';
  import * as PaymentController from '../controllers/payment.controller';

  const router = express.Router();

  router.post('/create-checkout-session', authMiddleware, PaymentController.createCheckoutSession);
  router.post('/verify-session', authMiddleware, PaymentController.verifySession);
  router.post('/webhook', PaymentController.handleWebhook);

  export default router;
  
