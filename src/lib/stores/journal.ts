import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getUserId } from '$lib/stores/user';
import { createJournalEntry, getUserJournalEntries } from '$lib/appwrite-db';

/**
 * Swipe Journal — daily reflection entries.
 * Syncs with Appwrite journal_entries collection.
 */

export interface JournalEntry {
    date: string;
    text: string;
    profileName?: string;
    profileId?: string;
    timestamp: number;
}

const STORAGE_KEY = 'span_journal';

function createJournalStore() {
    const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
    const initial: JournalEntry[] = stored ? JSON.parse(stored) : [];

    const { subscribe, set, update } = writable<JournalEntry[]>(initial);

    function persist(entries: JournalEntry[]) {
        if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return entries;
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
                const docs = await getUserJournalEntries(userId);
                if (docs.length > 0) {
                    const entries: JournalEntry[] = docs.map(d => ({
                        date: d.date,
                        text: d.text,
                        profileName: d.profileName,
                        profileId: d.profileId,
                        timestamp: d.timestamp,
                    }));
                    set(persist(entries));
                }
            } catch {
                // use local
            }
        },

        add: (text: string, profileName?: string, profileId?: string) => update(entries => {
            const entry: JournalEntry = {
                date: new Date().toDateString(),
                text: text.trim(),
                profileName,
                profileId,
                timestamp: Date.now()
            };

            // Async: write to Appwrite
            const userId = getUserId();
            if (userId) {
                createJournalEntry({ ...entry, userId }).catch(() => {});
            }

            return persist([entry, ...entries]);
        }),

        getToday: (entries: JournalEntry[]): JournalEntry | undefined => {
            const today = new Date().toDateString();
            return entries.find(e => e.date === today);
        },

        getRecent: (entries: JournalEntry[], count = 7): JournalEntry[] => {
            return entries.slice(0, count);
        },

        reset: () => {
            set([]);
            if (browser) localStorage.removeItem(STORAGE_KEY);
        }
    };
}

export const journal = createJournalStore();
