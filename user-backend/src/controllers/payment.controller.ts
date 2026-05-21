import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Stripe from 'stripe';
import { User } from '../models/user.model';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

/**
 * Creates a Stripe Checkout Session for VIP subscription upgrade.
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ message: 'Stripe is not configured on this server.' });
  }

  try {
    const { plan } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Define price amounts in VND (VND is a zero-decimal currency, so 99000 = 99,000 VND)
    let amount = 199000; // default to monthly
    let planName = 'Chuẩn bị Dài hạn (30 Ngày)';
    let planDesc = 'Gói VIP 30 ngày luyện phỏng vấn AI không giới hạn.';

    if (plan === 'weekly') {
      amount = 99000;
      planName = 'Luyện thi Cấp tốc (7 Ngày)';
      planDesc = 'Gói VIP 7 ngày luyện phỏng vấn AI cấp tốc.';
    } else if (plan === '3month') {
      amount = 399000;
      planName = 'Bứt phá Sự nghiệp (3 Tháng)';
      planDesc = 'Gói VIP 3 tháng đồng hành bứt phá sự nghiệp.';
    }

    // Determine the origin for redirects
    const origin = req.headers.origin || 'http://localhost:5173';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: planName,
              description: planDesc,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/upgrade?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade?status=cancel`,
      metadata: {
        userId: userId.toString(),
        plan: plan || 'monthly',
      },
      customer_email: user.email,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
};

/**
 * Helper utility to upgrade user VIP plan details.
 */
const updateUserToVip = async (userId: string, plan: string): Promise<any> => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.isVip = true;
  user.vipPlan = plan;

  const now = new Date();
  if (plan === 'weekly') {
    user.vipExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (plan === '3month') {
    user.vipExpiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  } else {
    user.vipPlan = 'monthly';
    user.vipExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  await user.save();
  return user;
};

/**
 * Verifies a Stripe Checkout Session status immediately on user redirection.
 */
export const verifySession = async (req: AuthRequest, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ message: 'Stripe is not configured on this server.' });
  }

  try {
    const { sessionId } = req.body;
    const userId = req.user?.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const sessionUserId = session.metadata?.userId;
      const sessionPlan = session.metadata?.plan || 'monthly';

      if (!sessionUserId) {
        return res.status(400).json({ message: 'Invalid session metadata.' });
      }

      // Safeguard: make sure current logged-in user matches the session user
      if (userId && userId.toString() !== sessionUserId) {
        return res.status(403).json({ message: 'Unauthorized payment session verification.' });
      }

      // Upgrade user
      const updatedUser = await updateUserToVip(sessionUserId, sessionPlan);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User to upgrade not found.' });
      }

      return res.json({
        success: true,
        message: 'VIP status activated successfully.',
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          isVip: updatedUser.isVip,
          vipPlan: updatedUser.vipPlan,
          vipExpiresAt: updatedUser.vipExpiresAt,
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Session is not paid.' });
    }
  } catch (error: any) {
    console.error('Error verifying checkout session:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

/**
 * Handles incoming Stripe Webhook events to process payment async.
 */
export const handleWebhook = async (req: any, res: Response) => {
  if (!stripe) {
    return res.status(500).send('Stripe is not configured on this server.');
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    // If webhook secret is configured, verify signature.
    // Otherwise fallback for local dev testing without validation
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Local dev fallback or missing webhook secret
      const payloadString = req.body.toString('utf8');
      event = JSON.parse(payloadString);
      console.warn('[Stripe Webhook] Verification skipped: endpoint secret not configured.');
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || 'monthly';

    if (userId && session.payment_status === 'paid') {
      try {
        console.log(`[Stripe Webhook] Processing successful payment for user ${userId}, plan: ${plan}`);
        await updateUserToVip(userId, plan);
        console.log(`[Stripe Webhook] User ${userId} upgraded to VIP via webhook.`);
      } catch (err: any) {
        console.error('[Stripe Webhook] Error updating user VIP status in DB:', err);
        return res.status(500).send('Internal Server Error updating user');
      }
    }
  }

  res.json({ received: true });
};
