# Influencer Kartr

**Influencer Kartr** is a comprehensive platform designed to bridge the gap between social media influencers and brand sponsors. By checking real-time analytics and leveraging AI-driven insights, the platform facilitates data-driven partnerships and efficient campaign management.

## 🚀 Key Features & Implementation Flows

### 1. **Authentication & User Management**
- **Dual Login System**: Supports both local authentication (database-backed) and OAuth integration via **Auth0** (Google Login).
- **User Roles**: Distinct flows for **Influencers** (seeking sponsorships) and **Sponsors** (seeking talent).

#### ⚙️ Technical Implementation:
- **Routes**: `/login`, `/register`, `/callback` in `routes.py`.
- **Libraries**: `Flask-Login` for session management, `authlib` for OAuth.
- **Flow**:
    1.  **Auth0 Integration**: Configured in `routes.py` using `oauth.register()`.
    2.  **Callback Logic**:
        - Auth0 redirects to `/callback` with a token.
        - User info (`email`, `nickname`) is extracted.
        - **Account Reconciliation**: System checks `User` table. If email exists, logs in. If not, auto-creates a new `User` entry with default role 'influencer' and logs in.

### 2. **Analytics Dashboard**
- **Real-Time YouTube Stats**: Integrates with the **YouTube Data API** to fetch and track channel performance (Subscribers, Views, Video Counts).
- **Search & History**: Users can search for channels and save their search history.

#### ⚙️ Technical Implementation:
- **Core Function**: `stats.get_channel_stats()` and `youtube_api.get_video_stats()`.
- **Flow**:
    1.  **Input**: User submits Channel URL in `/stats` route.
    2.  **API Call**: `googleapiclient.discovery.build('youtube', 'v3')` is used to query `channels` endpoint.
    3.  **Data Persistence**:
        - **Channel Data**: Upserted to `YouTubeChannel` table (updates metrics if channel exists).
        - **Search History**: Logged to `Search` table with timestamp.

### 3. **AI Video Analysis (The "Demo" Feature)**
- **Automated Metadata Extraction**: Fetches video titles, descriptions, tags, and top comments.
- **AI Insight Generation**: Uses **Google Gemini 2.5 Pro** to analyze video content.
- **Sponsor Detection**: Automatically identifies sponsors and their industries from video metadata.

#### ⚙️ Technical Implementation:
- **Module**: `demo.py`
- **Flow**:
    1.  **ID Extraction**: `extract_video_id(url)` uses RegEx to parse video ID.
    2.  **Metadata Harvesting (`get_video_details`)**:
        - Fetches `snippet` (title, description), `tags`, and `brandingSettings` (channel keywords).
        - Fetches top 5 comments via `commentThreads` endpoint to provide audience sentiment context.
    3.  **Prompt Engineering (`analyze_content_with_gemini`)**:
        - A rich text prompt is constructed: *"Analyze this... VIDEO INFORMATION: Title: {x}, Desc: {y}... Return JSON..."*
    4.  **Inference**: `genai.GenerativeModel('gemini-2.5-pro').generate_content(prompt)` returns the analysis.

### 4. **Project RAG Pipeline (Data Q&A)**
- **Natural Language Querying**: Users can ask questions about the platform's data.

#### ⚙️ Technical Implementation:
- **Module**: `rag_ques.py`
- **Data Source**: Aggregated view of `data/analysis_results.csv` (historical) and `data/ANALYSIS.csv` (live).
- **RAG Steps**:
    1.  **Keyword Extraction**: `extract_keywords()` uses RegEx to find nouns/quoted terms in the user query.
    2.  **Retrieval**: `retrieve_relevant_rows()` scans the Pandas DataFrame for rows containing these keywords.
    3.  **Context Window**: Top 10 matching rows are converted to CSV string format.
    4.  **Generation**: `generate_gemini_answer()` prompts the LLM: *"You are a data assistant. Given this CSV context... execute query: {user_question}"*.

---

## 🏗️ detailed Data Architecture

### Database Schema (SQLite)
Managed via **Flask-SQLAlchemy**.

| Model | Table | Description |
| :--- | :--- | :--- |
| **User** | `user` | Stores user credentials, email, and role (`influencer`/`sponsor`). |
| **YouTubeChannel** | `youtube_channel` | Caches API data: `channel_id`, `subscriber_count`, `video_count`, `view_count`. Linked to `User`. |
| **Search** | `search` | Audit log of user searches: `search_term`, `date_searched`. Linked to `User`. |

### File-Based Data
- **`database.csv`**: Used for legacy user validation and public profile lookups.
- **`data/ANALYSIS.csv`**: Stores output from the demo video analysis for RAG consumption.

---

## 🛠️ Tech Stack & Libraries

- **Backend**: Python 3.x, Flask (Web Framework)
- **Database**: 
    - `Flask-SQLAlchemy` (ORM)
    - `Pandas` (CSV Data Processing)
- **Authentication**:
    - `Flask-Login` (Session Management)
    - `Authlib` (OAuth/Auth0)
    - `Werkzeug` (Password Hashing)
- **AI & ML**:
    - `google-generativeai` (Gemini API SDK)
    - `google-api-python-client` (YouTube Data API)
- **Utilities**:
    - `python-dotenv` (Environment Variable Management)
    - `email_validator` (Form Validation)

---

## 📂 Project Structure Overview

```
Influencer_kartr/
├── app.py                # Flask App factory
├── main.py               # Entry point
├── routes.py             # All URL routes & controllers
├── models.py             # SQLAlchemy Database Models
├── forms.py              # WTForms definitions
├── demo.py               # AI Video Analysis Logic
├── rag_ques.py           # RAG Pipeline Logic
├── youtube_api.py        # YouTube API Helper functions
├── social_media_agents.py# Mock Agents Data
├── static/               # CSS, JS, Images
└── templates/            # Jinja2 HTML Templates
```

---

## 🔧 Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shadowmage-commits/Influencer_kartr.git
   cd Influencer_kartr
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create a `.env` file with the following keys:
   ```env
   SECRET_KEY=your_flask_secret_key
   YOUTUBE_API_KEY=your_youtube_api_key
   GEMINI_API_KEY=your_gemini_api_key
   AUTH0_CLIENT_ID=...
   AUTH0_CLIENT_SECRET=...
   AUTH0_DOMAIN=...
   ```

4. **Run the Application**
   ```bash
   python main.py
   ```
   Access the app at `http://localhost:5000`.

---
*Generated by Google Gemini Agent*
