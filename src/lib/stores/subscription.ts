import { writable, derived } from 'svelte/store';
import { readStorage, writeStorage, removeStorage } from '$lib/storage';

/**
 * Subscription store — manages premium status.
 * 
 * Currently mock-only. The interface is designed to be
 * drop-in compatible with Stripe Checkout / Billing Portal
 * when production payment processing is ready.
 */

export interface SubscriptionState {
    plan: 'free' | 'premium';
    expiresAt: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
}

export const PREMIUM_PRICE = '$9.99';
export const PREMIUM_PERIOD = '/month';

const STORAGE_KEY = 'span_subscription';

function createSubscriptionStore() {
    const stored = readStorage<SubscriptionState>(STORAGE_KEY);
    let initial: SubscriptionState = {
        plan: 'free',
        expiresAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
    };

    if (stored) {
        try {
            // Check if subscription has expired
            if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) {
                stored.plan = 'free';
            }
            initial = stored;
        } catch {
            // corrupted
        }
    }

    const { subscribe, set, update } = writable<SubscriptionState>(initial);

    function persist(state: SubscriptionState) {
        writeStorage(STORAGE_KEY, state);
        return state;
    }

    return {
        subscribe,

        /**
         * Mock purchase — simulates a successful Stripe checkout.
         * In production, this would redirect to Stripe Checkout
         * and update via webhook.
         */
        mockPurchase: () => update(state => {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            return persist({
                ...state,
                plan: 'premium',
                expiresAt: expiresAt.toISOString(),
                stripeCustomerId: 'cus_mock_' + Math.random().toString(36).slice(2, 8),
                stripeSubscriptionId: 'sub_mock_' + Math.random().toString(36).slice(2, 8),
            });
        }),

        /**
         * Cancel subscription.
         */
        cancel: () => update(state => {
            return persist({
                ...state,
                plan: 'free',
                expiresAt: null,
                stripeSubscriptionId: null,
            });
        }),

        /**
         * Check if user has premium access.
         */
        isPremium: (state: SubscriptionState): boolean => {
            if (state.plan !== 'premium') return false;
            if (state.expiresAt && new Date(state.expiresAt) < new Date()) return false;
            return true;
        },

        reset: () => {
            const fresh: SubscriptionState = {
                plan: 'free',
                expiresAt: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null,
            };
            set(fresh);
            removeStorage(STORAGE_KEY);
        }
    };
}

export const subscription = createSubscriptionStore();
export const isPremium = derived(subscription, ($sub) => subscription.isPremium($sub));
