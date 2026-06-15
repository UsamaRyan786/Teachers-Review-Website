# UCP Teacher Reviews

A full-stack web app for browsing University of Central Punjab (UCP) faculty and reading or submitting student reviews. Teacher data (names, photos, qualifications, experience, publications) is imported from the official UCP website.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Data import | Cheerio web scraper |

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
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Home & teacher detail pages
│   │   └── api.js          # API client
│   └── package.json
├── server/                 # Express API
│   ├── config/             # Database connection
│   ├── models/             # Teacher & Review schemas
│   ├── routes/             # API routes
│   ├── utils/              # Scrapers & image handling
│   ├── scripts/            # CLI import/sync scripts
│   ├── uploads/teachers/   # Downloaded teacher photos (generated)
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

Default values in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ucp-teacher-reviews
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `PORT` | API server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |

### 4. Start MongoDB

Ensure MongoDB is running before starting the API.

- **Windows:** MongoDB should run as a service automatically after install.
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
Server running on http://localhost:5000
```

On first run with an empty database, the server automatically scrapes teachers from UCP.

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

Open the app in your browser:

**http://localhost:5173**

## Importing / Syncing Data

Run these from the `server` folder.

| Command | What it does |
|---------|----------------|
| `npm run scrape` | Import/update teacher list from UCP faculty pages |
| `npm run scrape:profiles` | Import full profiles (summary, qualifications, experience, publications) |
| `npm run sync:images` | Download teacher photos locally to `server/uploads/teachers/` |

Recommended order for a fresh setup:

```bash
cd server
npm run scrape
npm run sync:images
npm run scrape:profiles
```

`scrape:profiles` can take several minutes (600+ teachers).

You can also use the **Refresh UCP Data** and **Sync UCP Profiles** buttons on the home page while the app is running.

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
| `/teachers` | GET | List/search teachers |
| `/teachers/:id` | GET | Teacher by ID or slug |
| `/teachers/scrape` | POST | Re-import teachers from UCP |
| `/teachers/scrape-profiles` | POST | Sync profile data (batch) |
| `/reviews` | POST | Submit a review |
| `/reviews/teacher/:teacherId` | GET | Reviews for a teacher |
| `/images/proxy` | GET | Proxy UCP images |

The Vite dev server proxies `/api` and `/uploads` to the backend.

## MongoDB Collections

| Collection | Contents |
|------------|----------|
| `teachers` | Faculty data, photos, UCP profile info, ratings |
| `reviews` | Student reviews |

View them in MongoDB Compass under the `ucp-teacher-reviews` database.

## Production Build (Frontend)

```bash
cd client
npm run build
npm run preview
```

For production, serve the `client/dist` folder with a static host and point the API to your deployed backend. Update `CLIENT_URL` in the server `.env` accordingly.

## Troubleshooting

### "Teacher not found" on profile page

Teacher IDs can change if the database was reset. Browse teachers from the home page instead of using old bookmarked URLs. Profile links use stable slugs (e.g. `/teacher/dr-muhammad-amjad-iqbal-faculty-of-information-technology-computer-science`).

### Photos not showing

1. Make sure the **API is running** on port 5000.
2. Run `npm run sync:images` in the `server` folder.
3. Hard refresh the browser: `Ctrl + Shift + R`.
4. Restart the frontend after pulling new code: `cd client && npm run dev`.

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

1. Confirm MongoDB service is running.
2. Check `MONGODB_URI` in `server/.env`.
3. Test in Compass with `mongodb://127.0.0.1:27017`.

## Notes for Contributors

- Faculty data is sourced from [ucp.edu.pk](https://ucp.edu.pk). Use the sync commands to refresh it; do not commit scraped data to git unless intentional.
- Student reviews are user-submitted and are not official university statements.
- Do not commit `server/.env` or secrets.
- Teacher photos are stored in `server/uploads/teachers/` after running `npm run sync:images`.

## License

This project is for educational use. UCP branding and faculty data belong to the University of Central Punjab.
