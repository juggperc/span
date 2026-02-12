# Span - Dating App

A mindful dating application focused on swiping intentionality and algorithmic transparency.

## 🚀 Recent Updates

### 1. **Infinite Loading Fix**

- Resolved an issue where the app would hang on the splash screen due to authentication timeouts or missing database collections.
- Added a 5-second race timeout to `initUser` to prevent hanging.
- Replaced SvelteKit `goto` with `window.location.href` in critical redirect paths (Home and Onboarding) to prevent `ReferenceError` crashes.

### 2. **Admin Panel**

- Access at `/admin`.
- **Secret Key**: Check `.env` (default: `span_admin_secret_key_2026`).
- **Features**:
  - **User List**: View all registered users.
  - **Flush All**: Delete all user profiles to reset the system.
  - **Seed Users**: One-click generation of 5 mock profiles for testing matching algorithms.

### 3. **Onboarding Refactor**

- Removed photo upload (replaced with **Facehash** / Dicebear avatars for privacy & speed).
- Added **Gender & Preference** selection (Man, Woman, Non-binary / Seeking same).
- Direct integration with Appwrite Database.

## 🛠️ Setup Requirements

> [!IMPORTANT]
> **Database Setup is Critical**
> SvelteKit 404 errors during loading often mean the Appwrite Database is missing.

1.  **Appwrite Project**: Ensure you have a running Appwrite instance (or Cloud).
2.  **Env Variables**: `PUBLIC_APPWRITE_PROJECT_ID` and `PUBLIC_APPWRITE_ENDPOINT` must be set in `.env`.
3.  **Database Structure**:
    - **Database ID**: `span_db`
    - **Collection ID**: `profiles`
      - Attributes: `name` (string), `age` (integer), `gender` (string), `lookingFor` (string array), `bio` (string), `imageUrl` (string/url), `tags` (string array), ...

## 📦 commands

- `npm run dev` - Start development server.
- `npm run build` - Build for production.
