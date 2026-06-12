---
title: Skyflix
emoji: 🎬
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# 🎬 Skyflix — Modern Movie & TV Streaming Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![MERN Stack](https://img.shields.io/badge/stack-MERN-orange)
![Frontend](https://img.shields.io/badge/frontend-React+TypeScript-61dafb)
![Backend](https://img.shields.io/badge/backend-Node.js+Express-339933)
![Database](https://img.shields.io/badge/database-MongoDB-47A248)
![Deployment](https://img.shields.io/badge/deployment-Cloudflare+HF-FF6F00)

> **Skyflix** is a production-grade, high-performance movie and TV series streaming platform built with the MERN stack. Features a modern React frontend with TypeScript, Tailwind CSS, server-side rendering support, PWA, and comprehensive SEO optimization.

---

## ✨ Features

- ⚡ **Performance First** — Code splitting, lazy loading, vendor chunking, PWA with service worker
- 🎨 **Beautiful UI** — Tailwind CSS, dark theme, responsive for mobile/tablet/desktop/TV
- 🎥 **RPMShare Integration** — Seamless video embedding from RPMShare
- 🔍 **Advanced Search** — Instant multi-type search with TMDB integration
- 📂 **Content Categories** — Movies, Series, Genres, Trending, Popular, Top Rated
- 👤 **User System** — Auth with JWT, watch history, continue watching, watchlist
- 🛠️ **Admin Panel** — Full CMS: manage posts, homepage, duplicates, rename tools, requests
- 🌐 **SEO Optimized** — Dynamic meta tags, structured data, sitemap, robots.txt, canonical URLs
- 📱 **PWA Ready** — Offline support, installable, service worker
- 🚀 **Cloudflare Pages** — Frontend deployed with edge caching
- 🐳 **Docker Support** — Backend ready for Hugging Face Spaces

---

## 🏗️ Architecture

```
skyflix/
├── frontend/         # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (lazy loaded)
│   │   ├── layouts/      # User/Admin layout shells
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── routes/       # Route configuration
│   │   └── styles/       # Global styles
│   └── ...configs
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/       # Environment configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   ├── services/     # Business logic (TMDB, RPMShare, Metadata)
│   │   ├── utils/        # Shared utilities
│   │   └── jobs/         # Background sync jobs
│   └── Dockerfile
└── docs/              # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- TMDB API key (free)
- RPMShare API key

### 1. Clone & Install

```bash
git clone https://github.com/Jay-Naik2526/skyflix.git
cd skyflix

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** — `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skyflix
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token
RPMSHARE_API_KEY=your_rpmshare_api_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend → http://localhost:5173  
Backend API → http://localhost:5000

---

## ☁️ Deployment

### Frontend → Cloudflare Pages

1. Push to GitHub
2. Connect repo in Cloudflare Pages dashboard
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Root directory:** `frontend`
4. Add environment variable: `VITE_API_URL=https://your-api.hf.space`
5. Deploy — SPA routing, caching, and headers handled automatically by `_headers` and `_redirects`

### Backend → Hugging Face Spaces

1. Create a new Space → **Docker**
2. Push the `backend/` directory
3. Set secrets (env vars) in Space settings
4. Space auto-builds from `Dockerfile`
5. Health check: `https://your-space.hf.space/api/health`

---

## 🔐 Security

- Helmet.js for HTTP headers
- CORS with whitelist
- Rate limiting (200 req/15min)
- JWT with httpOnly cookies
- Input validation middleware
- Parameterized MongoDB queries
- No sensitive data in frontend
- All secrets in environment variables

---

## 📊 Performance

- **Code splitting** — Each page is a separate chunk
- **Vendor chunking** — React, UI libs separated
- **Lazy loading** — Pages load on demand
- **PWA service worker** — Offline caching of static assets
- **Cloudflare edge caching** — Static assets cached globally
- **Image optimization** — TMDB responsive images
- **Backend caching** — Homepage (1hr), TV details (30min)

---

## 🌐 SEO

- Dynamic `<title>` and `<meta>` per page
- Open Graph + Twitter Card tags
- Robots.txt + XML sitemap
- Canonical URLs
- Article/TV/Movie structured data ready
- Semantic HTML structure
- Fast LCP with optimized images

---

## 📁 Project Structure (Full)

```
skyflix/
├── README.md
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .cloudflare.json
│   ├── _headers
│   ├── _redirects
│   ├── public/
│   │   └── robots.txt
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types/
│       │   └── index.ts
│       ├── routes/
│       │   └── index.tsx
│       ├── layouts/
│       │   ├── UserLayout.tsx
│       │   └── AdminLayout.tsx
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── MobileTopBar.tsx
│       │   ├── MobileNav.tsx
│       │   ├── Footer.tsx
│       │   ├── HeroBanner.tsx
│       │   ├── Row.tsx
│       │   ├── ContentGrid.tsx
│       │   ├── Skeleton.tsx
│       │   ├── ScrollToTopButton.tsx
│       │   ├── SEOHead.tsx
│       │   ├── RequestModal.tsx
│       │   ├── DetailModal.tsx
│       │   └── admin/
│       │       ├── AdminGuard.tsx
│       │       └── AdminSidebar.tsx
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Search.tsx
│       │   ├── Movies.tsx
│       │   ├── Series.tsx
│       │   ├── Detail.tsx
│       │   ├── Watch.tsx
│       │   ├── Categories.tsx
│       │   ├── Watchlist.tsx
│       │   ├── Download.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── admin/
│       │       ├── ManagePosts.tsx
│       │       ├── PostEditor.tsx
│       │       ├── HomepageManager.tsx
│       │       ├── RenameTool.tsx
│       │       ├── Duplicates.tsx
│       │       └── Requests.tsx
│       ├── hooks/
│       │   ├── useUser.ts
│       │   ├── useScroll.ts
│       │   ├── useScrollRestoration.ts
│       │   └── useSEO.ts
│       ├── services/
│       │   └── api.ts
│       └── utils/
│           ├── embed.ts
│           ├── watchlist.ts
│           └── helpers.ts
├── backend/
│   ├── README.md
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── index.js
│       ├── models/
│       │   ├── Movie.js
│       │   ├── Series.js
│       │   ├── User.js
│       │   ├── Homepage.js
│       │   └── Request.js
│       ├── controllers/
│       │   ├── contentController.js
│       │   ├── authController.js
│       │   └── adminController.js
│       ├── services/
│       │   ├── tmdb.js
│       │   ├── rpmshare.js
│       │   ├── metadata.js
│       │   └── contentService.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorHandler.js
│       │   └── validate.js
│       ├── routes/
│       │   ├── contentRoutes.js
│       │   ├── authRoutes.js
│       │   └── adminRoutes.js
│       ├── jobs/
│       │   └── metadataSync.js
│       ├── debug.js
│       └── test-connection.js
└── docs/
    ├── deployment.md
    ├── architecture.md
    └── api-reference.md
```

---

## 🧪 Testing

```bash
# Backend - Test TMDB connection
cd backend
node src/test-connection.js

# Backend - Debug RPMShare
node src/debug.js

# Frontend - Type check
cd frontend
npm run typecheck

# Frontend - Build
npm run build
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request

---

## 📄 License

MIT — do what you want, just don't blame us.

---

## 👤 Author

**Jay Naik** — [@Jay-Naik2526](https://github.com/Jay-Naik2526)
