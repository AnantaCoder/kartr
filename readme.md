# 🚀 Kartr: AI-Powered Influencer-Sponsor Nexus

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Kartr** is a next-generation SaaS platform that automates the bridge between content creators and brand sponsors. Leveraging high-frequency AI analysis and relationship mapping, Kartr eliminates the manual bottlenecks of influencer marketing.

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

### ⚙️ Backend (The Intelligent Core)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python async framework.
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) — Type-safe data modeling.
- **Processing**: [Pandas](https://pandas.pydata.org/) & [NetworkX](https://networkx.org/) — Data manipulation and relationship graph mapping.
- **APIs**: [httpx](https://www.python-httpx.org/) — Asynchronous HTTP requests for service orchestration.

### 🧠 Intelligence & Infrastructure
- **AI Models**: Google Gemini 1.5 (Pro/Flash), Groq (Llama 3.3 70B), OpenAI/Grok (Fallback).
- **Database/Auth**: [Firebase](https://firebase.google.com/) — Real-time NoSQL and production-grade Auth.
- **Media**: [Cloudinary](https://cloudinary.com/) — Edge-optimized image/video management.
- **Social**: [atproto](https://atproto.com/) — Direct integration with the Bluesky decentralized network.
- **Data Source**: [YouTube Data API v3](https://developers.google.com/youtube/v3).

---

## ✨ Core Features

| Feature | Impact |
| :--- | :--- |
| **Bulk AI Analysis** | Scan multiple YouTube URLs simultaneously for sponsor detection and niche extraction. |
| **Relationship Mapping** | Bipartite graphs visualizing creator-brand networks with Fit Scores. |
| **Ad Studio** | Instant AI-generated ad creatives and cross-platform posting (Bluesky). |
| **Sponsor Dashboard** | Real-time ROI tracking, active creator metrics, and detailed campaign spent analysis. |
| **Virtual Influencers** | AI-generated creator personas for brand-safe promotional campaigns. |

---

## 📁 Project Structure

```bash
kartr/
├── fastapi_backend/        # Python 3.11+ Backend
│   ├── routers/            # API Endpoints (Auth, YouTube, Influencer, etc.)
│   ├── services/           # Business Logic (AI Analysis, Chat, Graphing)
│   ├── models/             # Pydantic Schemas & DTOs
│   ├── utils/              # Middleware, Dependencies, & Logging
│   └── .env                # Backend Secrets
├── bun_frontend/           # React 19 Frontend
│   ├── src/
│   │   ├── components/     # Atomic & Layout Components
│   │   ├── pages/          # View Components (Dashboard, Ad Studio, etc.)
│   │   ├── store/          # Redux Toolkit Slices
│   │   └── assets/         # Styles & Static Media
│   └── package.json        # Bun Dependencies
└── docs/                   # Engineering & Contribution Guides
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+**
- **Bun** (Recommended) or Node.js
- **Git**

### 🛠️ Local Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AnantaCoder/kartr.git
   cd kartr
   ```

2. **Backend Configuration**
   ```bash
   cd fastapi_backend
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   # Create .env from .env.example and add your API keys
   uvicorn main:app --reload
   ```

3. **Frontend Configuration**
   ```bash
   cd ../bun_frontend
   bun install
   # Create .env and add VITE_API_URL=http://localhost:8000
   bun dev
   ```

---

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