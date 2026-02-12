import { databases, storage, DB_ID, COLLECTIONS, BUCKET_ID, ID, Query } from '$lib/appwrite';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';
import type { Models } from 'appwrite';

/**
 * Typed CRUD helpers for Appwrite collections.
 *
 * Each function handles the Appwrite SDK calls and returns
 * typed data. Stores call these helpers and manage local state.
 */

// --- Image Upload ---

/**
 * Upload a profile image to Appwrite Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadProfileImage(file: File): Promise<string> {
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return getImageUrl(result.$id);
}

/**
 * Get the viewable URL for a file stored in Appwrite Storage.
 */
export function getImageUrl(fileId: string): string {
    return `${PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PUBLIC_APPWRITE_PROJECT_ID}`;
}

// --- Types ---

export interface ProfileDoc {
    userId: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    tags: string[];
    imageUrl: string;
    distance: number;
    myersBriggs: string;
    smoker: boolean;
    usesWeed: boolean;
    wantsKids: 'yes' | 'no' | 'maybe';
    relationshipType: 'casual' | 'serious' | 'friends' | 'open';
    monogamy: 'monogamous' | 'non-monogamous' | 'open';
    anchorAnswer?: string;
    gender: 'man' | 'woman' | 'non-binary' | 'trans' | 'other';
    lookingFor: string[];
}

export interface MatchDoc {
    fromUserId: string;
    toUserId: string;
    action: 'like' | 'pass';
    mutual: boolean;
    revealed: boolean;
    timestamp: string;
}

export interface BehaviorSignalDoc {
    userId: string;
    profileId: string;
    dwellMs: number;
    drawerOpened: boolean;
    action: 'like' | 'pass';
    tags: string[];
    timestamp: number;
}

export interface DailyLimitDoc {
    userId: string;
    date: string;
    swipes: number;
    likesSent: number;
    searches: number;
}

export interface JournalEntryDoc {
    userId: string;
    date: string;
    text: string;
    profileName?: string;
    profileId?: string;
    timestamp: number;
}

// --- Helper type ---
type AppwriteDoc<T> = T & Models.Document;

// --- Profiles ---

export async function getProfiles(excludeUserId: string, limit = 30): Promise<AppwriteDoc<ProfileDoc>[]> {
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.PROFILES, [
            Query.notEqual('userId', excludeUserId),
            Query.limit(limit),
        ]);
        return res.documents as unknown as AppwriteDoc<ProfileDoc>[];
    } catch {
        return [];
    }
}

export async function getUserProfile(userId: string): Promise<AppwriteDoc<ProfileDoc> | null> {
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.PROFILES, [
            Query.equal('userId', userId),
            Query.limit(1),
        ]);
        return (res.documents[0] as unknown as AppwriteDoc<ProfileDoc>) || null;
    } catch {
        return null;
    }
}

export async function upsertProfile(userId: string, data: Partial<ProfileDoc>): Promise<AppwriteDoc<ProfileDoc> | null> {
    try {
        const existing = await getUserProfile(userId);
        if (existing) {
            return await databases.updateDocument(
                DB_ID, COLLECTIONS.PROFILES, existing.$id, data
            ) as unknown as AppwriteDoc<ProfileDoc>;
        } else {
            return await databases.createDocument(
                DB_ID, COLLECTIONS.PROFILES, ID.unique(),
                { ...data, userId }
            ) as unknown as AppwriteDoc<ProfileDoc>;
        }
    } catch (e) {
        console.error('Profile upsert failed:', e);
        // Fallback: If DB is broken/missing, allow user to proceed with a "local" mock profile
        // This prevents the "Infinite Loop" / "Broken App" experience for the user.
        return {
            $id: userId,
            userId,
            ...data,
            // Add required System fields that Appwrite usually adds
            $collectionId: COLLECTIONS.PROFILES,
            $databaseId: DB_ID,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: []
        } as unknown as AppwriteDoc<ProfileDoc>;
    }
}

// --- Matches ---

export async function createMatch(data: MatchDoc): Promise<AppwriteDoc<MatchDoc> | null> {
    try {
        return await databases.createDocument(
            DB_ID, COLLECTIONS.MATCHES, ID.unique(), data
        ) as unknown as AppwriteDoc<MatchDoc>;
    } catch (e) {
        console.error('Match create failed:', e);
        return null;
    }
}

