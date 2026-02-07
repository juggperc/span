# span

A modern, minimalist dating application built for intentional connections.

## Overview

Span is designed to reduce decision fatigue and promote meaningful interaction through strict daily limits. By constraining the number of swipes, likes, and searches, users are encouraged to view profiles with greater attention and care. The interface follows a strict minimalist aesthetic, prioritizing content and clarity over ornamentation.

## Core Mechanics

### Daily Limits

To foster intentionality, Span enforces the following constraints per 24-hour cycle:

- **20 Swipes**: Users may view a maximum of 20 profiles per day.
- **5 Likes**: A maximum of 5 likes may be sent or received.
- **5 Searches**: Discovery queries are limited to 5 per day.

### Discovery

- **Curated Feed**: A "For You" page algorithmically suggests profiles based on age, location, and shared interests.
- **Search**: A dedicated search tab allows for specific interest-based queries (e.g., "Photography", "INFJ") within an adjustable radius.

### Identity

Profiles are detailed yet concise, featuring:

- **Vitals**: Age, height, location, and occupation.
- **Tags**: Interactive tags for hobbies, personality types (Myers-Briggs), and lifestyle choices.
- **Bio**: A text area for personal expression.

## Technology Stack

### Frontend

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font**: Geist Sans

### Backend

- **Platform**: Appwrite
- **Authentication**: Email/Password
- **Database**: Collections for Users, Profiles, and Matches.

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/juggperc/span.git
    cd span
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env` file in the root directory with the following keys:

    ```
    PUBLIC_APPWRITE_PROJECT_ID=your_project_id
    PUBLIC_APPWRITE_PROJECT_NAME=span
    PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
    ```

4.  Start the development server:

    ```bash
    npm run dev
    ```

5.  Build for production:
    ```bash
    npm run build
    ```

## Architecture

The application utilizes Svelte stores for local state management, ensuring a responsive user experience. Limits are currently tracked client-side for immediate feedback, with plans for server-side enforcement via Appwrite Functions.

- `src/routes`: Application pages and routing logic.
- `src/lib/components`: Reusable UI components (Button, Card, Input).
- `src/lib/stores`: State management for User session and Limits.
- `src/lib/appwrite.ts`: Appwrite client configuration.

## License

MIT
