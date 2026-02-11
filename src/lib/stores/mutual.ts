import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Profile } from '$lib/stores/matches';

/**
 * Tracks profiles the user has "liked".
 * A "mutual match" occurs when the other person also liked back.
 * In this mock implementation, we simulate mutual matches randomly.
 */

interface MatchRecord {
    profile: Profile;
    mutualMatch: boolean;
    revealed: boolean;
    matchedAt: string;
}

function createMutualStore() {
    const stored = browser ? localStorage.getItem('span_mutual') : null;
    const initial: MatchRecord[] = stored ? JSON.parse(stored) : [];

    const { subscribe, set, update } = writable<MatchRecord[]>(initial);

    function persist(records: MatchRecord[]) {
        if (browser) localStorage.setItem('span_mutual', JSON.stringify(records));
        return records;
    }

    return {
        subscribe,

        /**
         * Record a like action. Simulates a ~40% mutual match chance.
         */
        addLike: (profile: Profile) => update(records => {
            if (records.find(r => r.profile.id === profile.id)) return records;

            const isMutual = Math.random() < 0.4;
            const record: MatchRecord = {
                profile,
                mutualMatch: isMutual,
                revealed: false,
                matchedAt: new Date().toISOString()
            };

            return persist([record, ...records]);
        }),

        /**
         * Reveal a mutual match's hidden details.
         */
        reveal: (profileId: string) => update(records => {
            return persist(records.map(r =>
                r.profile.id === profileId ? { ...r, revealed: true } : r
            ));
        }),

        /**
         * Get only mutual matches.
         */
        getMutualMatches: (records: MatchRecord[]) => records.filter(r => r.mutualMatch),

        reset: () => {
            set([]);
            if (browser) localStorage.removeItem('span_mutual');
        }
    };
}

export const mutual = createMutualStore();
export type { MatchRecord };
