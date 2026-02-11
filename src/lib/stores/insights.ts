import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { BehaviorState } from '$lib/stores/behavior';

/**
 * Pattern Mirror — weekly behavioral insights.
 *
 * "You think you are becoming aware, while in reality you are
 * just being programmed to think that."
 *
 * This store computes honest, non-judgmental summaries of the
 * user's swiping patterns to interrupt algorithmic entrainment.
 */

export interface InsightEntry {
    week: string; // ISO week identifier
    insights: string[];
    generatedAt: number;
    dismissed: boolean;
}

const STORAGE_KEY = 'span_insights';

function getWeekId(date: Date = new Date()): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Generate insights from behavioral data.
 */
export function generateInsights(behaviorState: BehaviorState): string[] {
    const insights: string[] = [];
    const signals = behaviorState.signals;

    if (signals.length === 0) {
        return ['No activity this week. Sometimes the best swipe is the one you don\'t take.'];
    }

    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

    const thisWeek = signals.filter(s => s.timestamp > weekAgo);
    const lastWeek = signals.filter(s => s.timestamp > twoWeeksAgo && s.timestamp <= weekAgo);

    // Average dwell time comparison
    if (thisWeek.length > 0) {
        const avgDwell = thisWeek.reduce((sum, s) => sum + s.dwellMs, 0) / thisWeek.length;
        const avgDwellSec = (avgDwell / 1000).toFixed(1);

        if (lastWeek.length > 0) {
            const lastAvgDwell = lastWeek.reduce((sum, s) => sum + s.dwellMs, 0) / lastWeek.length;
            const lastAvgSec = (lastAvgDwell / 1000).toFixed(1);

            if (avgDwell < lastAvgDwell * 0.7) {
                insights.push(`You spent an average of ${avgDwellSec}s per profile this week. Last week it was ${lastAvgSec}s. Are you swiping faster or seeing less?`);
            } else if (avgDwell > lastAvgDwell * 1.3) {
                insights.push(`Your attention deepened — ${avgDwellSec}s per profile this week vs ${lastAvgSec}s last week. You're looking more carefully.`);
            }
        } else {
            insights.push(`You spent an average of ${avgDwellSec}s per profile this week.`);
        }
    }

    // Like/pass ratio
    const likes = thisWeek.filter(s => s.action === 'like').length;
    const passes = thisWeek.filter(s => s.action === 'pass').length;
    const total = likes + passes;

    if (total >= 5) {
        const likeRate = Math.round((likes / total) * 100);
        if (likeRate > 60) {
            insights.push(`You liked ${likeRate}% of profiles you saw. Are you being generous — or undiscerning?`);
        } else if (likeRate < 15) {
            insights.push(`You liked only ${likeRate}% of profiles. High standards are good — just make sure they're yours, not the algorithm's.`);
        }
    }

    // Drawer engagement
    const drawerOpens = thisWeek.filter(s => s.drawerOpened).length;
    if (thisWeek.length >= 5 && drawerOpens === 0) {
        insights.push(`You didn't open a single profile drawer this week. First impressions are fast — but depth is slower.`);
    } else if (thisWeek.length >= 5) {
        const drawerRate = Math.round((drawerOpens / thisWeek.length) * 100);
        if (drawerRate > 50) {
            insights.push(`You opened the detail drawer on ${drawerRate}% of profiles. You're investing attention. That matters.`);
        }
    }

    // Tag pattern detection
    const tagCounts: Record<string, number> = {};
    for (const signal of thisWeek.filter(s => s.action === 'like')) {
        for (const tag of signal.tags) {
            tagCounts[tag.toLowerCase()] = (tagCounts[tag.toLowerCase()] || 0) + 1;
        }
    }
    const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);
    if (topTags.length >= 2) {
        insights.push(`Your likes gravitated toward "${topTags[0][0]}" and "${topTags[1][0]}" people this week.`);
    }

    // Passed on high-overlap profiles
    const passedHighOverlap = thisWeek.filter(s =>
        s.action === 'pass' && s.tags.length >= 3
    ).length;
    if (passedHighOverlap >= 3) {
        insights.push(`You passed on ${passedHighOverlap} profiles who shared 3+ tags with you. Curious — what were you looking for instead?`);
    }

    return insights.length > 0 ? insights : ['A steady week. Keep showing up with intention.'];
}

function createInsightsStore() {
    const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
    const initial: InsightEntry[] = stored ? JSON.parse(stored) : [];

    const { subscribe, set, update } = writable<InsightEntry[]>(initial);

    function persist(entries: InsightEntry[]) {
        if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return entries;
    }

    return {
        subscribe,

        /**
         * Generate and store this week's insights if not already done.
         */
        generateForWeek: (behaviorState: BehaviorState) => update(entries => {
            const week = getWeekId();
            if (entries.find(e => e.week === week)) return entries;

            const insights = generateInsights(behaviorState);
            const entry: InsightEntry = {
                week,
                insights,
                generatedAt: Date.now(),
                dismissed: false
            };
            return persist([entry, ...entries.slice(0, 11)]);
        }),

        dismiss: (week: string) => update(entries => {
            return persist(entries.map(e =>
                e.week === week ? { ...e, dismissed: true } : e
            ));
        }),

        getCurrentWeek: (entries: InsightEntry[]): InsightEntry | undefined => {
            const week = getWeekId();
            return entries.find(e => e.week === week && !e.dismissed);
        },

        reset: () => {
            set([]);
            if (browser) localStorage.removeItem(STORAGE_KEY);
        }
    };
}

export const insights = createInsightsStore();
