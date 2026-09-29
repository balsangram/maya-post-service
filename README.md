# Maya Post Service

TypeScript backend microservice for Maya Friends Post management.

---

## 🛠️ Tech Stack & Scripts

- **Runtime**: Node.js (ESM - `"type": "module"`)
- **Language**: TypeScript 5.9+
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose

### Local Development
```bash
# Run with TSX hot-reloading
npm run dev
```

### Production Build & Run
```bash
# Build TypeScript to dist/
npm run build

# Start production server
npm start
```

---

## 🚀 Render Deployment Guide

When creating a **Web Service** on [Render](https://render.com):

| Setting | Value |
| --- | --- |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` (or `/post/health`) |

### Required Environment Variables on Render

Ensure the following environment variables are added to your Render dashboard under **Environment**:

- `MONGO_URI`: Your MongoDB connection string (e.g. `mongodb+srv://...`)
- `ACCESS_TOKEN_SECRET`: Secret key for signing access tokens
- `REFRESH_TOKEN_SECRET`: Secret key for signing refresh tokens
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for media uploads
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `NODE_ENV`: `production`

*(Note: Render automatically injects and manages `PORT` - the application dynamically binds to `0.0.0.0:${PORT}`)*
