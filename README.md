# 🚀 thebrandsstory. — India's Biggest Influencer Platform

> **thebrandsstory.** is a next-generation AI-powered Influencer Discovery, Matchmaking & Campaign Management ecosystem designed specifically for the Indian creator economy. It bridges top brands, agencies, and 50,000+ verified creators across 500+ Indian cities and 100+ niches.

---

## 📑 Table of Contents (अनुक्रमणिका)
1. [🌟 Project Overview (प्रोजेक्ट का परिचय)](#-project-overview)
2. [🛠️ Complete Tech Stack (तकनीकी स्टैक)](#️-complete-tech-stack)
3. [✨ Key Features & Modules (सभी मुख्य फीचर्स)](#-key-features--modules)
   - [1. AI Matching Engine & Natural Search](#1-ai-matching-engine--natural-search)
   - [2. TrustScore™ Authenticity Rating (0-100)](#2-trustscore-authenticity-rating-0-100)
   - [3. Creator Discovery & Smart Filtering](#3-creator-discovery--smart-filtering)
   - [4. Dynamic Side-by-Side Creator Comparison](#4-dynamic-side-by-side-creator-comparison)
   - [5. Interactive Creator Profiles & Media Kit](#5-interactive-creator-profiles--media-kit)
   - [6. Brand Campaign Marketplace & Live Opportunities](#6-brand-campaign-marketplace--live-opportunities)
   - [7. Role-Based Portals & Dashboards](#7-role-based-portals--dashboards)
   - [8. Direct Booking & Enquiry Management System](#8-direct-booking--enquiry-management-system)
   - [9. Dedicated City & Category Hubs (SEO Optimized)](#9-dedicated-city--category-hubs-seo-optimized)
   - [10. Creator Onboarding Wizard](#10-creator-onboarding-wizard)
   - [11. Influencer Marketing Blog & Insights](#11-influencer-marketing-blog--insights)
4. [📂 Project Folder Structure (फाइल और डायरेक्टरी स्ट्रक्चर)](#-project-folder-structure)
5. [🔌 Backend & API Endpoints](#-backend--api-endpoints)
6. [⚙️ Installation & Setup (लोकल सेटअप गाइड)](#️-installation--setup)
7. [🔐 Environment Variables (.env)](#-environment-variables)
8. [📜 NPM Scripts](#-npm-scripts)

---

## 🌟 Project Overview

thebrandsstory. addresses the critical problems in influencer marketing: **lack of pricing transparency, fake followers, inefficient matchmaking, and delayed campaign execution**.

Is platform ke through:
- **Brands & Agencies**: Apne campaign brief ke hisab se AI ki madad se verified influencers find kar sakte hain, direct enquiry bhej sakte hain, aur campaign requirements post kar sakte hain.
- **Creators / Influencers**: Apni custom media kit display kar sakte hain, transparent pricing (Reels, Stories, UGC, Barter) set kar sakte hain, brands ki live requirements par direct pitch kar sakte hain, aur verified badge pa sakte hain.
- **Platform Admins**: Creators ki verification requests ko approve/reject kar sakte hain, featured creators assign kar sakte hain, aur platform statistics manage kar sakte hain.

---

## 🛠️ Complete Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** (`react`, `react-dom`) | Modern component architecture, hooks aur fast state management |
| **Language** | **TypeScript 5.8** | Type-safe code across frontend, context, models, and server |
| **Styling & Design** | **Tailwind CSS v4** (`@tailwindcss/vite`) | Modern, responsive, utility-first styling with sleek dark/light aesthetics |
| **Build Tool & Bundler**| **Vite 6** (`vite`, `@vitejs/plugin-react`) | Ultra-fast HMR and optimized production bundling |
| **Backend Runtime** | **Node.js + Express.js** (`express`) | Lightweight REST API server integrated with Vite middleware |
| **AI / LLM Engine** | **Google Gemini 3.7 Flash** (`@google/genai`) | Campaign matchmaking, NLP search parsing, and recommendation generator |
| **Dev & Build Tools** | **`tsx`** + **`esbuild`** | Direct TypeScript execution in dev & blazing-fast backend compilation for production |
| **Icons & Visuals** | **`lucide-react`** | High-quality icon set for all Indian categories and actions |
| **Animations & FX** | **`motion` (Framer Motion v12)** + **`canvas-confetti`** | Smooth micro-animations, transitions, modals, drawers, and celebration effects |

---

## ✨ Key Features & Modules

### 1. 🤖 AI Matching Engine & Natural Search
- **AI Campaign Matchmaker (`AIMatcherModal.tsx` & `/api/ai-matching`)**:
  - Brand apna industry, objective, city, budget, target audience, aur preferred platform provide karti hai.
  - Google Gemini AI candidate creators ke metrics, engagement, audience distribution aur pricing ko analyze karke **Top Matched Creators** rank karta hai with Match Score (70-99%) aur detailed reasons.
  - **Algorithmic Fallback Engine**: Agar AI API offline ya unavailable ho, toh internal multi-parameter mathematical scoring model backup match generate karta hai.
- **Natural Language Search (`/api/natural-search`)**:
  - Search bar mein user plain text likh sakta hai (jaise: *"Delhi fashion influencer under 10k"*).
  - NLP engine text se category, city, max budget, aur follower filters automatically extract karke search results update karta hai.

---

### 2. 🛡️ TrustScore™ Authenticity Rating (0 - 100)
- Platform ka proprietary credibility score jo brands ko fraud aur fake followers se bachata hai:
  - **Profile Completeness**: Verified details, phone, email, and social handles.
  - **Engagement Quality**: Real like-to-comment ratio vs follower base.
  - **Audience Quality**: Genuine demographic concentration across Indian cities.
  - **Collaboration Reliability**: Past brand campaigns track record and on-time delivery score.
  - **Verified Reviews Count**: Feedback from verified brand managers.
- Visual **TrustScoreBadge** (`Gold/Green/Blue/Orange`) aur full diagnostic modal (`TrustScoreInfoModal.tsx`).

---

### 3. 🔍 Creator Discovery & Smart Filtering (`ExploreView.tsx`)
- **Multi-Facet Filter System**:
  - **Category**: Fashion, Food, Tech, Beauty, Fitness, Travel, Comedy, Finance, Gaming, Lifestyle, etc.
  - **Tier-1 & Tier-2 Indian Cities**: Delhi NCR, Mumbai, Bangalore, Pune, Jaipur, Hyderabad, Chennai, Kolkata, Ahmedabad, Chandigarh, Lucknow, etc.
  - **Follower Tiers**: Nano (1K-10K), Micro (10K-100K), Macro (100K-1M), Mega (1M+).
  - **Collaboration Types**: Paid Campaigns, Barter Collaborations, UGC Content, Event Appearances, Affiliate, Brand Ambassador.
  - **Budget Filter**: Slider for maximum starting price (₹0 to ₹5,00,000+).
  - **Quick Sort**: By Trust Score, Follower Count, Engagement Rate, Pricing (Low to High / High to Low), Rating.
  - **Tags**: Top 20 Icons, Rising Stars, Verified Only, Barter Available.

---

### 4. ⚖️ Dynamic Side-by-Side Creator Comparison (`CompareDrawer.tsx`)
- Users ek click mein **up to 4 creators** ko compare drawer mein add kar sakte hain.
- Side-by-side comparison matrix:
  - TrustScore breakdown
  - Followers, Engagement Rate, Average Views, Average Likes
  - Rate Cards (Reels, Stories, UGC, Dedicated Posts, Barter)
  - Top Audience Demographics (Age groups, Gender split, Top cities)
  - Direct single-click bulk enquiry trigger for selected creators.

---

### 5. 👤 Interactive Creator Profiles & Media Kit (`CreatorDetailView.tsx`)
- **Complete Media Kit Experience**:
  - High-res banner, avatar, bio, location, languages spoken, verified social platform links.
  - Real-time commercial pricing card (negotiable tags, barter availability).
  - **Audience Insights Visualizer**: City distribution progress bars, Age group split charts, Gender demographic breakdown.
  - **Live Portfolio Grid**: Embedded Reels, short-form video previews, UGC samples, and previous campaign assets.
  - **Brand Collaborations Showcase**: List of previous brand campaigns with proof of work.
  - **Verified Reviews & Ratings**: Multi-criteria star reviews (Communication, Quality, Timeliness, Professionalism).

---

### 6. 📢 Brand Campaign Marketplace & Live Opportunities (`OpportunitiesView.tsx` & `PostRequirementView.tsx`)
- **Post a Requirement (Brands)**:
  - Form for campaign title, industry, target city, required creators count, budget, deliverables, and timeline.
  - Instant posting to the live platform opportunities board.
- **Live Opportunities Board (Creators)**:
  - Creators can browse active brand campaigns and apply with custom pitch notes and portfolio highlights.
  - Status tracking: Open, In Review, Shortlisted, Filled.

---

### 7. 📊 Role-Based Portals & Dashboards
Switch between roles smoothly from the header:
- **🏢 Brand Dashboard (`BrandDashboardView.tsx`)**:
  - Overview of posted campaigns and applicant creator pitches.
  - Management of saved creator shortlists and custom folders.
  - Direct inquiry tracking with lead status progression (New → Contacted → Qualified → Converted).
- **🎨 Creator Dashboard (`CreatorDashboardView.tsx`)**:
  - Live preview of creator media kit and profile completeness score.
  - Update commercial pricing (Reels, Story, Barter, UGC prices).
  - Request official verification badge with 4-step verification checklist.
  - Review incoming brand enquiries and reply directly.
- **👑 Master Admin Dashboard (`AdminDashboardView.tsx`)**:
  - **Verification Requests Queue**: Approve or reject creator verification requests.
  - **Feature Flagging**: Toggle Top 20 Badges, Featured Highlights, Rising Star tags.
  - **Live Platform Stats Manager**: Override and update platform-wide numbers (creators count, city count, active connections).
  - Campaign moderations and lead pipeline management.

---

### 8. 📩 Direct Booking & Enquiry Management System (`EnquiryModal.tsx`)
- One-click lead generation modal for any creator or multiple creators.
- Collects: Brand name, contact person, email, phone, campaign deliverable type, budget, timeline, and custom brief.
- Generates a unique tracking lead ID (e.g. `SC-ENQ-XXXXXX`).
- Real-time notification in creator and brand dashboards.

---

### 9. 📍 Dedicated City & Category Hubs (SEO Optimized)
- **City Landing Pages (`CityPageView.tsx`)**: Specialized pages for Indian regions (e.g., *Top Influencers in Delhi NCR*, *Mumbai Lifestyle Creators*, *Bangalore Tech Influencers*).
- **Category Landing Pages (`CategoryPageView.tsx`)**: Specialized pages for verticals (Fashion & Lifestyle, Tech & Gadgets, Food & Beverage, Fitness & Health).
- Includes dynamic SEO meta tags, local statistics, top creator highlights, and FAQ schema.

---

### 10. 📝 Creator Onboarding Wizard (`CreatorOnboardingModal.tsx`)
- Simple multi-step onboarding wizard for new Indian creators:
  - Step 1: Personal info, city, niche, languages.
  - Step 2: Social media links, follower stats, engagement rates.
  - Step 3: Rate card configuration (Reel price, Story price, Barter preference).
  - Step 4: Verification submission and portfolio showcase.

---

### 11. 📰 Influencer Marketing Blog & Insights (`BlogView.tsx`, `BlogPostView.tsx`)
- Editorial articles and practical guides on:
  - India influencer marketing benchmarks and pricing trends.
  - How brands can avoid fake follower fraud.
  - Creator monetization tips for regional Tier-2/Tier-3 audiences.

---

## 📂 Project Folder Structure

```text
social-cults/
├── assets/                     # Static media and illustrations
├── src/
│   ├── components/
│   │   ├── common/             # Shared interactive UI components
│   │   │   ├── AIMatcherModal.tsx          # AI campaign matching wizard
│   │   │   ├── CompareDrawer.tsx           # Side-by-side comparison drawer
│   │   │   ├── CreatorCard.tsx             # Standard & compact creator cards
│   │   │   ├── CreatorDetailModal.tsx      # Quick-view creator preview modal
│   │   │   ├── CreatorOnboardingModal.tsx  # 4-step creator sign-up wizard
│   │   │   ├── EnquiryModal.tsx            # Direct brand-to-creator lead form
│   │   │   ├── Footer.tsx                  # Global footer with SEO directory links
│   │   │   ├── Header.tsx                  # Sticky header with role switcher & search
│   │   │   ├── TrustScoreBadge.tsx         # Visual TrustScore 100-pt badge
│   │   │   └── TrustScoreInfoModal.tsx     # Score breakdown diagnostic modal
│   │   └── home/               # Homepage hero & presentation sections
│   │       ├── CategoryBrowser.tsx         # Niche category pill carousel
│   │       ├── CityBrowser.tsx             # City cards & regional hubs
│   │       ├── CTABanners.tsx              # Conversion banners for brands & creators
│   │       ├── HomeHero.tsx                # Hero section with animated search & stats
│   │       ├── HowItWorksSection.tsx       # 3-step platform guide
│   │       ├── LiveOpportunitiesBoard.tsx  # Live campaigns preview strip
│   │       ├── RegionalShowcases.tsx       # State-wise influencer spotlight
│   │       ├── TestimonialsAndFAQ.tsx      # Brand testimonials and FAQ accordion
│   │       ├── TopCreatorsSection.tsx      # Trending & Top-20 creator showcases
│   │       └── TrustProofStrip.tsx         # Trust metrics & brand logos
│   ├── context/
│   │   └── PlatformContext.tsx  # Master state provider (Creators, Leads, Campaigns, Modals, Comparison)
│   ├── data/
│   │   └── initialData.ts       # Comprehensive Indian creators, categories, cities, blogs mock data
│   ├── types/
│   │   └── index.ts             # TypeScript types and interfaces
│   ├── views/                   # Dynamic single-page view components
│   │   ├── AdminDashboardView.tsx    # Super Admin control center
│   │   ├── BlogPostView.tsx          # Single article reader
│   │   ├── BlogView.tsx              # Influencer marketing blog directory
│   │   ├── BrandDashboardView.tsx    # Brand campaign & leads portal
│   │   ├── CategoryPageView.tsx      # Vertical category hub
│   │   ├── CityPageView.tsx          # City-specific creator directory
│   │   ├── CreatorDashboardView.tsx  # Creator media kit & lead manager
│   │   ├── CreatorDetailView.tsx     # Full creator profile & analytics
│   │   ├── ExploreView.tsx           # Comprehensive search & filter directory
│   │   ├── HomeView.tsx              # Main homepage assembly
│   │   ├── OpportunitiesView.tsx     # Live campaign requirement marketplace
│   │   └── PostRequirementView.tsx   # Brand brief submission portal
│   ├── App.tsx                  # Main router and view orchestrator
│   ├── index.css                # Tailwind CSS v4 directives
│   └── main.tsx                 # React DOM mount point
├── .env.example                 # Environment variables template
├── package.json                 # Project dependencies & scripts
├── server.ts                    # Express backend + Gemini AI endpoints + Vite middleware
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration with Tailwind CSS plugin
```

---

## 🔌 Backend & API Endpoints

The backend runs on Express (`server.ts`) and is seamlessly integrated with the frontend in both development and production.

### 1. `GET /api/health`
- **Description**: Returns server health status and platform metadata.
- **Response**:
  ```json
  {
    "status": "ok",
    "platform": "thebrandsstory. - India’s Biggest Influencer Platform"
  }
  ```

### 2. `POST /api/ai-matching`
- **Description**: Takes a brand campaign brief and returns ranked creator matches with match scores and audience fit reasons using Google Gemini AI (with algorithmic fallback).
- **Request Body**:
  ```json
  {
    "campaign": {
      "industry": "Fashion",
      "objective": "Brand Awareness",
      "city": "Delhi NCR",
      "budget": "₹50,000 - ₹1,00,000",
      "category": "Fashion",
      "targetAudience": "Gen Z & Millennials",
      "followerRange": "50K - 200K",
      "platform": "Instagram"
    },
    "creators": [ ...availableCreatorsList ]
  }
  ```

### 3. `POST /api/natural-search`
- **Description**: Parses plain natural language search queries into structured filter parameters.
- **Request Body**:
  ```json
  {
    "query": "top bangalore tech influencers under 20k"
  }
  ```
- **Response**:
  ```json
  {
    "query": "top bangalore tech influencers under 20k",
    "filters": {
      "city": "Bangalore",
      "category": "Technology",
      "maxPrice": 20000
    }
  }
  ```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.0 or higher recommended)
- `npm` or `bun` or `yarn`

### Step-by-Step Setup

1. **Clone or Navigate to the project directory:**
   ```bash
   cd "social-cults-—-india's-biggest-influencer-platform"
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` (or `.env.local`):
     ```bash
     cp .env.example .env
     ```
   - Set your **Google Gemini API Key** inside `.env`:
     ```env
     GEMINI_API_KEY="your_actual_gemini_api_key_here"
     APP_URL="http://localhost:3000"
     ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Server will start at: `http://localhost:3000`

---

## 🔐 Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key used for AI Creator Matching & NLP Search | Optional (Has automatic fallback if omitted) |
| `APP_URL` | Base URL of the application (e.g. `http://localhost:3000`) | Optional |
| `PORT` | Backend server port (Default: `3000`) | Optional |

---

## 📜 NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware using `tsx` on `http://localhost:3000` |
| `npm run build` | Builds the Vite frontend client into `dist/` and bundles `server.ts` into `dist/server.cjs` via `esbuild` |
| `npm run start` | Runs the compiled production server (`node dist/server.cjs`) |
| `npm run preview`| Previews the Vite production build locally |
| `npm run lint` | Type-checks the entire TypeScript codebase (`tsc --noEmit`) |
| `npm run clean` | Cleans up the `dist/` and build artifacts directory |

---

<div align="center">
  <b>thebrandsstory.</b> — Empowering India's 50,000+ Creators & Next-Gen Brands 🇮🇳
</div>
#   t h e b r a n d s t o r y -  
 