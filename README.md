# EduResult Pro - Deployment Guide

This project is optimized for seamless deployment on **Netlify** and **Vercel**.

## 🚀 One-Click Deployment

### Netlify
1. Connect your GitHub repository to Netlify.
2. Netlify will automatically detect the `netlify.toml` file.
3. **Build Command:** `npm run build`
4. **Publish Directory:** `dist`
5. (Optional) Add `GEMINI_API_KEY` in Environment Variables if using AI features.

### Vercel
1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the `vercel.json` file.
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. (Optional) Add `GEMINI_API_KEY` in Environment Variables if using AI features.

## 🛠 Local Development
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Build for production: `npm run build`

## 📄 SPA Routing
Both configurations include rules to handle Single Page Application (SPA) routing, ensuring that all paths are redirected to `index.html` so React Router (if added) or internal routing works correctly.
