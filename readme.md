# 🚀 Kartr — AI-Powered Influencer–Sponsor Intelligence Platform

> Turning chaotic influencer marketing into a structured, data-driven system.

Kartr is a full-stack AI platform that detects sponsorships, maps creator–brand relationships, automates campaigns, and generates social content using multimodal AI. Built for brands, agencies, and creators who want clarity instead of guesswork.

---

## 🌍 Inspiration

Influencer marketing is exploding, but the tools behind it still feel manual and fragmented. Brands struggle to track who is sponsoring whom, creators lack visibility into opportunities, and campaigns often run on guesswork instead of data.  

Working closely with YouTube sponsorships exposed how inefficient and opaque this space is. Kartr was inspired by the idea of building an intelligence layer for the creator economy — one that can detect sponsorships, match brands with the right influencers, automate social media workflows, and generate content with AI.  

By combining multimodal models, real-time search, and automation, the goal is to turn chaotic influencer marketing into a transparent, data-driven system.

---

## ⚡ What Kartr Does

Kartr connects brands and influencers through automated sponsorship intelligence and campaign execution.

### 🧠 Core Flow
1. Users log in with **Google OAuth**
2. Brands run **bulk or single YouTube analysis**
3. **Gemini 3** detects sponsors and extracts brand relationships  
4. Sponsors create campaigns  
5. Agentic AI checks influencer credibility using **Tavily + Gemini**
6. Influencers accept campaigns  
7. Generate content → images, videos, captions  
8. Auto-post to social platforms  
9. Track campaign analytics in real time  

### 🤖 AI Capabilities
- Sponsor detection from YouTube videos  
- Creator–brand relationship mapping  
- AI image generation → **Gemini 2.5 Flash Image**  
- AI video generation → **Veo-2.0-generate-001**  
- Caption + post automation  
- Real-time credibility checks  
- Campaign analytics + insights  

Two **Gemini 3 chatbots** power the experience:
- 💬 General assistant for strategy and navigation  
- 📊 Agentic assistant using **Tavily** for real-time data and campaign insights  

All data is stored in **Firebase** and visualized in a unified dashboard.

![Architecture Diagram](https://res.cloudinary.com/dkueksjlm/image/upload/v1770658582/Screenshot_2026-02-09_225243_t4wwys.png)
![Wordflow Diagram](https://res.cloudinary.com/dkueksjlm/image/upload/v1770658582/Screenshot_2026-02-09_225303_sv2voe.png)
---

## 🏗️ How We Built It

Kartr is deployed on **Google Cloud** with Dockerized services for scalability.

### 🔐 Authentication
- Google OAuth login
- Firebase Auth

### 📡 Data Collection
- YouTube Data API → fetch channel & video data
- Gemini 3 → analyze transcripts, metadata, and descriptions
- Extract sponsors, brands, and niches

### 🧠 Intelligence Layer
- Gemini-powered search for influencer matching  
- Tavily + Gemini → real-time credibility checks  
- Graph mapping of creator–brand relationships  
- Firebase stores structured data  

### 🎬 Content Engine
- Images → Gemini 2.5 Flash Image 
- Videos → Veo-2.0-generate-001  
- Caption generation  
- Auto-posting to Bluesky  

### 💬 Chat Assistants
- Chatbot 1 → General help  
- Chatbot 2 → Agentic real-time insights with Tavily  

Everything runs through a **React dashboard** connected to a FastAPI backend.

---

## 🧩 Challenges We Ran Into

Detecting sponsorships reliably was harder than expected because creators disclose ads in many different ways — spoken mentions, description links, or subtle overlays. Building a system that understands all of these required combining transcript parsing, multimodal Gemini analysis, and custom logic.  

Handling noisy YouTube data and API rate limits during bulk analysis also required optimization. Matching brands with the right influencers needed tuning to avoid irrelevant results.  

Integrating multiple models for video, image, and reasoning created orchestration and latency challenges. Ensuring real-time Tavily insights while keeping the system fast meant carefully balancing cost, speed, and accuracy.

---

## 🏆 Accomplishments We're Proud Of

We built a working end-to-end platform that goes beyond analysis and actually connects brands and influencers into a usable workflow. Kartr can detect sponsors from real videos, map relationships, and match campaigns with relevant creators using Gemini-powered search.  

We integrated multiple AI models for text, image, and video generation, added real-time credibility checks with Tavily, and deployed everything on Google Cloud using Docker.  

The dual-chatbot system makes the platform feel like an intelligent assistant instead of just a dashboard. Turning a messy industry problem into a functional AI system within hackathon time is a major win.

---

## 📚 What We Learned

Multimodal AI is powerful but requires careful orchestration across models, APIs, and pipelines. Sponsorship detection involves context, audio, and patterns across videos — not just text.  

We saw how fragmented influencer marketing data really is and how valuable structured insights can be. Working with Gemini, Tavily, and media generation models taught us how to balance speed, cost, and accuracy in real-time systems.  

We also improved our skills in async backend design, cloud deployment, and AI integration. Building for real users forced us to constantly iterate between product needs, AI capability, and system architecture.

---

## 🛠️ Technologies Used

**Frontend:**  
Bun.js, React, TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, Framer Motion, Recharts, Axios  

**Backend & AI:**  
FastAPI (Python), Uvicorn, Firebase (DB + Auth), Gemini 3, Gemini 2.5 Flash (image generation), Veo-2.0-generate-001 (video generation), Tavily API (real-time data), YouTube Data API v3, NetworkX, Pandas  , Bluesky API

**Infrastructure & Orchestration:**  
Google Cloud Platform, Docker, async task orchestration, AI agent pipelines, RAG pipelines, REST APIs, cloud storage, background workers, scalable microservices architecture  

---

## 🔮 What's Next for Kartr

Next, we’re turning Kartr into a scalable intelligence layer for the creator economy.

Planned upgrades:
- Real-time monitoring of new videos  
- Deeper sponsorship analytics  
- Pricing insights for brand deals  
- TikTok, Instagram, and X integrations  
- Automated outreach tools  
- Smart campaign recommendations  
- Brand–creator marketplace  
- Advanced ROI tracking  

The goal is to evolve Kartr from a powerful hackathon prototype into a production-ready SaaS platform that brands and creators rely on daily.

---

## 💡 Vision

Kartr isn’t just a tool.  
It’s the intelligence layer for the creator economy.  

A world where sponsorship decisions are data-driven, transparent, and automated.

---

**Built with caffeine, curiosity, and far too many API keys.**
