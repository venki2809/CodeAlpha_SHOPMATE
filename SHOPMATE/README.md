# SHOPMATE · Complete Full-Stack Interactive Demo

A clean, responsive, working e-commerce project for college/internship demonstrations.
**React + Vite frontend, Node.js + Express REST API backend, JWT authentication, bcryptjs password hashing, and a real MongoDB-compatible local database option.**

The frontend design is preserved from the original SHOPMATE interactive demo. Products, user accounts and orders now come from the backend, not browser-local fake APIs.

## QUICK START · Windows CMD or VS Code terminal

1. Extract the ZIP and open the inner `SHOPMATE` folder in VS Code.
2. Open **Terminal > New Terminal** in that folder (it must show `frontend/`, `backend/` and `package.json`).
3. Run:

```cmd
npm install
npm run dev
```

4. Open **http://localhost:5173/**. This is your **single website link**: Vite forwards `/api` requests to Express, so you don't need to open a second backend page.
5. To check the backend separately when troubleshooting, visit http://localhost:5000/api/health. Expected: `{"ok":true,"service":"SHOPMATE API", "database":"mongodb-local"}` or `"database":"json"`.

**First launch:** default `DATA_MODE=auto` tries MongoDB Memory Server. It may download a ~600 MB MongoDB executable the first time (internet required). If unavailable, the backend automatically switches to a **persistent local JSON database** so your demo still works. **No MongoDB Atlas account or credentials required.**

### For immediate launch with no MongoDB download

Create a file named `backend/.env` with this line (or copy `backend/.env.example` first):

```env
DATA_MODE=json
```

Then `npm run dev` again. This uses the **real Express backend** and saves users, products and orders in `backend/.local/shopmate-data.json`. It is a JSON database, **not MongoDB**. To specifically demonstrate MongoDB, use `DATA_MODE=mongo` (download/install requirements apply) and verify the health endpoint says `mongodb-local`.

**Demo account:**
- Email: `demo@shopmate.test`
- Password: `Demo@12345`

You can register your own demo account using the Register page. Do not use a real personal password for a demo.

## Features

- Homepage, searchable product catalog, five categories, sorting/filtering, detail and offer pages
- 20 realistic sample products and Unsplash product photograph URLs (internet needed for photos)
- Add/remove cart items, increase/decrease quantity, subtotal and free-shipping calculation
- Real HTTP API for login, registration and profile; password hashes on server; JWT-protected routes
- Demo Cash on Delivery checkout with server-calculated totals, stock validation, stock deduction
- Order confirmation and private order history persisted in backend database
- Responsive design for desktop, tablet and mobile
- Loading, empty, validation and error states
- Backend product auto-seeding and demo account creation on first startup

**Important:** This is a demo. No real payments, shipping or delivery happen. Do not deploy on the public internet without production security, operational and payment work. A production multi-server checkout needs a transactional database.

## Structure

```text
SHOPMATE/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/api.js  # Fetches /api; Vite proxy connects to Express
│   │   └── styles/
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── config/database.js   # Local embedded MongoDB or JSON fallback
│   ├── models/              # Mongoose User, Product, Order
│   ├── controllers/         # Auth, product and order handlers
│   ├── routes/              # REST endpoints
│   ├── middleware/          # JWT guard and errors
│   ├── services/            # Data access, validation, persisted JSON fallback
│   ├── data/sampleProducts.json
│   ├── .env.example
│   └── server.js
├── package.json             # One-command concurrent dev startup
└── README.md
```

## API endpoints

| Method | Route | Usage |
|---|---|---|
| GET | `/api/health` | Server and database mode |
| GET | `/api/products` | Search, category, featured/newArrival/offers, sort, page, limit |
| GET | `/api/products/:slugOrId` | Single product |
| GET | `/api/categories` | Category list |
| POST | `/api/auth/register` | New account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (Bearer token) |
| PUT | `/api/auth/profile` | Update name, phone, address |
| POST | `/api/orders` | Checkout (Bearer token) |
| GET | `/api/orders` | My orders |
| GET | `/api/orders/:id` | Order details owned by user |

### Configuration

`backend/.env` is optional. See `backend/.env.example` for `PORT`, `CLIENT_URL`, `DATA_MODE`, `MONGOMS_VERSION`, `MONGODB_URI`, `JWT_SECRET`.
The first run generates a random JWT secret and persists it in an ignored local file. Never commit `.env` or `.local` to GitHub.

- `DATA_MODE=auto` (default) — try embedded local MongoDB, otherwise persistent JSON fallback.
- `DATA_MODE=json` — persistent JSON; instant/offline startup.
- `DATA_MODE=mongo` — require MongoDB, and error rather than using fallback.
- `MONGODB_URI=...` — optional custom MongoDB connection (not required for the demo).

**Data location:** JSON mode: `backend/.local/shopmate-data.json`. Embedded MongoDB mode: `backend/.local/mongodb` (WiredTiger data). Do not manually edit these while running.

## Optional commands

```cmd
npm run test        # backend validation tests
npm run build       # production frontend compilation
npm run seed -w backend
```

For production-style single-origin preview (serves built frontend from Express on port 5000):

```cmd
npm run build
set NODE_ENV=production
npm start
```

Open **http://localhost:5000/**. (`set NODE_ENV=production` is CMD syntax; in PowerShell use `$env:NODE_ENV='production'`.)

## Presentation walkthrough

Open homepage → shop by Shoes → search products → view product → add to bag → change quantity → demo login → complete checkout form → view order success → open Profile → see saved order → edit name → refresh to demonstrate backend persistence. Use `http://localhost:5000/api/health` to show Express + database mode; code also includes 3 Mongoose models.

## Troubleshooting

- **`Cannot find package.json`:** you are one folder too high. `cd SHOPMATE`, then `dir package.json`.
- **`Cannot find module 'dotenv'`:** run `npm install` **in the inner SHOPMATE folder**.
- **`querySrv ENOTFOUND YOUR_CLUSTER`:** this project needs no Atlas. Delete placeholder `MONGODB_URI` from `.env` or use `DATA_MODE=json`.
- **MongoDB download failure:** set `DATA_MODE=json`; API still functions and saves data in a file.
- **Frontend loads but products fail:** wait until `[API] Backend ready` appears; then refresh; check `/api/health`.
- **Port busy:** stop the previous `npm run dev` terminal (`Ctrl+C`).
- **Product images missing:** Unsplash needs internet. Local fallback illustration is displayed if the image fails.
- **`esbuild` install-script warning:** this isn't necessarily a failed install; first try `npm run dev`. Avoid `npm audit fix --force` without checking compatibility.

**This is full-stack functionality for demonstrations, not production-ready commerce.**
