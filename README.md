# Courtside Stats


Project Concept

Courtside Stats is a web application combining modern backend architecture, real-time updates, and interactive data visualization to provide an NBA analytics and live dashboard experience.

---

Users can:

- View Player & Team Stats: Browse historical NBA data including points, rebounds, assists, and more, with advanced filtering options.

- Create a Live Game Dashboard: Simulate live games where scores and key events (e.g., "LeBron James makes a 3-pointer") update in real-time for all viewers.

- Visualize Data: Explore player and team stats through interactive charts, including shot charts, season trends, and performance comparisons.

This project mimics the type of data-intensive, real-time dashboards used in sports analytics and business intelligence.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development builds
- **Zustand** for state management
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time updates

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication (ready for implementation)
- **CORS** with secure configuration

### DevOps & Infrastructure
- **Docker** & Docker Compose for containerization
- **MongoDB** with data persistence
- **Environment-based configuration**
- **Professional middleware architecture**


---

## Folder Structure
```bash
Courtside-Stats
├─ backend/                 # Backend service
│  ├─ src/                  # Source code
│  │  ├─ config/            # Configuration (DB, env, etc.)
│  │  ├─ controllers/       # Route handlers / business logic
│  │  ├─ middleware/        # Communication between front- and backend
│  │  ├─ models/            # Database models (MongoDB schemas)
│  │  ├─ routes/            # API routes
│  │  ├─ scripts/           # For seeding, testing etc.
│  │  ├─ sockets/           # Socket.IO event handlers
│  │  ├─ utils/             # Helper functions
│  │  └─ server.ts          # Entry point for the backend
│  ├─ .env                  # Environment variables (ignored in Git)
│  ├─ Dockerfile            # Dockerfile for backend
│  ├─ package.json
│  ├─ package-lock.json
│  └─ tsconfig.json
├─ frontend/                # Frontend service
│  ├─ src/                  # Source code
│  │  ├─ assets/            # Images, icons, logos
│  │  ├─ components/        # Reusable React components
│  │  ├─ pages/             # Page-level components
│  │  ├─ store/             # Zustand state management
│  │  ├─ utils/             # Helper functions, API calls
│  │  ├─ App.tsx            # Root app component
│  │  ├─ main.tsx           # Frontend entry point
│  │  ├─ App.css
│  │  └─ index.css
│  ├─ public/               # Static assets
│  ├─ Dockerfile            # Dockerfile for frontend
│  ├─ index.html
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ tsconfig.json
│  ├─ tsconfig.app.json
│  ├─ tsconfig.node.json
│  ├─ vite.config.ts
│  └─ eslint.config.js
├─ docker-compose.yml       # Docker Compose for full-stack setup
└─ README.md                # Project documentation
```


Notes:

.env files, node_modules, and build artifacts are ignored via .gitignore.

src/ folders contain all application logic.

Dockerfiles handle containerized builds for frontend and backend.

---

## Getting Started
Run All Services with Docker
```bash
docker-compose up --build
```

This starts frontend, backend, and MongoDB together:

Backend API → http://localhost:5000

Frontend → http://localhost:5173

MongoDB → mongodb://localhost:27017

Run Locally Without Docker

Backend
```bash
cd backend
npm install
npm run dev
```

Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Features & Roadmap

- [x] Backend skeleton with Express + MongoDB + Socket.IO

- [x] Frontend skeleton with React + TypeScript + Zustand + Vite

- [x] Dockerized full-stack setup

- [x] Connect frontend & backend with real-time events

- [ ] Implement interactive charts and data visualization

- [ ] Build live game dashboard with real-time score updates

- [ ] Add authentication and user management

- [ ] Implement advanced filtering for historical stats

- [ ] Deploy to production

---

Contributing

Contributions are welcome! Fork the repo, submit PRs, and follow clear commit messages and coding standards.
