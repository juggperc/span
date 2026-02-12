import { browser } from '$app/environment';
import { warn } from '$lib/logger';

export function readStorage<T>(key: string): T | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    warn(`Failed to read localStorage key "${key}"`, err);
    return null;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (!browser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    warn(`Failed to write localStorage key "${key}"`, err);
  }
}

export function removeStorage(key: string): void {
  if (!browser) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    warn(`Failed to remove localStorage key "${key}"`, err);
  }
}
