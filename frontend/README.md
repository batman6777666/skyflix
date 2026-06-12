# 🎨 Skyflix Frontend

> React + TypeScript + Vite + Tailwind CSS — Streaming UI

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** — fast builds and HMR
- **Tailwind CSS 3** — utility-first styling
- **React Router 7** — SPA routing with lazy loading
- **Lucide React** — clean SVG icons
- **Headless UI** — accessible modals and transitions
- **Vite PWA Plugin** — service worker + offline support

## Architecture

```
src/
├── components/    # Reusable UI components
├── pages/         # Route-level page components (lazy loaded)
├── layouts/       # UserLayout and AdminLayout shells
├── hooks/         # Custom hooks (user, scroll, SEO)
├── services/      # API client
├── types/         # TypeScript interfaces
├── utils/         # Helpers (embeds, watchlist)
├── routes/        # Route configuration with code splitting
└── styles/        # Global CSS (Tailwind)
```

## Key Features

- **Code splitting** — Each page is a separate chunk loaded on demand
- **Vendor chunking** — React/ReactDOM and UI libraries in separate bundles
- **PWA** — Service worker caches assets, installable on mobile
- **SEO** — Dynamic meta tags via hook, robots.txt
- **Responsive** — Mobile, tablet, desktop, TV
- **Infinite scroll** — IntersectionObserver-based pagination
- **Continue watching** — Watch history with progress tracking
- **Watchlist** — LocalStorage-based bookmark system

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint check |

## Environment

```env
VITE_API_URL=http://localhost:5000
```

## Cloudflare Pages Build Settings

- **Build command:** `npm run build`
- **Build output:** `dist`
- **Root directory:** (current — `frontend/`)
