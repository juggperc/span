import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';
import { warn } from '$lib/logger';

const endpoint = (PUBLIC_APPWRITE_ENDPOINT ?? '').trim();
const projectId = (PUBLIC_APPWRITE_PROJECT_ID ?? '').trim();

export const appwriteConfig = {
  endpoint,
  projectId,
  isConfigured: Boolean(endpoint && projectId),
};

if (!appwriteConfig.isConfigured) {
  warn(
    'Appwrite is not configured. Set PUBLIC_APPWRITE_ENDPOINT and PUBLIC_APPWRITE_PROJECT_ID for full functionality.'
  );
}
