import { writable, derived } from 'svelte/store';
import { account, appwriteConfigured } from '$lib/appwrite';
import { log, warn } from '$lib/logger';
import type { Models } from 'appwrite';

export const user = writable<Models.User<Models.Preferences> | null>(null);
export const isLoading = writable(true);
export const isAuthenticated = derived(user, ($user) => $user !== null);

export async function initUser() {
    isLoading.set(true);
    if (!appwriteConfigured) {
        user.set(null);
        isLoading.set(false);
        return;
    }
    log('[initUser] Starting auth check...');
    try {
        // Race against a timeout to prevent infinite loading
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Auth timeout")), 5000)
        );
        
        log('[initUser] Racing account.get() vs timeout...');
        const u = await Promise.race([account.get(), timeout]);
        log('[initUser] Auth success:', u);
        user.set(u as Models.User<Models.Preferences>);
    } catch (e: any) {
        warn('[initUser] Auth check failed or timed out:', e.message || e);
        user.set(null);
    } finally {
        log('[initUser] Setting isLoading = false');
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
