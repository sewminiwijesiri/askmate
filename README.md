# ASKmate 🎓

**ASKmate** is a high-premium, AI-powered academic collaboration platform designed to elevate the university learning experience. It connects students and lecturers through module-specific Q&A, a verified resource library, and an integrated AI tutor.

---

## 🚀 Key Features

### 👥 Role-Based Ecosystem
- **Students**: Get instant peer support, clarify doubts, and access high-quality study materials.
- **Lecturers**: Gauge student understanding, verify academic answers, and share official resources.
- **Helpers**: Community experts who contribute verified knowledge and earn badges.
- **Admins**: Comprehensive dashboard for platform analytics, user management, and reporting.

### 🤖 AI-Powered Intelligence
- **AI Tutor**: 24/7 instant feedback on academic queries.
- **Contextual Ingestion**: Automated PDF parsing and ingestion for RAG-based AI assistance.
- **Multilingual Support**: Real-time translation of academic content.

### 📚 Academic Utility
- **Module-Specific Q&A**: Discussions organized by course codes to prevent noise.
- **Resource Repository**: Centralized storage for past papers, lab reports, and revision summaries.
- **Automated Reminders**: Built-in scheduler for academic deadlines and notifications.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: Next.js API Routes, [Node-Cron](https://www.npmjs.com/package/node-cron) for background tasks
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) & JWT
- **Storage**: [Cloudinary](https://cloudinary.com/) for media and PDF management
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- MongoDB instance (Atlas or local)
- Cloudinary account (for image/PDF uploads)

### 2. Installation
```bash
git clone <repository-url>
cd askmate
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add the following:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

OPENAI_API_KEY=your_ai_key # For AI Tutor features
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📂 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Core utility functions, AI logic, and database connections.
- `src/models`: Mongoose schemas for Users, Questions, Modules, etc.
- `src/instrumentation.js`: Server-side initialization (e.g., Scheduler).

---

## 🛡️ License
Distributed under the MIT License.
