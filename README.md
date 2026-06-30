# UCP Teacher Reviews

A full-stack web app for browsing University of Central Punjab (UCP) faculty and reading or submitting student reviews. Teacher data (names, photos, qualifications, experience, publications, email) is imported from the official [ucp.edu.pk](https://ucp.edu.pk) website.

## Features

### Home page (`/`)

- Welcome banner with site overview
- Live stats: teacher count, review count, and number of UCP faculties
- “How it works” guide for new visitors
- Top-rated teachers (when reviews exist)
- Calls to action that link to the full teacher directory

### Teacher Reviews (`/reviews`)

- Search teachers by name, department, designation, or faculty
- Filter by faculty and department
- Sort by name, highest rating, or most reviewed
- Browse teachers grouped by faculty (or by department when a faculty is selected)
- **Refresh UCP Data** — re-import the faculty listing from UCP
- **Sync All UCP Profiles** — background job to fetch full profiles (summary, qualifications, experience, publications, email) with live progress

### Teacher profile (`/teacher/:id`)

- Photo, designation, faculty, department, and contact info
- Full UCP profile details when synced
- Star rating and review count
- List of student reviews
- Review submission form (name, course, rating, comment, recommend yes/no)
- Optional email notification to the teacher when a review is submitted

### Backend & automation

- Auto-seeds teachers from UCP on first run if the database is empty
- Daily scheduled sync at 1:00 AM (Pakistan time by default): listing refresh + stale profile updates
- Parallel profile sync with configurable concurrency
- Image proxy and local photo caching
- API redirects `http://localhost:5000/` to the frontend URL

## Pages & Routes

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Landing page with stats and intro |
| `/reviews` | Teacher Reviews | Searchable faculty directory |
| `/teacher/:id` | Teacher profile | Detail view; `:id` is MongoDB ID or URL slug |

Navigation: **Home** → `/` · **Teacher Reviews** → `/reviews`

Open the app at **http://localhost:5173** (frontend). Port 5000 is the API only.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Data import | Cheerio web scraper |
| Scheduling | node-cron |
| Email | Nodemailer (Gmail SMTP) |

## Prerequisites

Install these before running the project:

1. **Node.js** — v18 or newer ([https://nodejs.org](https://nodejs.org))
2. **MongoDB** — MongoDB Community Server ([https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community))
3. **Git** — to clone the repository

Optional but useful:

- **MongoDB Compass** — GUI to view the database
- **npm** — included with Node.js

### MongoDB setup

1. Install MongoDB Community Server.
2. Make sure the **MongoDB** Windows service is running (Services → MongoDB → Start).
3. Default connection: `mongodb://127.0.0.1:27017`

In MongoDB Compass, connect with:

```text
mongodb://127.0.0.1:27017
```

The app uses the database: `ucp-teacher-reviews`

## Project Structure

```text
Teachers Review Website/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Navbar, TeacherCard, ReviewForm, etc.
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # Home (/)
│   │   │   ├── ReviewsPage.jsx # Directory (/reviews)
│   │   │   └── TeacherDetailPage.jsx
│   │   ├── config/site.js      # Site name, tagline, branding
│   │   └── api.js              # API client
│   └── package.json
├── server/                     # Express API
│   ├── config/                 # Database connection
│   ├── models/                 # Teacher & Review schemas
│   ├── routes/                 # teachers, reviews, images
│   ├── utils/                  # UCP scrapers, profile sync, email
│   ├── scheduler.js            # Daily auto-sync (node-cron)
│   ├── scripts/                # CLI import/sync/maintenance scripts
│   ├── uploads/teachers/       # Downloaded teacher photos (generated)
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Teachers Review Website"
```

### 2. Install dependencies

Install packages for **both** the backend and frontend:

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure environment variables

Copy the example env file in the `server` folder:

```bash
cd server
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Edit `server/.env` — key variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ucp-teacher-reviews
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password_here
SMTP_FROM=your@gmail.com
SMTP_FROM_NAME=UCP Teacher Reviews

SYNC_ENABLED=true
SYNC_CRON=0 1 * * *
SYNC_TIMEZONE=Asia/Karachi
SYNC_CONCURRENCY=8
```

| Variable | Description |
|----------|-------------|
| `PORT` | API server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS, redirects, and email links |
| `SMTP_HOST` | Mail server host (Gmail: `smtp.gmail.com`) |
| `SMTP_PORT` | Mail server port (`587` for Gmail TLS) |
| `SMTP_USER` | Gmail address used to send notifications |
| `SMTP_PASS` | Gmail **App Password** (not your regular Gmail password) |
| `SMTP_FROM` | From address shown in emails |
| `SMTP_FROM_NAME` | Sender display name in emails |
| `SYNC_ENABLED` | Set to `false` to disable the daily auto-sync |
| `SYNC_CRON` | Cron schedule (default: `0 1 * * *` = 1:00 AM daily) |
| `SYNC_TIMEZONE` | Timezone for the scheduler (default: `Asia/Karachi`) |
| `SYNC_CONCURRENCY` | Parallel profile requests during sync (default: `8`) |

### Email notifications (optional)

When a student submits a review, the app can email the teacher at their UCP address with the review details.

**Gmail setup:**

1. Turn on [2-Step Verification](https://myaccount.google.com/security) for your Gmail account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Put the 16-character password in `server/.env` as `SMTP_PASS`
4. Restart the API server

Teachers must have an email on their profile (imported from UCP via **Sync All UCP Profiles**). If a teacher has no email, the review is still saved but no email is sent.

**Without `SMTP_PASS`:** reviews work normally; email is skipped and a warning is logged.

**If emails land in spam:**

1. Mark as “Not spam” once in the teacher’s inbox
2. Add the sender address to contacts
3. Avoid localhost links in emails — profile links are omitted during local development. For production, set `CLIENT_URL` to your public domain
4. For best deliverability long-term, use a custom domain with SPF/DKIM (SendGrid, Resend, Google Workspace, etc.)

### 4. Start MongoDB

Ensure MongoDB is running before starting the API.

- **Windows:** MongoDB should run as a service automatically after install
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`

If MongoDB is not available, the server falls back to an **in-memory database** and **all data is lost when the server stops**. For development, always use a real MongoDB instance.

### 5. Run the application

Open **two terminals**.

**Terminal 1 — Backend API:**

```bash
cd server
npm run dev
```

You should see:

```text
MongoDB connected: 127.0.0.1
Database has N teachers
Server running on http://localhost:5000
```

On first run with an empty database, the server automatically scrapes teachers from UCP.

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

Open in your browser:

- **Home:** http://localhost:5173
- **Teacher Reviews:** http://localhost:5173/reviews

## Importing / Syncing Data

Run these from the `server` folder.

| Command | What it does |
|---------|----------------|
| `npm run scrape` | Import/update teacher list from UCP faculty pages |
| `npm run scrape:profiles` | Import full profiles (summary, qualifications, experience, publications, email) |
| `npm run sync:images` | Download teacher photos locally to `server/uploads/teachers/` |
| `npm run keep:ucp` | Remove non-UCP teachers from the database (maintenance) |
| `npm run fix:emails` | Re-sync profiles for teachers with invalid email addresses |

Recommended order for a fresh setup:

```bash
cd server
npm run scrape
npm run sync:images
npm run scrape:profiles
```

`scrape:profiles` syncs all remaining profiles in parallel (typically a few minutes for 600+ teachers).

You can also use **Refresh UCP Data** and **Sync All UCP Profiles** on the **Teacher Reviews** page (`/reviews`) while the app is running. Profile sync runs in the background and shows live progress.

### Automatic daily sync

While the API server is running, it automatically syncs from UCP every day at **1:00 AM** (Pakistan time by default):

1. Refreshes the teacher listing from UCP
2. Syncs missing and stale profiles (older than 30 days)

Configure in `server/.env`:

```env
SYNC_ENABLED=true
SYNC_CRON=0 1 * * *
SYNC_TIMEZONE=Asia/Karachi
SYNC_CONCURRENCY=8
```

The server must stay running overnight for the scheduler to fire (or use a process manager like PM2 in production).

### Fix rating counts (if needed)

If teacher ratings look wrong after importing old data:

```bash
cd server
node scripts/recalculateRatings.js
```

## API Overview

Base URL: `http://localhost:5000/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/teachers` | GET | List/search teachers (`search`, `faculty`, `department`, `sort`) |
| `/teachers/suggestions` | GET | Autocomplete suggestions for search |
| `/teachers/faculties` | GET | Distinct faculty names |
| `/teachers/departments` | GET | Departments (optional `?faculty=`) |
| `/teachers/stats` | GET | Teacher count, review count, top-rated teachers |
| `/teachers/:id` | GET | Teacher by MongoDB ID or slug |
| `/teachers/scrape` | POST | Re-import teachers from UCP |
| `/teachers/scrape-profiles` | POST | Sync profiles (background job; body: `onlyMissing`, `limit`, `background`) |
| `/teachers/scrape-profiles/status` | GET | Profile sync progress |
| `/reviews` | POST | Submit a review |
| `/reviews/teacher/:teacherId` | GET | Reviews for a teacher |
| `/images/proxy` | GET | Proxy UCP images |

The Vite dev server proxies `/api` and `/uploads` to the backend.

Visiting `http://localhost:5000/` redirects to `CLIENT_URL` (the frontend).

## MongoDB Collections

| Collection | Contents |
|------------|----------|
| `teachers` | Name, designation, department, faculty, photo, email, UCP profile fields, ratings: `averageRating`, `reviewCount`, `slug`, `profileScrapedAt` |
| `reviews` | `studentName`, `course`, `rating`, `comment`, `wouldRecommend`, linked to teacher |

View them in MongoDB Compass under the `ucp-teacher-reviews` database.

## Production Build (Frontend)

```bash
cd client
npm run build
npm run preview
```

For production, serve the `client/dist` folder with a static host and point the API to your deployed backend. Update `CLIENT_URL` in the server `.env` accordingly.

## Troubleshooting

### "Cannot GET /" on port 5000

That is the API server. Open **http://localhost:5173** for the web app. The API root redirects to the frontend when `CLIENT_URL` is set.

### "Teacher not found" on profile page

Teacher IDs can change if the database was reset. Browse teachers from **Teacher Reviews** instead of using old bookmarked URLs. Profile links use stable slugs (e.g. `/teacher/dr-muhammad-amjad-iqbal-faculty-of-information-technology-computer-science`).

### Photos not showing

1. Make sure the **API is running** on port 5000
2. Run `npm run sync:images` in the `server` folder
3. Hard refresh the browser: `Ctrl + Shift + R`
4. Restart the frontend after pulling new code: `cd client && npm run dev`

### Rating shows 0 after submitting a review

Refresh the teacher profile page. If it persists, run:

```bash
cd server
node scripts/recalculateRatings.js
```

### Port already in use

- API (5000): stop the other process or change `PORT` in `server/.env`
- Frontend (5173): Vite will try the next port (e.g. 5174) — use the URL shown in the terminal

### MongoDB connection failed

1. Confirm MongoDB service is running
2. Check `MONGODB_URI` in `server/.env`
3. Test in Compass with `mongodb://127.0.0.1:27017`

## Notes for Contributors

- This app is **UCP-only**. Faculty data is sourced from [ucp.edu.pk](https://ucp.edu.pk). Use the sync commands to refresh it; do not commit scraped data to git unless intentional.
- Student reviews are user-submitted and are not official university statements. The app does not import student enrollment data from UCP.
- Do not commit `server/.env` or secrets.
- Teacher photos are stored in `server/uploads/teachers/` after running `npm run sync:images`.

## License

This project is for educational use. UCP branding and faculty data belong to the University of Central Punjab.
