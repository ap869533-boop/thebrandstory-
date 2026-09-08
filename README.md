# thebrandsstory.

Influencer discovery and brand-collaboration platform.

## Project layout

- `frontend/` — React + Vite application
- `backend/` — Express API, database schema, seed data, and server configuration
- `ecosystem.config.cjs` — PM2 production process configuration
- `nginx.conf.example` and `VPS_DEPLOYMENT_GUIDE.md` — deployment reference files

## Local development

Open two terminals:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

The API runs on port `5000` by default. Configure database and third-party credentials only in `backend/.env`; do not commit that file.

## Production build

```bash
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
```

After building the backend, start it from the project root with `pm2 start ecosystem.config.cjs`.
