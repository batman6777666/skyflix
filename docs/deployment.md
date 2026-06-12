# ☁️ Deployment Guide

## Frontend → Cloudflare Pages

### Prerequisites

- GitHub repository with code
- Cloudflare account (free tier)

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/skyflix.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Log in to Cloudflare Dashboard
   - Go to **Pages** → **Create a project** → **Connect to Git**
   - Authorize and select your repository
   - Configure build:
     - **Framework:** Vite
     - **Build command:** `cd frontend && npm install && npm run build`
     - **Build output:** `frontend/dist`
     - **Root directory:** (leave blank — we use `cd frontend` in the build command)

3. **Environment Variables**
   Add in Cloudflare Pages dashboard:
   ```
   VITE_API_URL=https://your-backend.hf.space
   ```

4. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will build and deploy automatically
   - First deployment takes ~2 minutes

### Post-Deploy

- **Custom domain:** Go to **Pages** → your project → **Custom domains** → add your domain
- **Automatic HTTPS:** Enabled by default
- **Cache:** `_headers` and `_redirects` files handle caching automatically

### Build Configuration (Alternative)

Create `.cloudflare.json` in frontend root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

---

## Backend → Hugging Face Spaces

### Prerequisites

- Hugging Face account
- Docker installed (for local testing)

### Steps

1. **Create a Space**
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces)
   - Click **Create new Space**
   - **Space name:** `skyflix-api`
   - **License:** MIT
   - **Space SDK:** Docker
   - **Docker template:** Blank

2. **Push to Space**
   ```bash
   git clone https://huggingface.co/spaces/yourusername/skyflix-api
   cd skyflix-api
   # Copy backend/ contents into this directory
   cp -r /path/to/skyflix/backend/* .
   git add .
   git commit -m "Initial deploy"
   git push
   ```

3. **Set Secrets (Environment Variables)**
   In Space settings → **Repository secrets**:
   ```
   MONGO_URI=mongodb+srv://...
   TMDB_API_KEY=your_key
   TMDB_ACCESS_TOKEN=your_token
   RPMSHARE_API_KEY=your_key
   JWT_SECRET=your_secret
   CLIENT_URL=https://your-frontend.pages.dev
   NODE_ENV=production
   PORT=7860
   ```

4. **Deploy**
   - Push triggers automatic build
   - Docker builds from `Dockerfile`
   - Space starts on port `7860`

### Important Notes

- **Port:** Hugging Face Spaces expose port `7860`. Set `PORT=7860` in secrets
- **Health check:** `https://yourusername-skyflix-api.hf.space/api/health`
- **Cold starts:** Spaces sleep after inactivity. First request may take 30-60s
- **Upgrade:** Consider `CPU upgrade` to `2 vCPU` for better performance

---

## Production Checklist

- [ ] MongoDB Atlas cluster (M0 free tier or higher)
- [ ] TMDB API key registered
- [ ] RPMShare API key added
- [ ] JWT secret changed to random 64-char string
- [ ] Cloudflare Pages custom domain configured
- [ ] Hugging Face Space secrets set
- [ ] Frontend `VITE_API_URL` points to HF Space URL
- [ ] CORS whitelist updated with production domains
- [ ] Rate limiting enabled (default: 200 req/15min)
- [ ] Helmet security headers active
- [ ] `NODE_ENV=production` set
- [ ] Robots.txt in public/
- [ ] Sitemap submitted to Google Search Console
