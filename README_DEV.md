# Development: quick start

Purpose: run the project in development mode (frontend + backend) locally.

Prerequisites:
- Node >= 18, npm >= 9
- MongoDB (or use cloud DB configured in `backend/.env`)

Commands:

1) Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

2) Start both servers from project root

```bash
./start-dev.sh
```

Notes:
- Frontend dev script uses `npm run dev:hot` which runs Vite in development mode (host 0.0.0.0 port 3000).
- Backend dev script uses `npm run dev` which starts `nodemon server.js` (reads `backend/.env`).
- Environment files:
  - `frontend/.env` and `frontend/.env.development` are set for development.
  - A corrected project root `.env.development` was added to replace the misspelled `.env.devlopment`.
