import { PRIVATE_ADMIN_SECRET } from '$env/static/private';
import { ADMIN_COOKIE_NAME } from '$lib/admin-auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
  const adminEnabled = Boolean(PRIVATE_ADMIN_SECRET);
  const authenticated = adminEnabled && cookies.get(ADMIN_COOKIE_NAME) === '1';

  return {
    adminEnabled,
    authenticated,
  };
};