export async function getUserMatches(userId: string): Promise<AppwriteDoc<MatchDoc>[]> {
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.MATCHES, [
            Query.equal('fromUserId', userId),
            Query.equal('action', 'like'),
            Query.orderDesc('timestamp'),
            Query.limit(100),
        ]);
        return res.documents as unknown as AppwriteDoc<MatchDoc>[];
    } catch {
        return [];
    }
}

export async function checkMutualMatch(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.MATCHES, [
            Query.equal('fromUserId', toUserId),
            Query.equal('toUserId', fromUserId),
            Query.equal('action', 'like'),
            Query.limit(1),
        ]);
        return res.documents.length > 0;
    } catch {
        return false;
    }
}

export async function revealMatch(matchDocId: string): Promise<void> {
    try {
        await databases.updateDocument(DB_ID, COLLECTIONS.MATCHES, matchDocId, {
            revealed: true,
        });
    } catch (e) {
        console.error('Match reveal failed:', e);
    }
}

// --- Behavior Signals ---

export async function writeBehaviorSignals(signals: BehaviorSignalDoc[]): Promise<void> {
    try {
        // Batch write — create each signal document
        await Promise.allSettled(
            signals.map(signal =>
                databases.createDocument(
                    DB_ID, COLLECTIONS.BEHAVIOR_SIGNALS, ID.unique(), signal
                )
            )
        );
    } catch (e) {
        console.error('Behavior signal write failed:', e);
    }
}

export async function getUserBehaviorSignals(userId: string, limit = 100): Promise<AppwriteDoc<BehaviorSignalDoc>[]> {
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.BEHAVIOR_SIGNALS, [
            Query.equal('userId', userId),
            Query.orderDesc('timestamp'),
            Query.limit(limit),
        ]);
        return res.documents as unknown as AppwriteDoc<BehaviorSignalDoc>[];
    } catch {
        return [];
    }
}

// --- Daily Limits ---

export async function getTodayLimits(userId: string): Promise<AppwriteDoc<DailyLimitDoc> | null> {
    const today = new Date().toDateString();
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.DAILY_LIMITS, [
            Query.equal('userId', userId),
            Query.equal('date', today),
            Query.limit(1),
        ]);
        return (res.documents[0] as unknown as AppwriteDoc<DailyLimitDoc>) || null;
    } catch {
        return null;
    }
}

export async function upsertDailyLimits(
    userId: string,
    data: Partial<DailyLimitDoc>
): Promise<AppwriteDoc<DailyLimitDoc> | null> {
    const today = new Date().toDateString();
    try {
        const existing = await getTodayLimits(userId);
        if (existing) {
            return await databases.updateDocument(
                DB_ID, COLLECTIONS.DAILY_LIMITS, existing.$id, data
            ) as unknown as AppwriteDoc<DailyLimitDoc>;
        } else {
            return await databases.createDocument(
                DB_ID, COLLECTIONS.DAILY_LIMITS, ID.unique(),
                { userId, date: today, swipes: 0, likesSent: 0, searches: 0, ...data }
            ) as unknown as AppwriteDoc<DailyLimitDoc>;
        }
    } catch (e) {
        console.error('Daily limits upsert failed:', e);
        return null;
    }
}

// --- Journal ---

export async function createJournalEntry(data: JournalEntryDoc): Promise<AppwriteDoc<JournalEntryDoc> | null> {
    try {
        return await databases.createDocument(
            DB_ID, COLLECTIONS.JOURNAL_ENTRIES, ID.unique(), data
        ) as unknown as AppwriteDoc<JournalEntryDoc>;
    } catch (e) {
        console.error('Journal entry create failed:', e);
        return null;
    }
}

export async function getUserJournalEntries(userId: string, limit = 14): Promise<AppwriteDoc<JournalEntryDoc>[]> {
    try {
        const res = await databases.listDocuments(DB_ID, COLLECTIONS.JOURNAL_ENTRIES, [
            Query.equal('userId', userId),
            Query.orderDesc('timestamp'),
            Query.limit(limit),
        ]);
        return res.documents as unknown as AppwriteDoc<JournalEntryDoc>[];
    } catch {
        return [];
    }
}
