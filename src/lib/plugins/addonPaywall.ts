/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Key for persisting subscription state in localStorage
const STORAGE_KEY = 'nascent_community_addons_unlocked';
const DETAILS_KEY = 'nascent_community_addons_details';

export interface PaywallSubscriptionDetails {
  unlocked: boolean;
  plan: 'annual' | 'monthly' | 'lifetime' | 'voucher';
  planName: string;
  activatedAt: string;
  expiresAt: string;
  licenseKey: string;
  autoRenew: boolean;
}

const DEFAULT_DETAILS: PaywallSubscriptionDetails = {
  unlocked: false,
  plan: 'annual',
  planName: 'Annual Pass (7-Day Trial)',
  activatedAt: '',
  expiresAt: '',
  licenseKey: '',
  autoRenew: true,
};

type Listener = (unlocked: boolean, details: PaywallSubscriptionDetails) => void;
const listeners = new Set<Listener>();

function notify(unlocked: boolean, details: PaywallSubscriptionDetails) {
  listeners.forEach(cb => {
    try {
      cb(unlocked, details);
    } catch (e) {
      console.error('[AddonPaywall] Listener error', e);
    }
  });
}

export const addonPaywall = {
  /**
   * Check if Community Addons access is currently unlocked
   */
  isUnlocked(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Get rich subscription details
   */
  getDetails(): PaywallSubscriptionDetails {
    if (typeof window === 'undefined') return { ...DEFAULT_DETAILS };
    try {
      const isUnlocked = localStorage.getItem(STORAGE_KEY) === 'true';
      const raw = localStorage.getItem(DETAILS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...parsed, unlocked: isUnlocked };
      }
      return { ...DEFAULT_DETAILS, unlocked: isUnlocked };
    } catch {
      return { ...DEFAULT_DETAILS };
    }
  },

  /**
   * Unlock Community Addons with a given plan
   */
  unlock(
    plan: 'annual' | 'monthly' | 'lifetime' | 'voucher' = 'annual',
    customKey?: string
  ): PaywallSubscriptionDetails {
    const now = new Date();
    const expiry = new Date();

    if (plan === 'annual') {
      expiry.setFullYear(now.getFullYear() + 1);
    } else if (plan === 'monthly') {
      expiry.setMonth(now.getMonth() + 1);
    } else if (plan === 'lifetime') {
      expiry.setFullYear(now.getFullYear() + 99);
    } else {
      expiry.setFullYear(now.getFullYear() + 2);
    }

    const planNames = {
      annual: 'Annual VIP Pass ($34.99/yr)',
      monthly: 'Monthly Pass ($4.99/mo)',
      lifetime: 'Lifetime Founder Pass ($29.99)',
      voucher: 'Redeemed Community Voucher',
    };

    const details: PaywallSubscriptionDetails = {
      unlocked: true,
      plan,
      planName: planNames[plan],
      activatedAt: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiresAt: plan === 'lifetime' ? 'Never (Lifetime)' : expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      licenseKey: customKey || `VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      autoRenew: plan !== 'lifetime' && plan !== 'voucher',
    };

    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
    } catch (e) {
      console.warn('[AddonPaywall] Could not save to localStorage', e);
    }

    notify(true, details);
    return details;
  },

  /**
   * Lock Community Addons (used for testing or canceling)
   */
  lock(): void {
    try {
      localStorage.setItem(STORAGE_KEY, 'false');
      const current = this.getDetails();
      const updated = { ...current, unlocked: false };
      localStorage.setItem(DETAILS_KEY, JSON.stringify(updated));
      notify(false, updated);
    } catch (e) {
      console.warn('[AddonPaywall] Could not save to localStorage', e);
    }
  },

  /**
   * Toggle unlocked status (handy for testing)
   */
  toggle(): boolean {
    if (this.isUnlocked()) {
      this.lock();
      return false;
    } else {
      this.unlock('annual');
      return true;
    }
  },

  /**
   * Subscribe to paywall status changes
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Verify a promo or voucher code
   */
  validateVoucher(code: string): { valid: boolean; plan?: 'voucher' | 'lifetime'; message: string } {
    const clean = code.trim().toUpperCase();
    if (['VIP-PASS', 'COMMUNITY2026', 'STREMIO-PRO', 'NASCENT-VIP', 'FREE-PASS'].includes(clean)) {
      return { valid: true, plan: 'voucher', message: 'Voucher valid! 2 Years of VIP access granted.' };
    }
    if (clean === 'LIFETIME' || clean === 'FOUNDER') {
      return { valid: true, plan: 'lifetime', message: 'Lifetime Founder key accepted!' };
    }
    if (clean.length >= 8 && clean.includes('-')) {
      return { valid: true, plan: 'voucher', message: 'License key verified successfully!' };
    }
    return { valid: false, message: 'Invalid voucher code. Try VIP-PASS or COMMUNITY2026.' };
  }
};
