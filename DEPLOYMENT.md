# VoxMarket Deployment Guide (Vercel & Netlify)

This guide explains how to deploy your **VoxMarket** application to Vercel and Netlify. The project has been configured to support both backend (NestJS) and frontend (React/Vite) in a serverless environment.

## ⚠️ Important Considerations

1.  **Serverless Limitations**:
    - **WebSockets**: Real-time features (Co-Browsing, Chat, Gamification) relying on persistent WebSockets **will not work regularly** on Vercel/Netlify Serverless functions, as they have execution timeouts and don't support persistent connections.
        - *Workaround*: For production real-time features, use a dedicated WebSocket provider (like Pusher, Ably) or deploy the backend to a VPS/PaaS (Railway, Render, DigitalOcean).
    - **File Uploads**: The `uploads` folder is ephemeral. Files uploaded to the local disk will **disappear** after the request finishes.
        - *Fix*: Ensure you are using **Cloudinary** (configured in your modules) or AWS S3 for file storage.

2.  **Database**:
    - Ensure your MongoDB is hosted in the cloud (e.g., MongoDB Atlas). Local `localhost` connection strings will not work.

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

The project is configured with a `vercel.json` for a monorepo deployment.

1.  **Install Vercel CLI** (optional): `npm install -g vercel`
2.  **Deploy**:
    Run the following command from the root directory:
    ```bash
    vercel
    ```
3.  **Environment Variables**:
    Go to the Vercel Dashboard > Settings > Environment Variables and add:
    - `MONGODB_URI`: Your MongoDB connection string.
    - `JWT_SECRET`: Your secret key.
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For images.
    - `VITE_API_URL`: Set this to `/api` (since Vercel rewrites handles the routing).

### How it works
- `vercel.json` configures the backend to run as a Serverless Function via `backend/api/index.ts`.
- It serves the Frontend as a static site and rewrites `/api/*` requests to the backend.

---

## ⚡ Option 2: Deploy to Netlify

1.  **Deploy**:
    Run:
    ```bash
    netlify deploy
    ```
    Or connect your repository in the Netlify Dashboard.

2.  **Build Settings**:
    - **Base directory**: `.` (Root)
    - **Build command**: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
    - **Publish directory**: `frontend/dist`

3.  **Environment Variables**:
    Set `MONGODB_URI`, `JWT_SECRET`, etc., in Netlify Site Settings.

---

## 🛠 Project Changes Made

- **`backend/api/index.ts`**: Created a specific entry point for Serverless functions.
- **`backend/src/setup.ts`**: Extracted app configuration logic to be shared between `main.ts` (local) and `api/index.ts` (cloud).
- **`vercel.json`**: Added configuration for Monorepo deployment (Frontend + Backend).
- **`netlify.toml`**: Added configuration for Netlify Functions and Redirects.
