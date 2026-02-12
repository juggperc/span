import { writable, get } from 'svelte/store';
import { getUserId } from '$lib/stores/user';
import { writeBehaviorSignals, getUserBehaviorSignals } from '$lib/appwrite-db';
import { readStorage, writeStorage, removeStorage } from '$lib/storage';

/**
 * Behavioral signal store — tracks implicit user preferences.
 * Syncs to Appwrite on session end; uses localStorage as cache.
 */

export interface BehaviorSignal {
    profileId: string;
    dwellMs: number;
    drawerOpened: boolean;
    action: 'like' | 'pass';
    tags: string[];
    timestamp: number;
}

export interface BehaviorState {
    signals: BehaviorSignal[];
    tagAffinities: Record<string, number>;
    lastUpdated: number;
    sessionSwipeTimes: number[];
    pendingSync: BehaviorSignal[]; // signals not yet synced to Appwrite
}

const DECAY_DAYS = 7;
const STORAGE_KEY = 'span_behavior';

function decaySignals(signals: BehaviorSignal[]): BehaviorSignal[] {
    const cutoff = Date.now() - (DECAY_DAYS * 24 * 60 * 60 * 1000);
    return signals.filter(s => s.timestamp > cutoff);
}

function computeTagAffinities(signals: BehaviorSignal[]): Record<string, number> {
    const tagScores: Record<string, { total: number; count: number }> = {};

    for (const signal of signals) {
        const dwellWeight = Math.min(signal.dwellMs / 4000, 2.5);
        const actionWeight = signal.action === 'like' ? 1.5 : 0.4;
        const drawerWeight = signal.drawerOpened ? 1.8 : 1.0;
        const score = dwellWeight * actionWeight * drawerWeight;

        for (const tag of signal.tags) {
            const key = tag.toLowerCase();
            if (!tagScores[key]) tagScores[key] = { total: 0, count: 0 };
            tagScores[key].total += score;
            tagScores[key].count += 1;
        }
    }

    const affinities: Record<string, number> = {};
    let maxAvg = 0;
    const averages: Record<string, number> = {};

    for (const [tag, data] of Object.entries(tagScores)) {
        averages[tag] = data.total / data.count;
        maxAvg = Math.max(maxAvg, averages[tag]);
    }

    if (maxAvg > 0) {
        for (const [tag, avg] of Object.entries(averages)) {
            affinities[tag] = avg / maxAvg;
        }
    }

    return affinities;
}

function createBehaviorStore() {
    const stored = readStorage<BehaviorState>(STORAGE_KEY);
    let initial: BehaviorState = {
        signals: [],
        tagAffinities: {},
        lastUpdated: Date.now(),
        sessionSwipeTimes: [],
        pendingSync: [],
    };

    if (stored) {
        try {
            stored.signals = decaySignals(stored.signals || []);
            stored.tagAffinities = computeTagAffinities(stored.signals);
            stored.sessionSwipeTimes = stored.sessionSwipeTimes || [];
            stored.pendingSync = stored.pendingSync || [];
            initial = stored;
        } catch {
            // corrupted
        }
    }

    const { subscribe, set, update } = writable<BehaviorState>(initial);

    function persist(state: BehaviorState) {
        writeStorage(STORAGE_KEY, state);
        return state;
    }

    async function syncPending(state: BehaviorState) {
        const userId = getUserId();
        if (!userId || state.pendingSync.length === 0) return;
        try {
            await writeBehaviorSignals(
                state.pendingSync.map(s => ({ ...s, userId }))
            );
            // Clear pending after successful sync
            update(s => persist({ ...s, pendingSync: [] }));
        } catch {
            // keep pending for next attempt
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
                const docs = await getUserBehaviorSignals(userId);
                if (docs.length > 0) {
                    const signals: BehaviorSignal[] = docs.map(d => ({
                        profileId: d.profileId,
                        dwellMs: d.dwellMs,
                        drawerOpened: d.drawerOpened,
                        action: d.action,
                        tags: d.tags,
                        timestamp: d.timestamp,
                    }));
                    const decayed = decaySignals(signals);
                    update(state => persist({
                        ...state,
                        signals: decayed,
                        tagAffinities: computeTagAffinities(decayed),
                    }));
                }
            } catch {
                // use local
            }
        },

        record: (signal: BehaviorSignal) => update(state => {
            const signals = [...decaySignals(state.signals), signal];
            const tagAffinities = computeTagAffinities(signals);
            const sessionSwipeTimes = [...state.sessionSwipeTimes, Date.now()];
            const pendingSync = [...state.pendingSync, signal];
            return persist({
                signals,
                tagAffinities,
                lastUpdated: Date.now(),
                sessionSwipeTimes,
                pendingSync,
            });
        }),

        /**
         * Flush pending signals to Appwrite (call on page unload or periodically).
         */
        flush: () => {
            const state = get({ subscribe });
            syncPending(state);
        },

        getTagAffinity: (state: BehaviorState, tag: string): number => {
            return state.tagAffinities[tag.toLowerCase()] || 0;
        },

        isSwipingTooFast: (state: BehaviorState): boolean => {
            const times = state.sessionSwipeTimes;
            if (times.length < 15) return false;
            const recent15 = times.slice(-15);
            const elapsed = recent15[recent15.length - 1] - recent15[0];
            return elapsed < 120000;
        },

        getSessionStats: (state: BehaviorState) => {
            const today = new Date().toDateString();
            const todaySignals = state.signals.filter(
                s => new Date(s.timestamp).toDateString() === today
            );
            const likes = todaySignals.filter(s => s.action === 'like').length;
            const passes = todaySignals.filter(s => s.action === 'pass').length;
            const avgDwell = todaySignals.length > 0
                ? todaySignals.reduce((sum, s) => sum + s.dwellMs, 0) / todaySignals.length
                : 0;
            const drawerOpens = todaySignals.filter(s => s.drawerOpened).length;

            return { likes, passes, avgDwell, drawerOpens, total: todaySignals.length };
        },

        resetSessionPacing: () => update(state => {
            return persist({ ...state, sessionSwipeTimes: [] });
        }),

        reset: () => {
            const empty: BehaviorState = {
                signals: [],
                tagAffinities: {},
                lastUpdated: Date.now(),
                sessionSwipeTimes: [],
                pendingSync: [],
            };
            set(empty);
            removeStorage(STORAGE_KEY);
        }
    };
}

export const behavior = createBehaviorStore();
