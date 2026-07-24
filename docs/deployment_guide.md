# Deployment Guide: nerdCTF - Version 1

This guide outlines steps to build, configure, migrate, and deploy the entire nerdCTF platform (frontend, backend, database, cache, and 5 lab environments) using Docker Compose.

---

## 1. Pre-requisites
- **Docker**: Engine version `20.10+`
- **Docker Compose**: Version `2.0+`
- **Port Availability**: Verify that ports `3000` (frontend), `5000` (backend), `3306` (MySQL), `6379` (Redis), and `8001-8005` (Labs 1-5) are free.

---

## 2. Configuration Setup
Create a `.env` file in the `backend/` directory or rely on the environment variables defined in the root `docker-compose.yml`:
- `DATABASE_URL`: `mysql://ctfuser:ctfpassword@mysql:3306/nerdctf`
- `REDIS_URL`: `redis://redis:6379`
- `JWT_ACCESS_SECRET`: Secret key for access token signing.
- `JWT_REFRESH_SECRET`: Secret key for refresh token signing.
- `FRONTEND_URL`: URL of the Next.js frontend (e.g. `http://localhost:3000`).

---

## 3. Deploying using Docker Compose

Navigate to the workspace root directory containing `docker-compose.yml` and run:

```bash
# Build all images and launch containers in detached mode
docker-compose up --build -d
```

This command orchestrates:
1. Spawning MySQL (`nerdctf-db`) and Redis cache (`nerdctf-cache`).
2. Setting up the Express backend.
3. Launching Next.js frontend.
4. Spawning the 5 isolated challenge containers.

---

## 4. Database Migrations & Seeding

Once the database container is online, apply schema migrations and populate initial seed data:

```bash
# Execute migrations inside backend container
docker-compose exec backend npx prisma migrate deploy

# Run the seeding script to populate initial users, challenges, and academy lessons
docker-compose exec backend npm run prisma:seed
```

---

## 5. Verification Check
Open your browser and navigate to:
- **Platform Frontend**: `http://localhost:3000`
- **Backend Health Check**: `http://localhost:5000/api/v1/auth/me`
- **Lab 1 (Cookie Monster)**: `http://localhost:8001`
- **Lab 5 (Broken API)**: `http://localhost:8005`

To monitor system logs, run:
```bash
docker-compose logs -f
```
