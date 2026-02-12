import { writable } from 'svelte/store';
import { getProfiles } from '$lib/appwrite-db';
import type { ProfileDoc } from '$lib/appwrite-db';
import { error } from '$lib/logger';

export interface Profile {
    id: string;
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

/**
 * Convert Appwrite profile doc to local Profile type.
 */
function docToProfile(doc: ProfileDoc & { $id: string }): Profile {
    return {
        id: doc.$id,
        name: doc.name,
        age: doc.age,
        location: doc.location,
        bio: doc.bio,
        tags: doc.tags,
        imageUrl: doc.imageUrl,
        distance: doc.distance,
        myersBriggs: doc.myersBriggs,
        smoker: doc.smoker,
        usesWeed: doc.usesWeed,
        wantsKids: doc.wantsKids,
        relationshipType: doc.relationshipType,
        monogamy: doc.monogamy,
        anchorAnswer: doc.anchorAnswer,
        gender: doc.gender,
        lookingFor: doc.lookingFor,
    };
}

function createMatchesStore() {
    const { subscribe, set, update } = writable<Profile[]>([]);

    return {
        subscribe,

        /**
         * Load profiles from Appwrite.
         */
        loadFromAppwrite: async (excludeUserId: string) => {
            try {
                const docs = await getProfiles(excludeUserId);
                if (docs.length > 0) {
                    set(docs.map(docToProfile));
                }
            } catch (err) {
                error('Failed to load profiles:', err);
            }
        },

        remove: (id: string) => update(profiles => profiles.filter(p => p.id !== id)),
        reset: () => set([]),
        set
    };
}

export const matches = createMatchesStore();
