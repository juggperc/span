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

| Factor             | Weight | What It Measures                                                    |
| ------------------ | ------ | ------------------------------------------------------------------- |
| Shared interests   | 30%    | Tag overlap between profiles                                        |
| Intent alignment   | 20%    | Relationship type compatibility (serious ↔ casual ↔ open ↔ friends) |
| Values match       | 15%    | Monogamy, kids, substance preferences                               |
| Age proximity      | 12%    | Weighted penalty for age distance                                   |
| Distance           | 12%    | Geographic proximity                                                |
| MBTI compatibility | 6%     | Personality type pairing logic                                      |
| Bio depth          | 5%     | Rewards invested, detailed profiles                                 |

**Behavioral learning** (0–20%) develops over time, learning from dwell time, drawer opens, and like/pass patterns to build **tag affinity scores** that personalize results without creating filter bubbles.

An **exploration budget** (25% of shown profiles) intentionally surfaces cross-category diversity — ensuring users encounter people their engagement patterns might not predict.

### Cognitive Security Features

Drawing from research on algorithmic influence and cognitive autonomy:

- **Breath Transitions** — A 250ms pause between cards prevents rapid-fire swiping and creates space for conscious decision-making.
- **Session Pacing Friction** — After 15+ swipes in under 2 minutes, a full-screen prompt reminds users to slow down. This is anti-engagement design: the app actively discourages compulsive use.
- **Pattern Mirror** — Weekly behavioral summaries (dwell time trends, like/pass ratios, drawer engagement) give users transparent insight into their own habits, interrupting algorithmic entrainment.
- **Anchor Question** — A rotating daily reflection prompt (e.g., "What does someone need to understand about you?") that surfaces on profiles, rewarding emotional depth.
- **Resonance Score** — A transparent compatibility breakdown shown in the profile drawer, making the algorithm legible rather than opaque.
- **Profile Depth Indicator** — Visual dots that reward users who invest in their profile (long bio, many tags, anchor answer).
- **Background Color Temperature** — Ambient color shifts from warm to cool as swipes deplete, creating a visceral sense of finite attention.

### Mutual Reveal

Profile lifecycle details (smoker, wants kids, relationship style, monogamy) are hidden until both users match. This prevents **premature filtering** on details that matter more when you already know someone's vibe.

### span+ (Premium)

$9.99/month unlocks:

- Unlimited swipes
- See who liked you
- Advanced resonance breakdowns
- Priority matching
- Read receipts

## Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | SvelteKit                          |
| Language  | TypeScript                         |
| Styling   | Tailwind CSS v4                    |
| Backend   | Appwrite (Auth, Database, Storage) |
| Icons     | Lucide Svelte                      |
| Fonts     | Geist (Vercel)                     |

## Architecture

```
src/
├── lib/
│   ├── algorithm.ts          # v3 scoring engine (7 factors + behavioral learning)
│   ├── appwrite.ts           # Client setup, collection constants
│   ├── appwrite-db.ts        # Typed CRUD layer for all 5 collections
│   ├── stores/
│   │   ├── user.ts           # Auth state (isLoading, isAuthenticated)
│   │   ├── matches.ts        # Profile data (Appwrite + mock fallback)
│   │   ├── mutual.ts         # Like/match tracking with mutual detection
│   │   ├── behavior.ts       # Behavioral signals (batch sync to Appwrite)
│   │   ├── limits.ts         # Daily counters with Appwrite persistence
│   │   ├── anchor.ts         # Daily reflection prompts
│   │   ├── journal.ts        # Swipe journal entries
│   │   ├── insights.ts       # Pattern Mirror weekly summaries
│   │   └── subscription.ts   # Premium state (Stripe-ready mock)
│   └── components/
│       ├── layout/Navbar.svelte  # Liquid glass bottom navigation
│       └── ui/               # Button, Input, Tag, Card
└── routes/
    ├── +layout.svelte        # Auth guard, responsive shell
    ├── +page.svelte          # Main swipe feed
    ├── login/                # Auth flow
    ├── profile/              # User profile (editable)
    ├── search/               # Interest-based discovery
    ├── messages/             # Matches + mutual reveal
    ├── about/                # Philosophy + algorithm transparency
    ├── insights/             # Pattern Mirror
    └── upgrade/              # Premium paywall
```

## Appwrite Collections

| Collection         | Purpose                               |
| ------------------ | ------------------------------------- |
| `profiles`         | User profiles with all fields         |
| `matches`          | Like/pass records, mutual match state |
| `behavior_signals` | Dwell time, drawer opens, action data |
| `daily_limits`     | Per-user daily counters               |
| `journal_entries`  | Reflection entries                    |

All collections live in database `span_db`. Each store uses Appwrite as primary persistence with localStorage as offline fallback.

## Design Language

- **Liquid glass navbar** — Multi-layer frosted glass with prismatic shimmer, specular highlights, and spring-physics animated indicator
- **Dark mode only** — Deep neutrals with deliberate use of rose/pink accent for love-themed warmth
- **Floating hearts** — Burst animation on like action
- **Micro-animations** — Scale transitions, fade-ins, slide-ups, pulse rings
- **Geist typography** — Clean, modern typeface from Vercel
- **Desktop responsive** — Full-screen mobile → 430px tablet card → 480px desktop → 520px ultrawide

## Getting Started

```bash
# Install
npm install

# Configure environment
cp .env.example .env
# Set PUBLIC_APPWRITE_PROJECT_ID and PUBLIC_APPWRITE_ENDPOINT

# Develop
npm run dev

# Build
npm run build
```

## Environment Variables

```
PUBLIC_APPWRITE_PROJECT_ID=your_project_id
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

## License

MIT
