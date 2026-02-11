import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export const MAX_SWIPES = 20;
export const MAX_LIKES_SENT = 5;
export const MAX_LIKES_RECEIVED = 5;
export const MAX_SEARCHES = 5;

interface DailyLimits {
    date: string;
    swipes: number;
    likesSent: number;
    searches: number;
}

function todayString(): string {
    return new Date().toDateString();
}

function freshLimits(): DailyLimits {
    return {
        date: todayString(),
        swipes: 0,
        likesSent: 0,
        searches: 0
    };
}

function createLimitsStore() {
    const { subscribe, set, update } = writable<DailyLimits>(freshLimits());

    if (browser) {
        const stored = localStorage.getItem('span_limits');
        if (stored) {
            try {
                const parsed: DailyLimits = JSON.parse(stored);
                if (parsed.date === todayString()) {
                    set(parsed);
                } else {
                    const fresh = freshLimits();
                    set(fresh);
                    localStorage.setItem('span_limits', JSON.stringify(fresh));
                }
            } catch {
                const fresh = freshLimits();
                set(fresh);
                localStorage.setItem('span_limits', JSON.stringify(fresh));
            }
        }
    }

    function ensureFreshDay(state: DailyLimits): DailyLimits {
        if (state.date !== todayString()) {
            const fresh = freshLimits();
            if (browser) localStorage.setItem('span_limits', JSON.stringify(fresh));
            return fresh;
        }
        return state;
    }

    function persist(state: DailyLimits): DailyLimits {
        if (browser) localStorage.setItem('span_limits', JSON.stringify(state));
        return state;
    }

    return {
        subscribe,
        incrementSwipe: () => update(s => {
            const current = ensureFreshDay(s);
            if (current.swipes >= MAX_SWIPES) return current;
            return persist({ ...current, swipes: current.swipes + 1 });
        }),
        incrementLike: () => update(s => {
            const current = ensureFreshDay(s);
            if (current.likesSent >= MAX_LIKES_SENT) return current;
            return persist({ ...current, likesSent: current.likesSent + 1 });
        }),
        incrementSearch: () => update(s => {
            const current = ensureFreshDay(s);
            if (current.searches >= MAX_SEARCHES) return current;
            return persist({ ...current, searches: current.searches + 1 });
        }),
        checkSwipe: (current: number) => current < MAX_SWIPES,
        checkLike: (current: number) => current < MAX_LIKES_SENT,
        checkSearch: (current: number) => current < MAX_SEARCHES,
        reset: () => {
            const fresh = freshLimits();
            set(fresh);
            if (browser) localStorage.setItem('span_limits', JSON.stringify(fresh));
        }
    };
}

export const limits = createLimitsStore();
