# 🚀 Skyflix Backend API

> Node.js + Express + MongoDB — Streaming API Server

## Tech Stack

- **Node.js 20** with Express 5
- **MongoDB** with Mongoose 9
- **JWT** authentication with httpOnly cookies
- **Helmet** security headers
- **Rate limiting** (express-rate-limit)
- **Morgon** request logging

## Architecture

```
src/
├── app.js              # Express app entry point
├── config/             # Environment config
├── controllers/        # Request handlers
├── middleware/          # Auth, validation, error handling
├── models/             # Mongoose schemas
├── routes/             # Express routers
├── services/           # Business logic (TMDB, RPMShare, Metadata)
├── utils/              # Shared utilities
└── jobs/               # Background sync jobs
```

## API Endpoints

### Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content/home` | Homepage with banner + sections |
| GET | `/api/content/movies` | Paginated movies list |
| GET | `/api/content/series` | Paginated series list |
| GET | `/api/content/search?query=` | Multi-type search |
| GET | `/api/content/movie/:id` | Movie details (TMDB + DB merge) |
| GET | `/api/content/tv/:id` | TV details with seasons/episodes |
| GET | `/api/content/similar/:type/:id` | Recommendations |
| GET | `/api/content/genres` | Movie + TV genres |
| POST | `/api/content/request` | Submit content request |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current user (protected) |
| PUT | `/api/auth/history` | Update watch history (protected) |

### Admin (all require admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/posts` | All posts with search/pagination |
| GET | `/api/admin/post` | Single post details |
| PUT | `/api/admin/post` | Update post (triggers RPM rename) |
| DELETE | `/api/admin/post` | Delete post + RPM files |
| GET | `/api/admin/files` | List RPMShare files |
| POST | `/api/admin/files/rename` | Batch rename RPM files |
| GET | `/api/admin/homepage` | Homepage config |
| PUT | `/api/admin/homepage` | Save homepage config |
| GET | `/api/admin/duplicates` | Find duplicate TMDb entries |
| GET | `/api/admin/requests` | Content requests list |
| DELETE | `/api/admin/request` | Delete request |
| DELETE | `/api/admin/posts/all` | Delete all content |
| POST | `/api/admin/fix-indexes` | Fix DB indexes |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/` | API info |

## API Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

```json
{
  "success": false,
  "message": "Error description"
}
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with `--watch` for development |
| `npm start` | Production start |
| `npm run debug` | Test RPMShare connection |
| `npm run test-connection` | Test TMDB connection |

## Environment Variables

See `.env.example` for all required variables.
