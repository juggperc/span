/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }) {
    // @ts-ignore — error type varies by runtime
    console.error('Server error:', error);
    return {
        message: 'Something went wrong. Please try again.',
    };
}
