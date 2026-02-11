/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error }) {
    // @ts-ignore — error type varies by runtime
    console.error('Unhandled error:', error);
    return {
        message: 'Something went wrong. Please try again.',
    };
}
