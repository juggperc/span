import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { PUBLIC_APPWRITE_PROJECT_ID, PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';

// --- Client setup ---
export const client = new Client();

client
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// --- Collection IDs ---
// Create these collections in your Appwrite console
export const DB_ID = 'span_db';

export const COLLECTIONS = {
    PROFILES: 'profiles',
    MATCHES: 'matches',
    BEHAVIOR_SIGNALS: 'behavior_signals',
    DAILY_LIMITS: 'daily_limits',
    JOURNAL_ENTRIES: 'journal_entries',
} as const;

// Storage bucket for profile images
export const BUCKET_ID = 'profile_images';

// Re-export for convenience
export { ID, Query };
