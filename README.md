
# Eco-Pantry

Eco-Pantry is a full-stack app to help households reduce food waste by tracking pantry inventory, scanning fridge/receipt images, generating zero-waste recipes, and coordinating donations to nearby NGOs.

This repository contains:

- `web/` — Vite + React frontend (UI, scanner, chat widget, pages)
- `server/` — Express API and MongoDB models (inventory, recipes, donations, chat, auth)
- `android/` — Android app skeleton (Kotlin)

Quick start (development)

1. Install dependencies from the repository root:

```powershell
npm install
```

2. Create environment variables for the server. Example keys are shown in `server/.env.example`.

3. Start both frontend and backend in development:

```powershell
npm run dev
```

Run just the frontend or backend:

```powershell
npm run dev:frontend
npm run dev:backend
```

Important environment variables (see `server/.env.example`):

- `MONGO_URI` — MongoDB connection string (required)
- `JWT_SECRET` — JWT signing secret for auth
- `GROQ_API_KEY` — API key for Groq AI services (vision, chat, transcription). If missing, AI features will fall back to mock responses.
- `GOOGLE_MAPS_API_KEY` — optional, used to find nearby NGOs
- `FRONTEND_URL` — optional, allowed CORS origin for production frontend

Useful endpoints (server)

- `GET /api/inventory` — list inventory items (uses `x-user-id` header to scope by family)
- `POST /api/inventory/scan` — upload image for AI-based scan and auto-add items
- `POST /api/recipes/generate` — generate zero-waste recipes from soon-to-expire items
- `POST /api/chat` — inventory-aware AI assistant (message + optional history)
- `GET /health` — health/readiness probe (checks DB connectivity)

Notes and development tips

- The server relies heavily on external AI services (Groq). For offline development, the server provides mock fallbacks but results differ from production.
- End-to-end tests use Selenium/Chromedriver (`npm run test:e2e`). See `run_e2e_tests.js` for details.
- Consider adding a `.env.example` file (already present in `server/.env.example`) to share required variables without secrets.

If you want, I can also add CI, Docker support, and basic tests.
