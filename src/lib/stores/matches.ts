import { writable } from 'svelte/store';

export interface Profile {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    tags: string[];
    imageUrl: string;
    distance: number; // km
}

const MOCK_PROFILES: Profile[] = [
    {
        id: '1',
        name: 'Sarah',
        age: 24,
        location: 'Brooklyn, NY',
        bio: 'Designer by day, dreamer by night. Love coffee, art galleries, and long walks.',
        tags: ['Design', 'Art', 'Coffee', 'INFJ'],
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D',
        distance: 2.5
    },
    {
        id: '2',
        name: 'James',
        age: 27,
        location: 'Manhattan, NY',
        bio: 'Software engineer. I build things for the web. Into hiking and photography.',
        tags: ['Tech', 'Hiking', 'Photography', 'INTJ'],
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D',
        distance: 5.1
    },
    {
        id: '3',
        name: 'Elena',
        age: 23,
        location: 'Queens, NY',
        bio: 'Music is life. I play guitar and piano. Looking for someone to jam with.',
        tags: ['Music', 'Guitar', 'Piano', 'ENFP'],
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D',
        distance: 8.0
    },
    {
        id: '4',
        name: 'Marcus',
        age: 26,
        location: 'Jersey City, NJ',
        bio: 'Fitness enthusiast and personal trainer. Health is wealth.',
        tags: ['Fitness', 'Gym', 'Health', 'ESTP'],
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D',
        distance: 12.3
    }
];

function createMatchesStore() {
    const { subscribe, set, update } = writable<Profile[]>(MOCK_PROFILES);

    return {
        subscribe,
        remove: (id: string) => update(profiles => profiles.filter(p => p.id !== id)),
        reset: () => set(MOCK_PROFILES)
    };
}

export const matches = createMatchesStore();
