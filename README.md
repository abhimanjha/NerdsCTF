# nerdCTF - Version 1

nerdCTF is a production-ready educational Capture The Flag (CTF) platform where beginners learn cybersecurity concepts through isolated lab challenges and academy lessons.

---

## 🚀 Technology Stack
- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Framer Motion, Recharts, Axios
- **Backend**: ExpressJS, TypeScript, Clean Architecture (Domain, Application, Presentation, Infrastructure layers)
- **Database**: MySQL, managed via Prisma ORM
- **Cache**: Redis (token blacklist, rate limiting)
- **Security**: Argon2id password hashes, JWT access token with HTTPOnly Secure cookies, CSRF protections, Rate Limit, Helmet headers
- **Labs**: 5 isolated, containerized web security target environments
- **Deployment**: Docker, Docker Compose

---

## 🛠️ Folder Structure
- [backend/](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/backend): Clean Architecture API logic
- [frontend/](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/frontend): Next.js React UI with dark cyber aesthetics
- [labs/](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/labs): Source codes and Docker configs for 5 educational challenges
- [docs/](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs): API specs, user manuals, deployment steps, and security checklists

---

## 🏁 Quick Start & Deployment

### 1. Build and Run
From the root directory, launch all services:
```bash
docker-compose up --build -d
```

### 2. Database Migrations & Seeds
Once services are initialized, run migrations and database seeds:
```bash
# Apply Prisma DB schema migrations
docker-compose exec backend npx prisma migrate deploy

# Run db seeder script
docker-compose exec backend npm run prisma:seed
```

### 3. Ports & Endpoints
- **Web App Frontend**: `http://localhost:3000`
- **Backend API Engine**: `http://localhost:5000`
- **Lab 1 (Cookie Monster)**: `http://localhost:8001`
- **Lab 2 (Source Detective)**: `http://localhost:8002`
- **Lab 3 (Hidden Header)**: `http://localhost:8003`
- **Lab 4 (Encoded Secrets)**: `http://localhost:8004`
- **Lab 5 (Broken API)**: `http://localhost:8005`

---

## 🔐 Seeder Default Logins

### 👨‍💻 Administrator
- **Email**: `admin@nerdctf.io`
- **Password**: `NerdCTFAdminPass123!`

---

## 📚 Documentation Index
- [Deployment Guide](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/deployment_guide.md): Build steps and verification commands
- [API Documentation](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/api_docs.md): Endpoint routing lists and payloads
- [Security Review Checklist](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/security_review.md): OWASP protections audit checklist
- [User Manual](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/user_guide.md): Navigations and flag submission tutorials
- [Administrator Manual](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/admin_guide.md): User bans, log streams, and ticketing guides
- **Labs Solution Walkthroughs**:
  - [Lab 1 (Cookie Monster)](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/walkthroughs/lab1-walkthrough.md)
  - [Lab 2 (Source Detective)](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/walkthroughs/lab2-walkthrough.md)
  - [Lab 3 (Hidden Header)](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/walkthroughs/lab3-walkthrough.md)
  - [Lab 4 (Encoded Secrets)](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/walkthroughs/lab4-walkthrough.md)
  - [Lab 5 (Broken API)](file:///c:/Users/PRASHANT%20KUMAR%20JHA/OneDrive/Desktop/CYB/docs/walkthroughs/lab5-walkthrough.md)
