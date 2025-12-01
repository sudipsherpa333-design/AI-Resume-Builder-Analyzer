Admin Frontend

This is a minimal scaffold for a separate Admin Panel frontend.
It is intentionally small so you can extend it quickly.

How it connects:
- The admin frontend expects the API endpoints to live at the same origin under `/api/admin/*` (for example: `http://localhost:5001/api/admin/stats`).
- The main project already exposes admin endpoints under `backend/src/routes/adminRoutes.js`. You can keep using that backend or extract the admin routes into a separate service.

Run locally (from this folder):

1. Install dependencies

   npm install

2. Start dev server

   npm run dev

Notes:
- Use `VITE_API_BASE` env var or change the axios base URL in `src/api.js` if your API is on a different host/port.
- This scaffold includes Dashboard and Users pages and a simple layout.
