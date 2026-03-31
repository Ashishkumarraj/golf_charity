# Golf Charity Subscription Platform

A modern, mobile-first full-stack platform for managing golf-related charity subscriptions, score tracking, and monthly draws.

## 🚀 Overview

This platform connects golfers with charities, allowing users to subscribe, track their golf scores, and participate in automated monthly draws. The system includes:

- **Frontend**: Responsive Next.js application with a premium dashboard.
- **Backend**: Node.js/Express API managing business logic and database interactions.
- **Database**: Supabase for persistent data storage and authentication.
- **Payments**: Stripe integration for recurring subscriptions.

## 📁 Project Structure

```text
golf_charity/
├── frontend/          # Next.js (app router) - Premium UI
├── backend/           # Node.js/Express - API and Logic
│   └── src/           # Backend source code
├── package.json       # Root scripts to run both services
└── README.md          # Project documentation
```

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, CSS (Vanilla with modern aesthetics), Framer Motion (for animations)
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Environment Setup
- Create a `.env` file in the `backend/` directory.
- Create a `.env.local` file in the `frontend/` directory.
- Refer to the respective directories for required environment variables.

### 3. Installation
Run the following command in the root directory to install dependencies for both frontend and backend:
```bash
npm install
# Then go to subdirectories
cd backend && npm install
cd ../frontend && npm install
```

### 4. Running the Application
From the root directory, run:
```bash
npm run dev
```
This will start both the backend (usually on port 5000) and the frontend (usually on port 3000).

## 📊 Features

- **User Dashboard**: Track golf scores and subscription status.
- **Monthly Draws**: Automated algorithm-driven draws for charity prizes.
- **Admin Panel**: Manage users, charities, and draw configurations.
- **Premium UI**: Dark mode optimized, smooth transitions, and high-end design.

## 🛡️ License
MIT
