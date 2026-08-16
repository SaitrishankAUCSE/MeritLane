# Meritlane

> **Proof of skill beats college pedigree.**
> A verified, project-based hiring platform for Tier-2 and Tier-3 engineering talent in India.

---

## 🎯 Overview
Meritlane solves the signaling problem for engineering graduates from Tier-2/Tier-3 colleges. Rather than filtering candidates by college brand, Meritlane establishes an objective codebase verification and assessment layer that connects verified engineering talent directly with hiring teams.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React
- **Authentication & Database**: Firebase (Auth & Firestore)
- **Deployment**: Vercel

---

## 📂 Architecture & Routing
- `/` — High-signal Landing Page (Core thesis, 3-step verification model, Candidate/Employer CTAs)
- `/candidate/profile` — Candidate profile shell (Academic info, skills tag input, repeatable project submissions with pending verification badges)
- `/employer/dashboard` — Employer dashboard shell (Pipeline overview, candidate pipeline empty state, role requirements posting form)

---

## 🚀 Getting Started

First, install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
```
