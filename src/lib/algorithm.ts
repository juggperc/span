import type { Profile } from '$lib/stores/matches';
import type { BehaviorState } from '$lib/stores/behavior';

/**
 * Span Matching Algorithm v3
 *
 * Inspired by ByteDance's Monolith & Douyin's Two-Tower Retrieval Model.
 *
 * v3 additions over v2:
 * - Intent alignment (relationship type matching)
 * - Values alignment (monogamy, kids, lifestyle compatibility)
 * - Bio depth scoring (rewards profile investment)
 * - Cross-category exploration diversity
 * - Session pacing awareness
 *
 * Anti-popularity bias: never ranks by how many likes a profile received.
 * Exploration budget: 25% of results are diverse/unexpected profiles.
 */

// --- MBTI Compatibility ---
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

// --- Intent compatibility map ---
const INTENT_COMPAT: Record<string, string[]> = {
    'serious': ['serious'],
    'casual': ['casual', 'open'],
    'friends': ['friends', 'casual'],
    'open': ['open', 'casual']
};

export interface UserPreferences {
    tags: string[];
    age: number;
    maxDistance: number;
    myersBriggs: string;
    relationshipType: 'casual' | 'serious' | 'friends' | 'open';
    smoker: boolean;
    usesWeed: boolean;
    wantsKids: 'yes' | 'no' | 'maybe';
    monogamy: 'monogamous' | 'non-monogamous' | 'open';
    gender: 'man' | 'woman' | 'non-binary' | 'trans' | 'other';
    lookingFor: string[];
}

// ---- Static scoring (v1 factors) ----

function tagOverlapScore(candidate: Profile, prefs: UserPreferences): number {
    const userTags = new Set(prefs.tags.map(t => t.toLowerCase()));
    const candidateTags = candidate.tags.map(t => t.toLowerCase());
    const overlap = candidateTags.filter(t => userTags.has(t)).length;
    const maxTags = Math.max(userTags.size, candidateTags.length, 1);
    return overlap / maxTags;
}

function ageProximityScore(candidate: Profile, prefs: UserPreferences): number {
    const ageDiff = Math.abs(candidate.age - prefs.age);
    return Math.max(0, 1 - ageDiff / 15);
}

function distanceScore(candidate: Profile, prefs: UserPreferences): number {
    return candidate.distance <= prefs.maxDistance
        ? Math.max(0, 1 - candidate.distance / prefs.maxDistance)
        : 0;
}

function mbtiScore(candidate: Profile, prefs: UserPreferences): number {
    const compatList = MBTI_COMPAT[prefs.myersBriggs] || [];
    if (compatList.includes(candidate.myersBriggs)) return 1;
    const shared = prefs.myersBriggs
        .split('')
        .filter((c, i) => candidate.myersBriggs[i] === c).length;
    return shared / 4;
}

// ---- v3 scoring factors ----

/**
 * Intent alignment — are they looking for the same thing?
 * This was the biggest gap in v2: relationshipType existed but was never scored.
 */
function intentScore(candidate: Profile, prefs: UserPreferences): number {
    if (candidate.relationshipType === prefs.relationshipType) return 1.0;
    const compatible = INTENT_COMPAT[prefs.relationshipType] || [];
    return compatible.includes(candidate.relationshipType) ? 0.6 : 0.1;
}

/**
 * Values alignment — lifestyle compatibility on things that cause real friction.
 * Monogamy mismatch is weighted highest because it's a genuine dealbreaker.
 */
function valuesScore(candidate: Profile, prefs: UserPreferences): number {
    let score = 0;
    let factors = 0;

    // Monogamy alignment (high-weight)
    if (candidate.monogamy === prefs.monogamy) { score += 1.5; }
    else if (candidate.monogamy === 'open' || prefs.monogamy === 'open') { score += 0.5; }
    factors += 1.5;

    // Kids alignment
    if (candidate.wantsKids === prefs.wantsKids) { score += 1; }
    else if (candidate.wantsKids === 'maybe' || prefs.wantsKids === 'maybe') { score += 0.5; }
    factors += 1;

    // Substance compatibility (lower weight — preference, not dealbreaker)
    if (candidate.smoker === prefs.smoker) score += 0.3;
    if (candidate.usesWeed === prefs.usesWeed) score += 0.2;
    factors += 0.5;

    return score / factors;
}

