import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getUserId } from '$lib/stores/user';
import { upsertProfile } from '$lib/appwrite-db';

/**
 * Anchor Question store — rotating daily reflective prompts.
 * Answer syncs to user's profile in Appwrite.
 */

const ANCHOR_QUESTIONS = [
    "What's one belief you've changed your mind about recently?",
    "Describe the last time you chose patience over reaction.",
    "What does someone need to understand about you that they usually don't?",
    "What's a small thing that tells you a lot about a person?",
    "When was the last time you felt genuinely understood?",
    "What do you protect in a relationship that most people overlook?",
    "What's something you used to chase that you've since let go of?",
    "How do you know when someone is paying attention?",
    "What's the difference between being alone and being lonely, for you?",
    "What does it look like when you're at peace?",
    "What's a hard truth you've accepted about yourself?",
    "What kind of silence feels comfortable to you?",
    "What do you need more of right now — and less of?",
    "When did you last surprise yourself?",
];

export interface AnchorState {
    currentQuestion: string;
    answer: string;
    questionDate: string;
    history: { question: string; answer: string; date: string }[];
}

const STORAGE_KEY = 'span_anchor';

function getQuestionForDate(dateStr: string): string {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % ANCHOR_QUESTIONS.length;
    return ANCHOR_QUESTIONS[idx];
}

function createAnchorStore() {
    const today = new Date().toDateString();
    const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
    let initial: AnchorState = {
        currentQuestion: getQuestionForDate(today),
        answer: '',
        questionDate: today,
        history: []
    };

    if (stored) {
        try {
            const parsed: AnchorState = JSON.parse(stored);
            if (parsed.questionDate === today) {
                initial = parsed;
            } else {
                const newHistory = parsed.answer
                    ? [{ question: parsed.currentQuestion, answer: parsed.answer, date: parsed.questionDate }, ...parsed.history.slice(0, 13)]
                    : parsed.history;
                initial = {
                    currentQuestion: getQuestionForDate(today),
                    answer: '',
                    questionDate: today,
                    history: newHistory
                };
            }
        } catch {
            // corrupted
        }
    }

    const { subscribe, set, update } = writable<AnchorState>(initial);

    function persist(state: AnchorState) {
        if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return state;
    }

    return {
        subscribe,

        setAnswer: (answer: string) => update(state => {
            const newState = persist({ ...state, answer: answer.trim() });

            // Sync anchor answer to Appwrite profile
            const userId = getUserId();
            if (userId) {
                upsertProfile(userId, { anchorAnswer: answer.trim() }).catch(() => {});
            }

            return newState;
        }),

        getHistory: (state: AnchorState) => state.history,

        reset: () => {
            const today = new Date().toDateString();
            const fresh: AnchorState = {
                currentQuestion: getQuestionForDate(today),
                answer: '',
                questionDate: today,
                history: []
            };
            set(fresh);
            if (browser) localStorage.removeItem(STORAGE_KEY);
        }
    };
}

export const anchor = createAnchorStore();
