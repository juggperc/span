import { dev } from '$app/environment';
import { PRIVATE_ADMIN_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { ADMIN_COOKIE_MAX_AGE, ADMIN_COOKIE_NAME } from '$lib/admin-auth';

async function readSecret(request: Request): Promise<string> {
  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      return typeof body?.secret === 'string' ? body.secret : '';
    }
    const form = await request.formData();
    const secret = form.get('secret');
    return typeof secret === 'string' ? secret : '';
  } catch {
    return '';
  }
}

export async function POST({ request, cookies }) {
  if (!PRIVATE_ADMIN_SECRET) {
    return json({ ok: false, error: 'Admin secret not configured.' }, { status: 500 });
  }

  const secret = await readSecret(request);
  if (!secret || secret !== PRIVATE_ADMIN_SECRET) {
    return json({ ok: false, error: 'Invalid admin secret.' }, { status: 401 });
  }

  cookies.set(ADMIN_COOKIE_NAME, '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return json({ ok: true });
}

export async function DELETE({ cookies }) {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
  return json({ ok: true });
}
