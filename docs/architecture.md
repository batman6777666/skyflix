# 🏗️ Architecture

## Overview

Skyflix follows a **decoupled architecture** with separate frontend and backend deployments. The frontend is a static SPA served by Cloudflare Pages. The backend is a REST API server running in a Docker container on Hugging Face Spaces.

```
┌─────────────────────┐     ┌──────────────────────┐
│    Cloudflare       │     │  Hugging Face        │
│    Pages            │     │  Spaces              │
│                     │     │                      │
│  ┌───────────────┐  │     │  ┌────────────────┐  │
│  │ React SPA     │  │─────┼─▶│ Express API    │  │
│  │ (Static)      │  │     │  │ (Docker)       │  │
│  └───────────────┘  │     │  └───────┬────────┘  │
└─────────────────────┘     │          │           │
                            │  ┌───────▼────────┐  │
                            │  │  MongoDB Atlas  │  │
                            │  └────────────────┘  │
                            │                      │
                            │  ┌────────────────┐  │
                            │  │  TMDB API      │  │
                            │  │  RPMShare API  │  │
                            │  └────────────────┘  │
                            └──────────────────────┘
```

## Data Flow

### Content Discovery (Homepage)

```
User opens skyflix.app
       │
       ▼
React Home page mounts
       │
       ▼
fetchHomeContent() called
       │
       ▼
GET /api/content/home
       │
       ▼
Backend checks homeCache (1hr TTL)
       │
       ├── Cache hit → return cached data
       │
       └── Cache miss → fetch from TMDB:
                         - trending (all/movie/tv)
                         - popular (movies/tv)
                         - top rated, now playing, etc.
                         - Filter genre sections
                         - Attach file data from DB
                         - Cache and return
       │
       ▼
Frontend renders:
  - HeroBanner (first 6 trending movies)
  - Row components (one per section)
```

### Content Streaming

```
User clicks "Watch Now" on movie
       │
       ▼
Detail page or Watch page mounted
       │
       ▼
Construct embed URL:
  getMovieEmbedUrl(title, year)
       │
       ▼
Set iframe src → RPMShare player loads
       │
       ▼
User watches → progress tracked via
updateWatchHistory() on interval
```

### Admin Content Management

```
Admin edits movie title
       │
       ▼
PUT /api/admin/post
       │
       ▼
Backend:
  1. Updates MongoDB document
  2. If title changed + fileCode exists
     → PATCH RPMShare API to rename file
  3. Returns success
```

## Key Design Decisions

### 1. Frontend-Backend Decoupling
- No SSR — static SPA deployed to CDN
- All dynamic data fetched via REST API
- Frontend can be developed independently

### 2. Caching Strategy
| Cache | TTL | Location |
|-------|-----|----------|
| Homepage content | 1 hour | Backend memory |
| TV details | 30 min | Backend memory Map |
| Static assets | 1 year | CDN (Cloudflare) |
| API responses | 0 (no-cache) | N/A |

### 3. Layered Backend
```
Route → Controller → Service → External API/DB
```
- **Routes** — HTTP method + path, validation
- **Controllers** — Request parsing, response formatting
- **Services** — Business logic, external API calls
- **Models** — MongoDB schema, data access

### 4. Security Layers
- **Helmet** — HTTP headers
- **CORS** — Domain whitelist
- **Rate limiting** — Per-IP throttling
- **JWT** — httpOnly cookies
- **Input validation** — Middleware checks
- **Error handler** — No stack traces in production
