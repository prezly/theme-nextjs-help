# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prezly Bea Theme - a Next.js 15 newsroom/help center theme powered by the Prezly SDK. It fetches and displays stories, categories, galleries, and media from Prezly's content delivery API.

## Common Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # Run Biome linter
npm run lint:fix     # Auto-fix lint issues
npm run format       # Check formatting
npm run format:fix   # Auto-format code
npm run check        # Run all Biome checks (lint + format)
npm run test         # Run Playwright tests
```

## Architecture

### App Router Structure

All pages use Next.js App Router under `app/[localeCode]/`:
- `(index)/page.tsx` - Homepage
- `(story)/[slug]/page.tsx` - Story detail pages
- `(story)/preview/[uuid]/page.tsx` - Story previews
- `category/[slug]/page.tsx` - Category listing
- `media/page.tsx` and `media/album/[uuid]/page.tsx` - Galleries
- `search/page.tsx` - Search results
- `tag/[tag]/page.tsx` - Tag filtering
- `(policies)/` - Cookie and privacy policy pages

### Key Architectural Patterns

**Server/Client Adapter Pattern**: The `src/adapters/` directory separates server and client concerns:
- `@/adapters/server` - Server-side data fetching via `app()` helper (wraps Prezly Theme Kit)
- `@/adapters/client` - Client-side hooks and context providers

**Data Fetching**: All Prezly API calls go through `src/adapters/server/app.ts` which wraps the Theme Kit's `contentDelivery` methods. The `app()` function provides access to newsroom data, stories, categories, languages, and theme settings.

**Context Providers**: The root layout (`app/[localeCode]/layout.tsx`) wraps the app in multiple providers for routing, internationalization, cookie consent, theme settings, and broadcast channels.

**Modules vs Components**:
- `src/components/` - Reusable UI components (Button, Modal, FormInput, etc.)
- `src/modules/` - Feature modules with business logic (Story, Header, Footer, Search, Analytics, etc.)

### Path Aliases

Defined in `tsconfig.json`:
- `@/adapters/server`, `@/adapters/client` - Server/client adapters
- `@/components/*` - UI components
- `@/modules/*` - Feature modules
- `@/hooks` - Custom React hooks
- `@/icons` - SVG icons
- `@/utils` - Utility functions
- `@/theme-settings` - Theme configuration types and defaults
- `@/styles/*` - Global styles and SCSS variables

### Styling

- SCSS Modules (`.module.scss`) for component styles
- Global SCSS variables/mixins auto-imported from `src/styles/variables` and `src/styles/mixins`
- Tailwind CSS also available (configured in `tailwind.config.js`)
- SVGs imported as React components via `@svgr/webpack`

### Internationalization

Multi-language support via `@prezly/theme-kit-nextjs` and React Intl. The middleware (`middleware.ts`) handles locale detection and routing. All routes are prefixed with `[localeCode]`.

### Environment Variables

Required in `.env.local`:
- `PREZLY_ACCESS_TOKEN` - Prezly API token
- `PREZLY_NEWSROOM_UUID` - Newsroom identifier
- `PREZLY_THEME_UUID` - Theme preset ID (default provided for Bea theme)
- `MEILISEARCH_API_KEY` - Search functionality

Optional:
- `REDIS_CACHE_URL` - Caching
- `NEXT_PUBLIC_HCAPTCHA_SITEKEY` - Form spam protection
- `SENTRY_DSN` - Error tracking

### Testing

Playwright tests in `tests/` directory. Run with `npm run test`.

## Git Workflow

When working on new features:

1. **Create a feature branch** - Before starting work on a new feature, ask for the branch name and create a new branch from `main`
2. **Run checks before committing** - Always run `pnpm check` and fix any Biome errors/warnings before committing
3. **Commit regularly** - Make frequent commits to the feature branch as work progresses
4. **Push when done** - When the feature is complete, push the branch to GitHub
