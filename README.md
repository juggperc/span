# Span - Dating App

A mindful dating application focused on swiping intentionality and algorithmic transparency.

> [!NOTE]
> This project is currently in active development.

## 🚀 Recent Updates (Fixed Logic)

### 1. **Infinite Loading Resolved**

- **Problem**: Missing Appwrite Database/Collections caused the app to fail silently or redirect infinitely between Home and Onboarding.
- **Fix**:
  - Implemented a **Mock Fallback**: If the database is missing, the app now uses a local mock profile so you can still experience the UI.
  - Added **Timeout Protection**: `initUser` now races against a 5s timeout to prevent hanging.
  - **Robust Navigation**: Replaced `goto` with `window.location` to prevent crashes.

### 2. **Admin Panel**

- **Route**: `/admin`
- **Secret**: `span_admin_secret_key_2026`
- **Features**:
  - **Seed Users**: Generate 5 mock profiles instantly.
  - **Flush**: Reset all data.

### 3. **Future Agents Tasks**

- **Migration**: Move to Svelte 5 (Runes).
- **PWA**: Add `manifest.json` and service worker.
- **Type Safety**: Harden `behavior.ts` types.

---

## 🛠️ Setup Requirements

> [!IMPORTANT]
> **Database Setup is Critical for Real Data**
> While the app now works in "Mock Mode" without a DB, for real persistence you must set up Appwrite:

1.  **Appwrite Project**: Ensure you have a running Appwrite instance (or Cloud).
2.  **Env Variables**: `PUBLIC_APPWRITE_PROJECT_ID` and `PUBLIC_APPWRITE_ENDPOINT` in `.env`.
3.  **Database Structure**:
    - **Database ID**: `span_db`
    - **Collection ID**: `profiles`
      - Attributes: `name` (string), `age` (integer), `gender` (string), `lookingFor` (string array), `bio` (string), `imageUrl` (string/url), `tags` (string array), ...

---

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Deployment

### Vercel

The easiest way to build and deploy is via Vercel.

1. Push code to GitHub.
2. Import project into Vercel.
3. Add Environment Variables (`PUBLIC_APPWRITE...`, `PUBLIC_ADMIN_SECRET`).
4. Deploy.

### Appwrite Cloud

Host your backend on Appwrite Cloud (free tier available).

1. Create Project.
2. Create Database `span_db`.
3. Create Collection `profiles`.
4. Set Permissions (Role: Any can create/read, User can update/delete their own).

## License

MIT
