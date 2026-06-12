# 📚 API Reference

Base URL: `https://your-backend.hf.space/api`

All responses follow this format:
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Error description" }
```

---

## Content Endpoints

### `GET /content/home`

Returns homepage data with banner and sections.

**Response:**
```json
{
  "banner": [
    {
      "id": 123,
      "title": "Movie Title",
      "backdrop_path": "https://image.tmdb.org/t/p/original/...",
      "vote_average": 8.5
    }
  ],
  "sections": [
    {
      "title": "Trending Movies",
      "data": [ ... ]
    }
  ]
}
```

### `GET /content/movies`

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 24 | Items per page |
| sort | string | "popular" | "popular" or "latest" |
| genre | string | — | Filter by genre ID |

### `GET /content/series`

Same query params as movies.

### `GET /content/search?query=`

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| query | yes | Search term |

### `GET /content/movie/:id`

Returns merged TMDB + DB movie details.

### `GET /content/tv/:id`

Returns TV series with seasons and episodes. Merges TMDB metadata with DB file codes.

### `GET /content/similar/:type/:id`

| Param | Values |
|-------|--------|
| type | "movie" or "tv" |
| id | TMDB ID |

### `GET /content/genres`

Returns both movie and TV genres.

### `POST /content/request`

**Body:**
```json
{
  "title": "Movie/Series Name",
  "year": "2024",
  "platform": "Netflix"
}
```

---

## Auth Endpoints

### `POST /auth/register`

**Body:** `{ "username", "email", "password" }`
**Response:** Sets httpOnly cookie with JWT.

### `POST /auth/login`

**Body:** `{ "email", "password" }`
**Response:** Sets httpOnly cookie with JWT.

### `POST /auth/logout`

Clears auth cookie.

### `GET /auth/me`

Requires auth cookie. Returns current user data.

### `PUT /auth/history`

Requires auth cookie.

**Body:**
```json
{
  "contentId": "mongo_id",
  "onModel": "Movie",
  "progress": 300,
  "duration": 6000,
  "season": 1,
  "episode": 4
}
```

---

## Admin Endpoints

All admin endpoints require valid auth cookie + admin role.

### `GET /admin/stats`

```json
{
  "totalMovies": 150,
  "totalSeries": 80,
  "pendingRequests": 5
}
```

### `GET /admin/posts?page=1&limit=50&search=`

### `GET /admin/post?id=&type=MOVIE|Series`

### `PUT /admin/post`

**Body:** `{ "id", "type", "data": { ...fields } }`
Triggers RPMShare rename if title changed.

### `DELETE /admin/post?id=&type=MOVIE|Series`

Deletes from DB + RPMShare.

### `GET /admin/homepage`

### `PUT /admin/homepage`

**Body:** `{ "bannerItems": [...], "categories": [...] }`

### `GET /admin/duplicates`

Finds duplicate TMDB IDs.

### `GET /admin/requests`

### `DELETE /admin/request?id=`

### `DELETE /admin/posts/all`

Dangerous — deletes all movies and series.

---

## System

### `GET /api/health`

```json
{ "success": true, "status": "ok", "uptime": 12345 }
```

### `GET /`

```json
{ "success": true, "name": "Skyflix API", "version": "2.0.0" }
```
