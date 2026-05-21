import { User } from '../models/user.model';

/**
 * Checks if a user's VIP status has expired.
 * If expired, automatically updates the database to set isVip = false, vipPlan = 'none', and vipExpiresAt = null.
 * @param user The Mongoose user document to check.
 * @returns A promise that resolves to the updated isVip status (boolean).
 */
export const checkAndUpdateVipStatus = async (user: any): Promise<boolean> => {
  if (!user) return false;

  if (user.isVip && user.vipExpiresAt && new Date(user.vipExpiresAt) < new Date()) {
    user.isVip = false;
    user.vipPlan = 'none';
    user.vipExpiresAt = null;
    await user.save();
    console.log(`[VIP Expiry] Automatically downgraded user ${user.email} (VIP subscription expired).`);
    return false;
  }

  return user.isVip || false;
};
