# 🚀 Kartr: AI-Powered Influencer-Sponsor Nexus

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Kartr** is a next-generation SaaS platform that automates the bridge between content creators and brand sponsors. Leveraging high-frequency AI analysis and relationship mapping, Kartr eliminates the manual bottlenecks of influencer marketing.

**Table of Contents**
- [Features](#-core-features)
- [Tech Stack](#-system-architecture--tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗️ System Architecture & Tech Stack

Kartr is built on a high-performance asynchronous architecture designed for scale and real-time intelligence.

### 🌐 Frontend (The Experience)
- **Runtime**: [Bun](https://bun.sh/) — The ultra-fast JavaScript runtime.
- **Framework**: [React 19](https://react.dev/) — Latest concurrent rendering features.
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) — Next-gen utility-first CSS.
- **Components**: [shadcn/ui](https://ui.shadcn.com/) — Radix-based premium accessible components.
- **State**: [Redux Toolkit](https://redux-toolkit.js.org/) — Predictable global state management.
- **Motion**: [Framer Motion](https://www.framer.com/motion/) — Advanced micro-interactions and animations.
- **Visuals**: [Recharts](https://recharts.org/) — Composable charting library for analytics.
- **HTTP Client**: [Axios](https://axios-http.com/) — Promise-based HTTP requests.

### ⚙️ Backend (The Intelligent Core)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python async framework.
- **Server**: [Uvicorn](https://www.uvicorn.org/) — ASGI web server.
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) — Type-safe data modeling.
- **Processing**: [Pandas](https://pandas.pydata.org/) & [NetworkX](https://networkx.org/) — Data manipulation and relationship graph mapping.
- **HTTP Client**: [httpx](https://www.python-httpx.org/) — Asynchronous HTTP requests for service orchestration.

### 🧠 Intelligence & Infrastructure
- **AI Models**: 
  - Google Gemini 1.5 (Pro/Flash) — Primary AI engine
  - Groq (Llama 3.3 70B) — High-speed inference
  - OpenAI/Grok — Fallback models
- **Database/Auth**: [Firebase](https://firebase.google.com/) — Real-time NoSQL and production-grade Auth.
- **Media**: [Cloudinary](https://cloudinary.com/) — Edge-optimized image/video management.
- **Social**: [atproto](https://atproto.com/) — Direct integration with the Bluesky decentralized network.
- **APIs**: [YouTube Data API v3](https://developers.google.com/youtube/v3), [Tavily](https://tavily.com/) — Search & Research.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **Bulk AI Analysis** | Scan multiple YouTube URLs simultaneously for sponsor detection and niche extraction. |
| **Relationship Mapping** | Bipartite graphs visualizing creator-brand networks with Fit Scores. |
| **Ad Studio** | Instant AI-generated ad creatives and cross-platform posting (Bluesky). |
| **Sponsor Dashboard** | Real-time ROI tracking, active creator metrics, and detailed campaign spent analysis. |
| **Virtual Influencers** | AI-generated creator personas for brand-safe promotional campaigns. |
| **YouTube Analysis** | Deep content analysis and audience metrics extraction. |
| **Campaign Management** | End-to-end campaign tracking and performance analytics. |
| **Chat Assistant** | AI-powered chat for strategy and influencer discovery. |

---

## 📁 Project Structure

```bash
kartr/
├── fastapi_backend/          # Python 3.11+ FastAPI Backend
│   ├── routers/              # API Endpoints
│   │   ├── auth.py           # Authentication & Authorization
│   │   ├── youtube.py        # YouTube Analysis & Metrics
│   │   ├── campaign.py       # Campaign Management
│   │   ├── bluesky.py        # Bluesky Social Integration
│   │   ├── ad_studio.py      # AI-Generated Ad Creatives
│   │   ├── influencer.py     # Influencer Discovery
│   │   ├── chat.py           # AI Chat Assistant
│   │   ├── search.py         # Search & Discovery
│   │   └── ...other routers
│   ├── services/             # Business Logic & AI Integration
│   │   ├── auth_service.py   # User Management & JWT
│   │   ├── analysis_service.py   # AI Content Analysis
│   │   ├── rag_service.py    # Retrieval-Augmented Generation
│   │   ├── campaign_service.py   # Campaign Tracking
│   │   ├── graph_service.py  # Relationship Mapping
│   │   ├── bluesky_service.py    # Social Media Posting
│   │   └── ...other services
│   ├── models/               # Pydantic Schemas & DTOs
│   │   ├── auth_schemas.py
│   │   ├── campaign_schemas.py
│   │   ├── video_schemas.py
│   │   └── ...other schemas
│   ├── utils/                # Helpers, Middleware & Dependencies
│   ├── tests/                # Unit & Integration Tests
│   ├── docs/                 # API & Architecture Documentation
│   ├── main.py               # FastAPI Application Entry Point
│   ├── database.py           # Firebase Configuration
│   ├── requirements.txt      # Python Dependencies
│   └── .env                  # Environment Variables
│
├── bun_frontend/             # React 19 + Bun Frontend
│   ├── src/
│   │   ├── pages/            # View Components
│   │   │   ├── Home.tsx      # Landing Page
│   │   │   ├── Login.tsx     # Authentication
│   │   │   ├── YoutubeAnalysis.tsx
│   │   │   ├── BulkAnalysis.tsx
│   │   │   ├── AdStudio.tsx
│   │   │   ├── sponsor/      # Sponsor Dashboard
│   │   │   ├── influencer/   # Influencer Pages
│   │   │   └── admin/        # Admin Interface
│   │   ├── components/       # Reusable UI Components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...shadcn components
│   │   ├── services/         # API Calls & External Services
│   │   ├── store/            # Redux Toolkit Slices
│   │   │   ├── authSlice.ts
│   │   │   ├── campaignSlice.ts
│   │   │   └── ...other slices
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── types/            # TypeScript Interfaces
│   │   ├── lib/              # Utilities & Helpers
│   │   ├── assets/           # Static Files
│   │   ├── config/           # Configuration Files
│   │   ├── App.tsx           # Root Component
│   │   ├── main.tsx          # React DOM Entry Point
│   │   └── index.html        # HTML Template
│   ├── styles/               # Global Styles
│   │   └── globals.css
│   ├── package.json          # Bun Dependencies
│   ├── tsconfig.json         # TypeScript Configuration
│   ├── bunfig.toml           # Bun Configuration
│   └── .env                  # Environment Variables
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # System Design & Flows
│   ├── API.md                # API Endpoint Reference
│   ├── SETUP.md              # Detailed Setup Guide
│   └── TESTING.md            # Testing Strategy
├── CONTRIBUTING.md           # Contribution Guidelines
├── CODE_OF_CONDUCT.md        # Community Standards
└── LICENSE                   # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Bun 1.3+** ([Install](https://bun.sh/)) or Node.js 18+
- **Git** ([Install](https://git-scm.com/))
- **Firebase Account** (Free tier available)
- **Google API Keys** (YouTube, Gemini)

### 🛠️ Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd kartr/fastapi_backend
   ```

2. **Create Virtual Environment**
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   # Create .env file in fastapi_backend/
   cp .env.example .env  # if available
   ```
   
   Add the following:
   ```env
   # Firebase
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_client_email
   
   # Google APIs
   GOOGLE_API_KEY=your_youtube_api_key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Bluesky
   BLUESKY_USERNAME=your_bluesky_username
   BLUESKY_PASSWORD=your_bluesky_password
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Other LLM Providers (Optional)
   GROQ_API_KEY=your_groq_key
   OPENAI_API_KEY=your_openai_key
   ```

5. **Run Backend**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Backend will be available at `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### 🌐 Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd kartr/bun_frontend
   ```

2. **Install Dependencies**
   ```bash
   bun install
   # OR if using npm
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Create .env file in bun_frontend/
   ```
   
   Add the following:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Frontend**
   ```bash
   bun dev
   # OR if using npm
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

---

## 🏗️ Architecture Overview

### System Flow

```
┌─────────────────────┐
│   React Frontend    │
│   (Bun/Vite)       │
└──────────┬──────────┘
           │ HTTP/WebSocket
           ▼
┌──────────────────────────────────┐
│     FastAPI Backend              │
│  ┌────────────────────────────┐  │
│  │  Routers (12 modules)      │  │
│  │  Auth, YouTube, Campaign   │  │
│  └─────────────┬──────────────┘  │
│                │                  │
│  ┌─────────────▼──────────────┐  │
│  │  Services Layer            │  │
│  │  - AI Analysis             │  │
│  │  - Graph Mapping           │  │
│  │  - Campaign Tracking       │  │
│  └─────────────┬──────────────┘  │
│                │                  │
└─────────┬──────┴───────┬──────────┘
          │              │
    ┌─────▼───┐    ┌────▼──────────┐
    │Firebase │    │External APIs   │
    │(Auth/DB)│    │YouTube, Gemini │
    │         │    │Bluesky, etc    │
    └─────────┘    └────────────────┘
```

### Key Service Interactions

1. **Authentication Service** — JWT generation, Firebase integration
2. **Analysis Service** — AI-powered content analysis using Gemini/Groq
3. **RAG Service** — Retrieval-Augmented Generation for intelligent responses
4. **Campaign Service** — Campaign lifecycle management and tracking
5. **Graph Service** — Build and query creator-brand networks
6. **Bluesky Service** — Post content to decentralized social network
7. **Chat Service** — Conversational AI with context awareness

---

## 🧪 Testing

### Backend Tests
```bash
cd fastapi_backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd bun_frontend
bun test
```

See [TESTING.md](fastapi_backend/docs/TESTING.md) for detailed testing strategies.

---

## 📖 Additional Documentation

- **[ARCHITECTURE.md](fastapi_backend/docs/ARCHITECTURE.md)** — Deep dive into system design
- **[API.md](fastapi_backend/docs/API.md)** — Complete API reference
- **[SETUP.md](fastapi_backend/docs/SETUP.md)** — Detailed setup instructions
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute
- **[logic.md](logic.md)** — Core business logic documentation

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙋 Support & Community

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/AnantaCoder/kartr/issues)
- **Discussions**: Join our community discussions
- **Code of Conduct**: Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## 🚀 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] ML-powered creator recommendations
- [ ] Integration with more social platforms
- [ ] Real-time collaboration features

---

**Made with ❤️ by the Kartr Team**

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for style guides and the PR process.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

- **Mentor**: Kiran Chawan ([kiransc55@gmail.com](mailto:kiransc55@gmail.com))
- **AI Engineer**: Anirban Sarkar , Aditi Kapoor , Raghav , Karan
- **Location**: Indira Nagar, Bengaluru, India
- **Website**: [kartr.ai](http://kartr.ai) (Coming Soon)