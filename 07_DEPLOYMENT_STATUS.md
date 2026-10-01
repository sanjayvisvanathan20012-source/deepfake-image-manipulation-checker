# Deployment Status

## Milestone 7: Production Containerization

The Deepfake & Image Manipulation Checker (TrueLens) has been successfully containerized using Docker and Docker Compose.

### Backend Services
- **Image Size**: Lightweight (built on `python:3.11-slim` with CPU-only PyTorch wheels).
- **Security**: Runs under a non-root user (`appuser`).
- **Rate Limiting**: Integrated `slowapi`. `POST /api/v1/analyze/full` is rate-limited to 15 requests per minute per IP to prevent resource exhaustion.
- **Port**: Exposes `8001`.

### Frontend Services
- **Multi-stage Build**: Built using Node.js, served using a lightweight Nginx image (`nginx:alpine`).
- **Reverse Proxy**: Nginx is configured to serve static React/Vite assets and internally reverse proxy `/api/` traffic to the backend container.
- **Port**: Exposes `80`.

### Local Deployment Instructions

To spin up the full stack locally:
```bash
docker compose up --build
```
Once deployed, access the frontend at `http://localhost` and the API at `http://localhost/api/v1/analyze/full`.

### Cloud Deployment Runbook

#### 1. Push to GitHub
Initialize your repository and commit all files (ensuring the new `.gitignore` files exclude heavy artifacts):
```bash
git init
git add .
git commit -m "Initial commit for TrueLens"
git branch -M main
git remote add origin https://github.com/<your-username>/truelens.git
git push -u origin main
```

#### 2. Backend: Render (512MB Free Tier) or Hugging Face Spaces (Docker)
The backend container is heavily optimized for ultra-low memory footprints (<180MB RAM) on Render's free tier or Hugging Face Spaces.
- PyTorch threads are limited to 1 at startup to prevent excessive CPU allocation.
- The `uvicorn` instance spins exactly 1 worker.
- Model weights (`SyntheticImageDetector`) are initialized lazily inside `get_model()` only when inference is actually called.
- The container listens dynamically on `${PORT:-10000}`.
1. Create a new Space on Hugging Face. Select **Docker** as the SDK and **Blank** template.
2. In the repository settings of your Space, push the `backend` directory. 
   *(Alternatively, link your GitHub repo and configure the build context to `backend/`)*.
3. The Space will automatically build the `backend/Dockerfile`. It will bind to port `7860` dynamically.
4. Note your Space URL: `https://<your-username>-<space-name>.hf.space`.

#### 3. Frontend: Vercel
Vercel is ideal for our Vite/React frontend.
1. Go to Vercel and import your GitHub repository.
2. Set the Root Directory to `frontend`.
3. Vercel will automatically detect Vite. Set the build command to `npm run build` and output directory to `dist`.
4. In the Environment Variables section, add:
   - `VITE_API_URL` = `https://<your-username>-<space-name>.hf.space` (from Step 2)
5. Deploy.
6. **Important:** Go back to your Hugging Face Space settings and add a secret/variable `ALLOWED_ORIGINS` = `https://<your-vercel-domain>.vercel.app`. The backend will dynamically parse this and allow CORS requests from your deployed frontend.

### Zero-Retention Guarantee
Even in production, the application maintains its zero-storage guarantee. All images uploaded are processed dynamically in-memory (`io.BytesIO`) and purged immediately.
