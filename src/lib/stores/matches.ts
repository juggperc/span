import { writable } from 'svelte/store';

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
}

export const MOCK_PROFILES: Profile[] = [
    {
        id: '1',
        name: 'Sarah',
        age: 24,
        location: 'Brooklyn, NY',
        bio: 'Designer by day, dreamer by night. Love coffee, art galleries, and long walks through the city.',
        tags: ['Design', 'Art', 'Coffee', 'Reading', 'Yoga'],
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60',
        distance: 2.5,
        myersBriggs: 'INFJ',
        smoker: false,
        usesWeed: false,
        wantsKids: 'maybe',
        relationshipType: 'serious',
        monogamy: 'monogamous'
    },
    {
        id: '2',
        name: 'James',
        age: 27,
        location: 'Manhattan, NY',
        bio: 'Software engineer. I build things for the web. Into hiking, photography, and a good pour-over.',
        tags: ['Tech', 'Hiking', 'Photography', 'Coffee', 'Cooking'],
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60',
        distance: 5.1,
        myersBriggs: 'INTJ',
        smoker: false,
        usesWeed: true,
        wantsKids: 'yes',
        relationshipType: 'serious',
        monogamy: 'monogamous'
    },
    {
        id: '3',
        name: 'Elena',
        age: 23,
        location: 'Queens, NY',
        bio: 'Music is life. I play guitar and piano. Looking for someone to jam with and explore the city.',
        tags: ['Music', 'Guitar', 'Piano', 'Concerts', 'Travel'],
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
        distance: 8.0,
        myersBriggs: 'ENFP',
        smoker: false,
        usesWeed: true,
        wantsKids: 'maybe',
        relationshipType: 'casual',
        monogamy: 'open'
    },
    {
        id: '4',
        name: 'Marcus',
        age: 26,
        location: 'Jersey City, NJ',
        bio: 'Fitness enthusiast and personal trainer. Health is wealth. Big on meal prep and sunrise runs.',
        tags: ['Fitness', 'Gym', 'Health', 'Running', 'Nutrition'],
        imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
        distance: 12.3,
        myersBriggs: 'ESTP',
        smoker: false,
        usesWeed: false,
        wantsKids: 'yes',
        relationshipType: 'serious',
        monogamy: 'monogamous'
    },
    {
        id: '5',
        name: 'Mia',
        age: 25,
        location: 'Williamsburg, NY',
        bio: 'Freelance photographer. Always chasing golden hour. Let me take your portrait.',
        tags: ['Photography', 'Art', 'Film', 'Travel', 'Coffee'],
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=60',
        distance: 3.2,
        myersBriggs: 'ISFP',
        smoker: false,
        usesWeed: true,
        wantsKids: 'no',
        relationshipType: 'casual',
        monogamy: 'non-monogamous'
    },
    {
        id: '6',
        name: 'Noah',
        age: 28,
        location: 'Hoboken, NJ',
        bio: 'Product manager by trade, bartender by passion. I make a mean Old Fashioned.',
        tags: ['Cocktails', 'Cooking', 'Tech', 'Basketball', 'Reading'],
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60',
        distance: 14.0,
        myersBriggs: 'ENTP',
        smoker: true,
        usesWeed: false,
        wantsKids: 'maybe',
        relationshipType: 'open',
        monogamy: 'open'
    },
    {
        id: '7',
        name: 'Chloe',
        age: 22,
        location: 'East Village, NY',
        bio: 'Studying architecture. I spend too much time in bookstores and not enough time sleeping.',
        tags: ['Architecture', 'Reading', 'Design', 'Coffee', 'Sketching'],
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60',
        distance: 1.8,
        myersBriggs: 'INFP',
        smoker: false,
        usesWeed: false,
        wantsKids: 'maybe',
        relationshipType: 'serious',
        monogamy: 'monogamous'
    },
    {
        id: '8',
        name: 'Daniel',
        age: 30,
        location: 'SoHo, NY',
        bio: 'Chef at a downtown restaurant. Food is love. Looking for someone who appreciates a home-cooked meal.',
        tags: ['Cooking', 'Food', 'Wine', 'Travel', 'Music'],
        imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=60',
        distance: 4.5,
        myersBriggs: 'ESFJ',
        smoker: false,
        usesWeed: false,
        wantsKids: 'yes',
        relationshipType: 'serious',
        monogamy: 'monogamous'
    }
];

function createMatchesStore() {
    const { subscribe, set, update } = writable<Profile[]>([...MOCK_PROFILES]);

    return {
        subscribe,
        remove: (id: string) => update(profiles => profiles.filter(p => p.id !== id)),
        reset: () => set([...MOCK_PROFILES]),
        set
    };
}

export const matches = createMatchesStore();
