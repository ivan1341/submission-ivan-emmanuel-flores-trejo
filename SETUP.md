# Setup & Run Instructions

Instructions to initialize and run the Client Portal project (frontend, backend, and database).

---

## Prerequisites

- **Node.js** v18 or higher  
- **npm** (comes with Node)  
- **Docker** and **Docker Compose** (optional; only needed for the containerized setup)

---

## Option A: Run with Docker (recommended)

One-command setup: builds and runs frontend, backend, and MongoDB.

```bash
# From the project root
docker-compose up --build
```

- **App (frontend + API):** http://localhost:8080  
- **API only:** http://localhost:3000  
- **API docs (Swagger):** http://localhost:8080/api/docs or http://localhost:3000/api/docs  

Create the first admin user (e.g. with curl):

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword","role":"admin"}'
```

Then open http://localhost:8080 and sign in with that user.

---

## Option B: Run locally (without Docker)

### 1. Database (MongoDB)

Install and start MongoDB locally, or use a cloud URI (e.g. MongoDB Atlas).

- Default local URI: `mongodb://localhost:27017/client_portal`

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set MONGODB_URI (and optionally JWT_SECRET, CORS_ORIGIN)
npm install
npm run dev
```

- Server: http://localhost:3000  
- API docs: http://localhost:3000/api/docs  

Create the first admin (e.g. via API client or curl to http://localhost:3000/api/auth/register with `{"email":"admin@example.com","password":"yourpassword","role":"admin"}`).

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Ensure .env has VITE_API_URL=http://localhost:3000/api (or your backend URL)
npm install
npm run dev
```

- App: http://localhost:5173 (or the port Vite prints)

Open the app in the browser, register or log in with the admin user.

---

## Summary

| Method   | Command / steps                                      | App URL              |
|----------|-------------------------------------------------------|----------------------|
| Docker   | `docker-compose up --build`                           | http://localhost:8080 |
| Local    | Start MongoDB → `cd backend && npm run dev` → `cd frontend && npm run dev` | http://localhost:5173 |

---

## Run tests (backend)

From the backend directory:

```bash
cd backend
npm install   # if not already done (installs supertest + mongodb-memory-server)
npm test
```

Uses an in-memory MongoDB; no running MongoDB instance required.
