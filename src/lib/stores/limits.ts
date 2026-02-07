import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Limits constants
export const MAX_SWIPES = 20;
export const MAX_LIKES_SENT = 5;
export const MAX_LIKES_RECEIVED = 5; // This would typically be checked on backend/receiving end
export const MAX_SEARCHES = 5;

// Interfaces
interface DailyLimits {
    date: string;
    swipes: number;
    likesSent: number;
    searches: number;
}

const defaultLimits: DailyLimits = {
    date: new Date().toDateString(),
    swipes: 0,
    likesSent: 0,
    searches: 0
};

function createLimitsStore() {
    const { subscribe, set, update } = writable<DailyLimits>(defaultLimits);

    if (browser) {
        const stored = localStorage.getItem('span_limits');
        if (stored) {
            const parsed: DailyLimits = JSON.parse(stored);
            if (parsed.date === new Date().toDateString()) {
                set(parsed);
            } else {
                // Reset if new day
                set(defaultLimits);
            }
        }
    }

    return {
        subscribe,
        incrementSwipe: () => update(s => {
            const next = { ...s, swipes: s.swipes + 1 };
            if (browser) localStorage.setItem('span_limits', JSON.stringify(next));
            return next;
        }),
        incrementLike: () => update(s => {
            const next = { ...s, likesSent: s.likesSent + 1 };
            if (browser) localStorage.setItem('span_limits', JSON.stringify(next));
            return next;
        }),
        incrementSearch: () => update(s => {
            const next = { ...s, searches: s.searches + 1 };
            if (browser) localStorage.setItem('span_limits', JSON.stringify(next));
            return next;
        }),
        checkSwipe: (current: number) => current < MAX_SWIPES,
        checkLike: (current: number) => current < MAX_LIKES_SENT,
        checkSearch: (current: number) => current < MAX_SEARCHES,
    };
}

export const limits = createLimitsStore();
