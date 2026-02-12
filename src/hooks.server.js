import { dev } from '$app/environment';
import { error as logError } from '$lib/logger';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const response = await resolve(event);

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    if (!dev) {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    return response;
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }) {
    // @ts-ignore — error type varies by runtime
    logError('Server error:', error);
    return {
        message: 'Something went wrong. Please try again.',
    };
}
