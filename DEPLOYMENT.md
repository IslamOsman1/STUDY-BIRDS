# Deployment Guide

This repository is prepared for:

- `client/` on Vercel
- `server/` on Render
- MongoDB on Atlas

## Frontend on Vercel

Official reference:

- Vite on Vercel: https://vercel.com/docs/frameworks/frontend/vite
- Rewrites: https://vercel.com/docs/rewrites

Project settings:

- Framework preset: `Vite`
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Environment variables:

- `VITE_API_URL=https://your-render-service.onrender.com/api`
- `VITE_SITE_URL=https://your-vercel-domain.vercel.app`
- `VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com`

Notes:

- `client/vercel.json` adds the SPA rewrite required for React Router deep links.
- After the first deploy, copy the public Vercel URL and use it in the Render backend env vars.

## Backend on Render

Official reference:

- Blueprint spec: https://render.com/docs/blueprint-spec
- Persistent disks: https://render.com/docs/disks

Project settings:

- Service type: `Web Service`
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

This repo includes `render.yaml` for a Render Blueprint.

Important:

- The Blueprint uses `plan: starter` because the app stores uploaded files locally and attaches a persistent disk.
- Render's filesystem is ephemeral without a disk, so uploads would be lost on redeploy if you switch to `free`.

Environment variables to provide:

- `MONGODB_URI`
  Use your MongoDB Atlas connection string.
- `JWT_SECRET`
  A strong production secret. The Blueprint can generate one automatically.
- `CLIENT_URL`
  Your main Vercel frontend URL.
- `CLIENT_URLS`
  Optional comma-separated allowed origins if you use multiple frontend URLs.
- `GOOGLE_CLIENT_ID`
  Optional if you use Google sign-in.
- `UPLOAD_DIR`
  Already configured in the Blueprint as `/opt/render/project/src/uploads`.

## Recommended Order

1. Deploy the backend on Render with `render.yaml`.
2. Copy the Render API URL.
3. Deploy the frontend on Vercel using the `client` directory.
4. Set `VITE_API_URL` in Vercel to the Render API URL.
5. Copy the Vercel frontend URL.
6. Set `CLIENT_URL` on Render to the Vercel URL.
7. If Google sign-in is enabled, add both production URLs to your Google OAuth allowed origins.

## Example Production Values

Frontend:

```env
VITE_API_URL=https://study-birds-api.onrender.com/api
VITE_SITE_URL=https://study-birds.vercel.app
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Backend:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/study-birds?retryWrites=true&w=majority
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CLIENT_URL=https://study-birds.vercel.app
CLIENT_URLS=https://study-birds.vercel.app,https://www.study-birds.com
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
UPLOAD_DIR=/opt/render/project/src/uploads
```