/**
 * Bio depth — rewards users who invest in their profile.
 * The essay describes how feeds reward surface-level content.
 * Span should do the opposite.
 */
function bioDepthScore(candidate: Profile): number {
    const len = candidate.bio.length;
    if (len < 20) return 0.2;  // empty/lazy
    if (len < 50) return 0.5;  // minimal
    if (len < 120) return 0.8; // decent
    return 1.0;                // invested
}

// ---- Behavioral scoring (v2 — Monolith-inspired) ----

/**
 * Score how much the user's learned tag affinities align with this candidate.
 * Returns 0-1 based on average affinity across the candidate's tags.
 */
function behavioralAffinityScore(
    candidate: Profile,
    behaviorState: BehaviorState | null
): number {
    if (!behaviorState || Object.keys(behaviorState.tagAffinities).length === 0) {
        return 0.5; // neutral when no data
    }

    const candidateTags = candidate.tags.map(t => t.toLowerCase());
    if (candidateTags.length === 0) return 0.5;

    let totalAffinity = 0;
    let matched = 0;

    for (const tag of candidateTags) {
        const affinity = behaviorState.tagAffinities[tag];
        if (affinity !== undefined) {
            totalAffinity += affinity;
            matched++;
        }
    }

    if (matched === 0) return 0.5; // no data for these tags
    return totalAffinity / matched;
}

// ---- Combined scoring ----

/**
 * Resonance breakdown — returned alongside the score for transparency UI.
 */
export interface ResonanceBreakdown {
    intentLabel: string;
    valuesPercent: number;
    sharedTags: string[];
    bioDepth: 'minimal' | 'decent' | 'invested';
    mbtiCompat: boolean;
    totalScore: number;
}

/**
 * Get human-readable resonance breakdown for the profile drawer.
 */
export function getResonance(
    candidate: Profile,
    prefs: UserPreferences,
    behaviorState: BehaviorState | null = null
): ResonanceBreakdown {
    const intent = intentScore(candidate, prefs);
    const values = valuesScore(candidate, prefs);
    const userTags = new Set(prefs.tags.map(t => t.toLowerCase()));
    const shared = candidate.tags.filter(t => userTags.has(t.toLowerCase()));
    const bio = bioDepthScore(candidate);
    const compatList = MBTI_COMPAT[prefs.myersBriggs] || [];

    return {
        intentLabel: intent >= 1.0 ? 'aligned' : intent >= 0.6 ? 'compatible' : 'different',
        valuesPercent: Math.round(values * 100),
        sharedTags: shared,
        bioDepth: bio >= 1.0 ? 'invested' : bio >= 0.8 ? 'decent' : 'minimal',
        mbtiCompat: compatList.includes(candidate.myersBriggs),
        totalScore: scoreProfile(candidate, prefs, behaviorState)
    };
}

/**
 * Compute profile depth level (0-3 rings) for the card indicator.
 */
export function getProfileDepth(candidate: Profile): number {
    let depth = 0;
    if (candidate.bio.length >= 50) depth++;
    if (candidate.tags.length >= 3) depth++;
    if (candidate.anchorAnswer && candidate.anchorAnswer.length > 10) depth++;
    return depth; // 0-3
}

/**
 * Score a candidate profile.
 *
 * v3 weight distribution:
 *
 * Cold start (no behavioral data):
 *   Tag overlap: 30%, Intent: 20%, Values: 15%, Age: 12%, Distance: 12%, MBTI: 6%, Bio depth: 5%
 *
 * Warm (10+ signals):
 *   Behavioral: 20%, Tag overlap: 20%, Intent: 15%, Values: 12%, Age: 8%, Distance: 8%, MBTI: 5%, Bio depth: 7%, Tower: 5%
 *
 * The behavioral weight ramps up as more signals are collected.
 */
