# 🏙️ CivicWatch — Crowdsourced Civic Issue Reporting System

A modern full-stack smart city platform for reporting, tracking, and resolving civic issues like potholes, garbage dumps, water leakage, and broken streetlights.

---

## 🚀 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React, React Router, Framer Motion, TailwindCSS |
| Maps       | Leaflet / React-Leaflet                         |
| Charts     | Chart.js / React-ChartJS-2                      |
| Backend    | Node.js, Express                                |
| Database   | MongoDB (Mongoose)                              |
| Auth       | JWT (jsonwebtoken + bcryptjs)                   |
| File Upload| Multer                                          |

---

## 📁 Project Structure

```
react civic issue/
├── frontend/          # React app
│   └── src/
│       ├── pages/     # Login, Register, Home, ReportIssue, MapView, ComplaintTracking, Dashboard
│       ├── components/# Layout, NotificationBell
│       ├── context/   # AuthContext
│       └── utils/     # Axios API instance
└── backend/           # Express API
    ├── models/        # User, Complaint, Notification
    ├── routes/        # auth, complaints, analytics, notifications
    ├── middleware/    # auth (JWT), upload (Multer)
    └── seed.js        # Demo data seeder
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd backend
npm install
# Seed demo data (optional but recommended)
npm run seed
# Start server
npm run dev
```

Server runs at: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at: `http://localhost:3000`

---

## 🔑 Demo Accounts

| Role      | Email                  | Password    |
|-----------|------------------------|-------------|
| Citizen   | citizen@demo.com       | password123 |
| Authority | authority@demo.com     | password123 |
| Admin     | admin@demo.com         | password123 |

---

## 🌟 Features

### Citizen Features
- **Report Issues** — 4-step wizard: photo upload → issue type → GPS location → review
- **AI Detection** — Simulated CNN classification with confidence score
- **Fake Report Detection** — Flags low-confidence or suspicious submissions
- **Duplicate Detection** — Merges complaints within 100m radius of same type
- **Upvoting** — Citizens can upvote issues to raise priority
- **Complaint Tracking** — Animated timeline showing Reported → Verified → In Progress → Resolved
- **Live Map** — Dark-themed interactive map with custom markers and heatmap overlay
- **Notifications** — Real-time in-app notifications for status updates

### Authority Features
- **Dashboard** — Full analytics with Bar, Doughnut, and Line charts
- **Complaint Management** — Filter, paginate, and update complaint status
- **Priority System** — Auto-escalates priority based on upvote count
- **Statistics** — Total, resolved, pending, high-priority counts

---

## 🎨 UI Highlights

- Dark theme with `#0a0a0f` background and blue/purple accent gradients
- Framer Motion animations: page transitions, card hovers, progress bars, loading states
- Glassmorphism cards with subtle borders and glow effects
- Animated collapsible sidebar navigation
- Dark-themed Leaflet map with CartoDB dark tiles
- Responsive layout for all screen sizes

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Register user      |
| POST   | /api/auth/login     | Login              |
| GET    | /api/auth/me        | Get current user   |

### Complaints
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/complaints                 | List all (with filters)  |
| GET    | /api/complaints/map             | Map data (public)        |
| GET    | /api/complaints/user/my         | My complaints            |
| GET    | /api/complaints/:id             | Single complaint         |
| POST   | /api/complaints                 | Create complaint         |
| PUT    | /api/complaints/:id/upvote      | Upvote                   |
| PUT    | /api/complaints/:id/status      | Update status (authority)|

### Analytics
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/analytics/summary      | Dashboard stats     |
| GET    | /api/analytics/resolution-time | Resolution times |

### Notifications
| Method | Endpoint                        | Description       |
|--------|---------------------------------|-------------------|
| GET    | /api/notifications              | Get notifications |
| PUT    | /api/notifications/:id/read     | Mark read         |
| PUT    | /api/notifications/read-all     | Mark all read     |
