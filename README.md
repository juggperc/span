# span

> Dating for the intentional.

**span** is a dating app built on the principle that less choice leads to better connections. Inspired by research in cognitive security and algorithmic design ethics, span constrains interaction to promote depth, patience, and genuine human judgment.

## Philosophy

Most dating apps optimize for engagement — more swipes, more time on screen, more dopamine. **span** optimizes for the opposite: _fewer, better decisions_.

The core thesis: when you can only see 20 profiles a day and like 5, you start paying attention differently. You read bios. You think before you swipe. You notice what matters to you — not what the algorithm thinks matters.

## Core Mechanisms

### Daily Limits

| Resource     | Limit  | Purpose                      |
| ------------ | ------ | ---------------------------- |
| **Swipes**   | 20/day | Forces selective attention   |
| **Likes**    | 5/day  | Each like becomes meaningful |
| **Searches** | 5/day  | Reduces compulsive browsing  |

Limits reset every 24 hours. A visual **temperature gradient** shifts from warm amber to cool blue as daily swipes deplete, creating a physical sense of decreasing abundance.

### Algorithm v3 — Intent-Aware Matching

span's matching algorithm scores profiles across 7 weighted factors:

| Factor             | Weight | What It Measures                      |
| ------------------ | ------ | ------------------------------------- |
| Shared interests   | 30%    | Tag overlap between profiles          |
| Intent alignment   | 20%    | Relationship type compatibility       |
| Values match       | 15%    | Monogamy, kids, substance preferences |
| Age proximity      | 12%    | Weighted penalty for age distance     |
| Distance           | 12%    | Geographic proximity                  |
| MBTI compatibility | 6%     | Personality type pairing logic        |
| Bio depth          | 5%     | Rewards invested, detailed profiles   |

**Behavioral learning** (0–20%) develops over time, learning from dwell time, drawer opens, and like/pass patterns to build **tag affinity scores** that personalize results without creating filter bubbles.

An **exploration budget** (25% of shown profiles) intentionally surfaces cross-category diversity — ensuring users encounter people their engagement patterns might not predict.

### Cognitive Security Features

- **Breath Transitions** — A 250ms pause between cards prevents rapid-fire swiping
- **Session Pacing Friction** — After 15+ fast swipes, a prompt reminds users to slow down
- **Pattern Mirror** — Weekly behavioral summaries give users transparent insight into their own habits
- **Anchor Question** — A rotating daily reflection prompt that rewards emotional depth
- **Resonance Score** — A transparent compatibility breakdown in the profile drawer
- **Profile Depth Indicator** — Visual dots rewarding invested profiles
- **Background Color Temperature** — Ambient color shifts as swipes deplete

### Mutual Reveal

Lifestyle details (smoker, wants kids, relationship style) are hidden until both users match. This prevents premature filtering on details that matter more in context.

### span+ (Premium)

$9.99/month unlocks unlimited swipes, see who liked you, advanced resonance breakdowns, priority matching, and read receipts. Currently a mock paywall — Stripe integration ready.

---

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | SvelteKit                          |
| Language   | TypeScript                         |
| Styling    | Tailwind CSS v4                    |
| Backend    | Appwrite (Auth, Database, Storage) |
| Icons      | Lucide Svelte                      |
| Fonts      | Geist (Vercel)                     |
| Deployment | Vercel                             |

## Architecture

```
src/
├── lib/
│   ├── algorithm.ts            # v3 scoring engine (7 factors + behavioral learning)
│   ├── appwrite.ts             # Client setup, collection constants
│   ├── appwrite-db.ts          # Typed CRUD layer for all 5 collections
│   ├── stores/
│   │   ├── user.ts             # Auth state (isLoading, isAuthenticated)
│   │   ├── matches.ts          # Profile data (Appwrite + mock fallback)
│   │   ├── mutual.ts           # Like/match tracking with mutual detection
│   │   ├── behavior.ts         # Behavioral signals (batch sync to Appwrite)
│   │   ├── limits.ts           # Daily counters with Appwrite persistence
│   │   ├── anchor.ts           # Daily reflection prompts
│   │   ├── journal.ts          # Swipe journal entries
│   │   ├── insights.ts         # Pattern Mirror weekly summaries
│   │   └── subscription.ts     # Premium state (Stripe-ready mock)
│   └── components/
│       ├── layout/Navbar.svelte    # Liquid glass bottom navigation
│       └── ui/                     # Button, Input, Tag, Card
├── routes/
│   ├── +layout.svelte          # Auth guard, responsive shell
│   ├── +error.svelte           # Error boundary
│   ├── +page.svelte            # Main swipe feed
│   ├── login/                  # Auth flow
│   ├── onboarding/             # 5-step profile setup
│   ├── profile/                # User profile (editable)
│   ├── search/                 # Interest-based discovery
│   ├── messages/               # Matches + mutual reveal
│   ├── about/                  # Philosophy + algorithm transparency
│   ├── insights/               # Pattern Mirror
│   └── upgrade/                # Premium paywall
├── hooks.client.js             # Client error handler
├── hooks.server.js             # Server error handler
├── app.html                    # HTML shell with SEO meta
└── app.css                     # Global styles + animations
```

---

## Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- [Appwrite](https://appwrite.io/) account (Cloud or self-hosted)
- [Vercel](https://vercel.com/) account (for deployment)

### 1. Clone and Install

```bash
git clone https://github.com/juggperc/span.git
cd span
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Appwrite credentials:

```env
PUBLIC_APPWRITE_PROJECT_ID=your_project_id
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

### 3. Set Up Appwrite

#### Option A: Appwrite Cloud (Recommended)

1. Sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project
3. Copy the **Project ID** → paste into `.env`
4. Set the **endpoint** (usually `https://cloud.appwrite.io/v1`)
5. Add your domain to **Platforms** → Web App (e.g. `localhost` for dev, `your-domain.vercel.app` for prod)

#### Option B: Self-Hosted Appwrite (Docker)

```bash
# Install Appwrite via Docker
docker run -it --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
    --entrypoint="install" \
    appwrite/appwrite:1.6.0

# Appwrite runs on http://localhost/v1 by default
# Set PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1 in .env
```

Follow the interactive installer. Default port is 80. Access the console at `http://localhost`.

### 4. Create Database and Collections

In the Appwrite Console:

1. **Create Database** → ID: `span_db`

2. **Create Collections** with the following schemas:

#### `profiles` (ID: `profiles`)

| Attribute          | Type                                  | Required | Notes   |
| ------------------ | ------------------------------------- | -------- | ------- |
| `userId`           | String (128)                          | ✅       | Indexed |
| `name`             | String (128)                          | ✅       |         |
| `age`              | Integer                               | ✅       |         |
| `location`         | String (256)                          | ❌       |         |
| `bio`              | String (2048)                         | ❌       |         |
| `tags`             | String[] (64)                         | ❌       |         |
| `imageUrl`         | URL                                   | ❌       |         |
| `distance`         | Float                                 | ❌       |         |
| `myersBriggs`      | String (4)                            | ❌       |         |
| `smoker`           | Boolean                               | ❌       |         |
| `usesWeed`         | Boolean                               | ❌       |         |
| `wantsKids`        | Enum (yes/no/maybe)                   | ❌       |         |
| `relationshipType` | Enum (casual/serious/friends/open)    | ❌       |         |
| `monogamy`         | Enum (monogamous/non-monogamous/open) | ❌       |         |
| `anchorAnswer`     | String (1024)                         | ❌       |         |

#### `matches` (ID: `matches`)

| Attribute    | Type             | Required |
| ------------ | ---------------- | -------- |
| `fromUserId` | String (128)     | ✅       |
| `toUserId`   | String (128)     | ✅       |
| `action`     | Enum (like/pass) | ✅       |
| `mutual`     | Boolean          | ✅       |
| `revealed`   | Boolean          | ✅       |
| `timestamp`  | String (64)      | ✅       |

#### `behavior_signals` (ID: `behavior_signals`)

| Attribute      | Type             | Required |
| -------------- | ---------------- | -------- |
| `userId`       | String (128)     | ✅       |
| `profileId`    | String (128)     | ✅       |
| `dwellMs`      | Integer          | ✅       |
| `drawerOpened` | Boolean          | ✅       |
| `action`       | Enum (like/pass) | ✅       |
| `tags`         | String[] (64)    | ❌       |
| `timestamp`    | Integer          | ✅       |

#### `daily_limits` (ID: `daily_limits`)

| Attribute   | Type         | Required |
| ----------- | ------------ | -------- |
| `userId`    | String (128) | ✅       |
| `date`      | String (64)  | ✅       |
| `swipes`    | Integer      | ✅       |
| `likesSent` | Integer      | ✅       |
| `searches`  | Integer      | ✅       |

#### `journal_entries` (ID: `journal_entries`)

| Attribute     | Type          | Required |
| ------------- | ------------- | -------- |
| `userId`      | String (128)  | ✅       |
| `date`        | String (64)   | ✅       |
| `text`        | String (4096) | ✅       |
| `profileName` | String (128)  | ❌       |
| `profileId`   | String (128)  | ❌       |
| `timestamp`   | Integer       | ✅       |

3. **Set Permissions** on each collection:
   - Document Security → **Enabled**
   - For `profiles`: `Any` → Read, `Users` → Create, `Document Owner` → Read/Update
   - For all others: `Users` → Create, `Document Owner` → Read/Update/Delete

4. **Create Indexes** (recommended):
   - `profiles`: Index on `userId` (key, unique)
   - `matches`: Index on `fromUserId` (key) + Index on `toUserId` (key)
   - `daily_limits`: Compound index on `userId` + `date` (key, unique)
   - `behavior_signals`: Index on `userId` (key)
   - `journal_entries`: Index on `userId` (key)

### 5. Enable Authentication

In the Appwrite Console:

1. Go to **Auth** → **Settings**
2. Enable **Email/Password** authentication
3. (Optional) Configure email verification and password recovery

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Create an account and complete onboarding.

---

## Deployment

### Deploy to Vercel

1. **Import project** at [vercel.com/new](https://vercel.com/new)
2. Connect your GitHub repository
3. **Set environment variables** in Vercel dashboard:
   ```
   PUBLIC_APPWRITE_PROJECT_ID = your_project_id
   PUBLIC_APPWRITE_ENDPOINT = https://cloud.appwrite.io/v1
   ```
4. **Deploy** — Vercel auto-detects SvelteKit and builds with the Vercel adapter
5. **Add your Vercel domain** to Appwrite:
   - Appwrite Console → Your Project → **Platforms** → Add Web App
   - Add `your-project.vercel.app` (and any custom domains)

### Deploy Anywhere Else

span uses `@sveltejs/adapter-vercel` by default. To deploy elsewhere:

```bash
# For Node.js servers
npm install -D @sveltejs/adapter-node
# Update svelte.config.js to use adapter-node

# For static hosting (Netlify, Cloudflare Pages)
npm install -D @sveltejs/adapter-static
# Update svelte.config.js to use adapter-static
```

Build for production:

```bash
npm run build
npm run preview  # test the production build locally
```

### Custom Domain

1. Add your domain in Vercel → Project → Settings → Domains
2. Update DNS records as instructed
3. Add the custom domain to Appwrite Platforms
4. SSL is automatic via Vercel

---

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # TypeScript + Svelte checks
```

## License

MIT