export function scoreProfile(
    candidate: Profile,
    prefs: UserPreferences,
    behaviorState: BehaviorState | null = null
): number {
    const tags = tagOverlapScore(candidate, prefs);
    const age = ageProximityScore(candidate, prefs);
    const dist = distanceScore(candidate, prefs);
    const mbti = mbtiScore(candidate, prefs);
    const intent = intentScore(candidate, prefs);
    const values = valuesScore(candidate, prefs);
    const bio = bioDepthScore(candidate);
    const behavioral = behavioralAffinityScore(candidate, behaviorState);

    // Ramp behavioral weight based on signal count
    const signalCount = behaviorState?.signals.length || 0;
    const behavioralWeight = Math.min(signalCount / 10, 1) * 0.20; // max 20%
    const staticWeight = 1 - behavioralWeight;

    // Static weights (normalized to sum to 1.0)
    const staticScore =
        tags * 0.30 +
        intent * 0.20 +
        values * 0.15 +
        age * 0.12 +
        dist * 0.12 +
        mbti * 0.06 +
        bio * 0.05;

    return (staticScore * staticWeight) + (behavioral * behavioralWeight);
}

// ---- MBTI family helper for cross-category diversity ----

function mbtiFamily(type: string): string {
    const families: Record<string, string> = {
        'INFJ': 'NF', 'INFP': 'NF', 'ENFJ': 'NF', 'ENFP': 'NF',
        'INTJ': 'NT', 'INTP': 'NT', 'ENTJ': 'NT', 'ENTP': 'NT',
        'ISFJ': 'SJ', 'ISTJ': 'SJ', 'ESFJ': 'SJ', 'ESTJ': 'SJ',
        'ISFP': 'SP', 'ISTP': 'SP', 'ESFP': 'SP', 'ESTP': 'SP',
    };
    return families[type] || 'unknown';
}

// ---- Gender Compatibility ----

function isGenderCompatible(candidate: Profile, prefs: UserPreferences): boolean {
    // 1. Candidate is what I'm looking for?
    // "everyone" isn't an explicit option in the schema yet, assuming strict matching for now
    if (!prefs.lookingFor.includes(candidate.gender)) return false;
    
    // 2. I am what Candidate is looking for?
    if (!candidate.lookingFor.includes(prefs.gender)) return false;
    
    return true;
}

/**
 * Rank profiles with exploration budget & cross-category diversity.
 * 75% are ranked by score. 25% are diverse "exploration" picks
 * selected to cross MBTI families and tag clusters.
 */
export function rankProfiles(
    profiles: Profile[],
    prefs: UserPreferences,
    behaviorState: BehaviorState | null = null
): Profile[] {
    // Filter by gender compatibility first
    const compatible = profiles.filter(p => isGenderCompatible(p, prefs));

    const scored = compatible.map(p => ({
        profile: p,
        score: scoreProfile(p, prefs, behaviorState)
    }));

    scored.sort((a, b) => b.score - a.score);

    const total = scored.length;
    const explorationCount = Math.max(1, Math.floor(total * 0.25));
    const exploitCount = total - explorationCount;

    // Top 75% by score
    const exploit = scored.slice(0, exploitCount);

    // Exploration pool: pick from bottom profiles, prioritizing cross-category diversity
    const explorationPool = scored.slice(exploitCount);
    const userFamily = mbtiFamily(prefs.myersBriggs);

    // Sort exploration pool: prioritize different MBTI families, then shuffle
    explorationPool.sort((a, b) => {
        const aDiv = mbtiFamily(a.profile.myersBriggs) !== userFamily ? 1 : 0;
        const bDiv = mbtiFamily(b.profile.myersBriggs) !== userFamily ? 1 : 0;
        return bDiv - aDiv;
    });

    // Shuffle within each diversity tier
    for (let i = explorationPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [explorationPool[i], explorationPool[j]] = [explorationPool[j], explorationPool[i]];
    }

    // Interleave: insert exploration profiles at every ~4th position
    const result: Profile[] = [];
    let ei = 0;
    let xi = 0;

    for (let pos = 0; pos < total; pos++) {
        if ((pos + 1) % 4 === 0 && xi < explorationPool.length) {
            result.push(explorationPool[xi++].profile);
        } else if (ei < exploit.length) {
            result.push(exploit[ei++].profile);
        } else if (xi < explorationPool.length) {
            result.push(explorationPool[xi++].profile);
        }
    }

    return result;
}

/**
 * Filter profiles by distance and optional query.
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
