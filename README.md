#  Quran Academy Portal

A modern, high-performance Single Page Application (SPA) designed to deliver a seamless online Quran learning experience and role-based management for educational institutions.

---

##  Portal Purpose
The Quran Academy Portal bridges students, teachers, and administrators into a unified digital environment. It streamlines student onboarding, interactive course discovery, live schedule tracking, and academic administration without complex server overhead.

---

##  Roles & Features

###  Admin Portal
- **Dashboard & Analytics:** Overview of system activity, enrollment metrics, and inquiries.
- **User & Course Management:** Full control over student, teacher, and course records.
- **Inquiries & Requests:** Manage incoming contact queries and trial class requests.

###  Teacher Portal
- **Class Schedules:** Interactive view of upcoming 1-on-1 and group teaching sessions.
- **Student Progress:** Track student performance, attendance, and lesson logs.
- **Profile & Availability:** Manage teaching subjects and schedule preferences.

###  Student Portal
- **Learning Hub:** Access enrolled courses, class schedules, and tutor information.
- **Interactive Catalog:** Explore courses like Nazra, Hifz, and Tajweed with custom enrollment flows.
- **Progress Tracker:** Visual statistics for attendance and learning milestones.

---

##  Tech Stack
- **Core Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Lucide Icons
- **Routing:** `react-router-dom`
- **State & Data:** In-memory mock database (`src/data/mockData.ts`) with `localStorage` session persistence

---

## How to Run Locally

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone [https://github.com/Sadia-Ilyas/quran-portal.git](https://github.com/Sadia-Ilyas/quran-portal.git)
cd quran-portal
npm install
npm run dev