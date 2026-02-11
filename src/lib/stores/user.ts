import { writable, derived } from 'svelte/store';
import { account } from '$lib/appwrite';
import type { Models } from 'appwrite';

export const user = writable<Models.User<Models.Preferences> | null>(null);
export const isLoading = writable(true);
export const isAuthenticated = derived(user, ($user) => $user !== null);

export async function initUser() {
    isLoading.set(true);
    try {
        const u = await account.get();
        user.set(u);
    } catch (e) {
        user.set(null);
    } finally {
        isLoading.set(false);
    }
}

export async function logout() {
    try {
        await account.deleteSession('current');
    } catch {
        // session may already be gone
    }
    user.set(null);
}

export function getUserId(): string | null {
    let id: string | null = null;
    user.subscribe(u => { id = u?.$id ?? null; })();
    return id;
}
