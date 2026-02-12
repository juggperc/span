import { writable } from 'svelte/store';
import type { Profile } from '$lib/stores/matches';
import { getUserId } from '$lib/stores/user';
import { createMatch, getUserMatches, checkMutualMatch, revealMatch } from '$lib/appwrite-db';
import { readStorage, writeStorage, removeStorage } from '$lib/storage';

/**
 * Tracks profiles the user has "liked" and mutual matches.
 * Syncs with Appwrite `matches` collection.
 * Falls back to localStorage for offline/demo mode.
 */

export interface MatchRecord {
    profile: Profile;
    mutualMatch: boolean;
    revealed: boolean;
    matchedAt: string;
    docId?: string; // Appwrite document ID
}

function createMutualStore() {
    const stored = readStorage<MatchRecord[]>('span_mutual');
    const initial: MatchRecord[] = stored ?? [];

    const { subscribe, set, update } = writable<MatchRecord[]>(initial);

    function persist(records: MatchRecord[]) {
        writeStorage('span_mutual', records);
        return records;
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
                const matches = await getUserMatches(userId);
                if (matches.length > 0) {
                    const records: MatchRecord[] = matches.map(m => ({
                        profile: {
                            id: m.toUserId,
                            name: '', age: 0, location: '', bio: '', tags: [],
                            imageUrl: '', distance: 0, myersBriggs: '',
                            smoker: false, usesWeed: false, wantsKids: 'maybe' as const,
                            relationshipType: 'serious' as const, monogamy: 'monogamous' as const,
                        },
                        mutualMatch: m.mutual,
                        revealed: m.revealed,
                        matchedAt: m.timestamp,
                        docId: m.$id,
                    }));
                    set(persist(records));
                }
            } catch {
                // use local
            }
        },

        /**
         * Record a like action. Checks for mutual match.
         */
        addLike: (profile: Profile) => update(records => {
            if (records.find(r => r.profile.id === profile.id)) return records;

            const userId = getUserId();

            // In demo/offline mode, simulate 40% mutual match
            let isMutual = Math.random() < 0.4;

            const record: MatchRecord = {
                profile,
                mutualMatch: isMutual,
                revealed: false,
                matchedAt: new Date().toISOString()
            };

            // Async: write to Appwrite
            if (userId) {
                (async () => {
                    try {
                        // Check for real mutual match
                        const realMutual = await checkMutualMatch(userId, profile.id);
                        const doc = await createMatch({
                            fromUserId: userId,
                            toUserId: profile.id,
                            action: 'like',
                            mutual: realMutual,
                            revealed: false,
                            timestamp: new Date().toISOString(),
                        });
                        if (doc && realMutual !== isMutual) {
                            // Update local state with real mutual status
                            update(recs => persist(recs.map(r =>
                                r.profile.id === profile.id
                                    ? { ...r, mutualMatch: realMutual, docId: doc.$id }
                                    : r
                            )));
                        }
                    } catch {
                        // offline — local state is fine
                    }
                })();
            }

            return persist([record, ...records]);
        }),

        /**
         * Reveal a mutual match's hidden details.
         */
        reveal: (profileId: string) => update(records => {
            const record = records.find(r => r.profile.id === profileId);
            if (record?.docId) {
                revealMatch(record.docId).catch(() => {});
            }
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
            removeStorage('span_mutual');
        }
    };
}

export const mutual = createMutualStore();
