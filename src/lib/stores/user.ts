import { writable } from 'svelte/store';
import { account } from '$lib/appwrite'; // Adjusted path if needed, assuming alias or direct path
import type { Models } from 'appwrite';

export const user = writable<Models.User<Models.Preferences> | null>(null);

export async function initUser() {
    try {
        const u = await account.get();
        user.set(u);
    } catch (e) {
        user.set(null);
    }
}

export async function logout() {
    await account.deleteSession('current');
    user.set(null);
}
