import type { Profile } from '$lib/stores/matches';

/**
 * Myers-Briggs compatibility matrix.
 * Higher score = more naturally compatible pairing.
 * Based on common MBTI compatibility charts.
 */
const MBTI_COMPAT: Record<string, string[]> = {
    'INFJ': ['ENTP', 'ENFP', 'INFJ', 'INTJ'],
    'INFP': ['ENFJ', 'ENTJ', 'INFP', 'INFJ'],
    'ENFJ': ['INFP', 'ISFP', 'ENFJ', 'ENFP'],
    'ENFP': ['INFJ', 'INTJ', 'ENFP', 'ENFJ'],
    'INTJ': ['ENFP', 'ENTP', 'INTJ', 'INFJ'],
    'INTP': ['ENTJ', 'ESTJ', 'INTP', 'INTJ'],
    'ENTJ': ['INTP', 'INFP', 'ENTJ', 'ENTP'],
    'ENTP': ['INFJ', 'INTJ', 'ENTP', 'ENFP'],
    'ISFJ': ['ESFP', 'ESTP', 'ISFJ', 'ISTJ'],
    'ISTJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ'],
    'ESFJ': ['ISFP', 'ISTP', 'ESFJ', 'ENFJ'],
    'ESTJ': ['INTP', 'ISTP', 'ESTJ', 'ESFJ'],
    'ISFP': ['ENFJ', 'ESFJ', 'ISFP', 'INFP'],
    'ISTP': ['ESFJ', 'ESTJ', 'ISTP', 'ISFP'],
    'ESFP': ['ISFJ', 'ISTJ', 'ESFP', 'ESTP'],
    'ESTP': ['ISFJ', 'ISTJ', 'ESTP', 'ESFP'],
};

interface UserPreferences {
    tags: string[];
    age: number;
    latitude?: number;
    longitude?: number;
    maxDistance: number;
    myersBriggs: string;
}

/**
 * Score a candidate profile against the user's preferences.
 * Returns a value between 0 and 1.
 *
 * Weights:
 *   Tag overlap:           40%
 *   Age proximity:         25%
 *   Distance proximity:    25%
 *   MBTI compatibility:    10%
 */
export function scoreProfile(candidate: Profile, prefs: UserPreferences): number {
    // --- Tag overlap (40%) ---
    const userTags = new Set(prefs.tags.map(t => t.toLowerCase()));
    const candidateTags = candidate.tags.map(t => t.toLowerCase());
    const overlap = candidateTags.filter(t => userTags.has(t)).length;
    const maxTags = Math.max(userTags.size, candidateTags.length, 1);
    const tagScore = overlap / maxTags;

    // --- Age proximity (25%) ---
    const ageDiff = Math.abs(candidate.age - prefs.age);
    const ageScore = Math.max(0, 1 - ageDiff / 15); // 15yr diff = 0

    // --- Distance proximity (25%) ---
    const distScore = candidate.distance <= prefs.maxDistance
        ? Math.max(0, 1 - candidate.distance / prefs.maxDistance)
        : 0;

    // --- MBTI compatibility (10%) ---
    const compatList = MBTI_COMPAT[prefs.myersBriggs] || [];
    let mbtiScore = 0;
    if (compatList.includes(candidate.myersBriggs)) {
        mbtiScore = 1;
    } else {
        // Partial credit: share at least 2 letters
        const shared = prefs.myersBriggs
            .split('')
            .filter((c, i) => candidate.myersBriggs[i] === c).length;
        mbtiScore = shared / 4;
    }

    return (tagScore * 0.4) + (ageScore * 0.25) + (distScore * 0.25) + (mbtiScore * 0.1);
}

/**
 * Sort an array of profiles by compatibility score (descending).
 */
export function rankProfiles(profiles: Profile[], prefs: UserPreferences): Profile[] {
    return [...profiles]
        .map(p => ({ profile: p, score: scoreProfile(p, prefs) }))
        .sort((a, b) => b.score - a.score)
        .map(x => x.profile);
}

/**
 * Filter profiles by distance and optional tag query.
 */
export function filterProfiles(
    profiles: Profile[],
    maxDistance: number,
    query?: string
): Profile[] {
    let results = profiles.filter(p => p.distance <= maxDistance);

    if (query && query.trim().length > 0) {
        const q = query.trim().toLowerCase();
        results = results.filter(p =>
            p.tags.some(t => t.toLowerCase().includes(q)) ||
            p.name.toLowerCase().includes(q) ||
            p.bio.toLowerCase().includes(q) ||
            p.myersBriggs.toLowerCase().includes(q)
        );
    }

    return results;
}
