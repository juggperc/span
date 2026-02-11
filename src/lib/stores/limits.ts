import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { getUserId } from '$lib/stores/user';
import { getTodayLimits, upsertDailyLimits } from '$lib/appwrite-db';

export const MAX_SWIPES = 20;
export const MAX_LIKES_SENT = 5;
export const MAX_SEARCHES = 5;

interface LimitState {
    swipes: number;
    likesSent: number;
    searches: number;
    date: string;
    docId: string | null; // Appwrite document ID
}

const STORAGE_KEY = 'span_limits';

function todayStr(): string {
    return new Date().toDateString();
}

function createLimitsStore() {
    const today = todayStr();
    const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
    let initial: LimitState = { swipes: 0, likesSent: 0, searches: 0, date: today, docId: null };

    if (stored) {
        try {
            const parsed: LimitState = JSON.parse(stored);
            if (parsed.date === today) {
                initial = parsed;
            }
        } catch {
            // corrupted
        }
    }

    const { subscribe, set, update } = writable<LimitState>(initial);

    function persist(state: LimitState) {
        if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return state;
    }

    async function syncToAppwrite(state: LimitState) {
        const userId = getUserId();
        if (!userId) return;
        try {
            await upsertDailyLimits(userId, {
                swipes: state.swipes,
                likesSent: state.likesSent,
                searches: state.searches,
            });
        } catch {
            // offline — localStorage is the fallback
        }
    }

    return {
        subscribe,

        /**
         * Initialize from Appwrite (call after auth).
         */
        init: async () => {
            const userId = getUserId();
            if (!userId) return;
            try {
                const doc = await getTodayLimits(userId);
                if (doc) {
                    const state: LimitState = {
                        swipes: doc.swipes,
                        likesSent: doc.likesSent,
                        searches: doc.searches,
                        date: todayStr(),
                        docId: doc.$id,
                    };
                    set(persist(state));
                }
            } catch {
                // use local
            }
        },

        incrementSwipe: () => update(s => {
            const today = todayStr();
            const state = s.date !== today
                ? { swipes: 1, likesSent: 0, searches: 0, date: today, docId: null }
                : { ...s, swipes: s.swipes + 1 };
            syncToAppwrite(state);
            return persist(state);
        }),

        incrementLike: () => update(s => {
            const state = { ...s, likesSent: s.likesSent + 1 };
            syncToAppwrite(state);
            return persist(state);
        }),

        incrementSearch: () => update(s => {
            const state = { ...s, searches: s.searches + 1 };
            syncToAppwrite(state);
            return persist(state);
        }),

        checkSwipe: (current: number) => current < MAX_SWIPES,
        checkLike: (current: number) => current < MAX_LIKES_SENT,
        checkSearch: (current: number) => current < MAX_SEARCHES,

        reset: () => {
            const fresh: LimitState = { swipes: 0, likesSent: 0, searches: 0, date: todayStr(), docId: null };
            set(fresh);
            if (browser) localStorage.removeItem(STORAGE_KEY);
        }
    };
}

export const limits = createLimitsStore();
