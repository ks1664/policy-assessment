# Policy Management API - Node.js Assessment

A JavaScript/Node.js implementation of the supplied insurance policy assessment.

## Stack
- Node.js + Express
- MongoDB + Mongoose
- Worker Threads for file import
- CSV/XLS/XLSX parsing
- node-cron for persisted scheduled messages
- PM2 for automatic process restart

## Collections
The import creates/uses these separate MongoDB collections:
- `agents`
- `users`
- `useraccounts`
- `lobs`
- `carriers`
- `policies`
- `scheduledmessages`

`policies` stores references to agent, user, account, LOB and carrier documents.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Make sure MongoDB is running locally, or update `MONGO_URI` in `.env`.

## APIs

### 1. Upload CSV/XLS/XLSX

`POST /api/import/upload`

Form-data:
- key: `file`
- value: assessment CSV/XLSX file

Example:
```bash
curl -X POST http://localhost:3000/api/import/upload \\
  -F "file=@data-sheet.csv"
```

The HTTP server only starts the worker. The worker reads the file, connects to MongoDB and performs the import so the main event loop is not blocked by the import work.

### 2. Search policies by username

`GET /api/policies/search?username=Lura`

The endpoint uses a case-insensitive partial match against `users.firstName` and returns policy information with related documents populated.

### 3. Aggregate policies by user

`GET /api/policies/aggregate-by-user`

Returns each user with their policy count and policies.

### 4. Schedule a message

`POST /api/messages/schedule`

Body:
```json
{
  "message": "Call customer about renewal",
  "day": "2026-10-01",
  "time": "14:30"
}
```

The schedule is stored in MongoDB as `pending`. A cron job checks due records every minute and changes them to `inserted`, recording `insertedAt`. Because the schedule is persisted, pending messages survive an API restart.

## CPU monitoring

The process samples host CPU utilization every 5 seconds. When it reaches the configured `CPU_LIMIT` (70% by default), the application exits with code 1.

In production the process should be managed by a supervisor such as PM2, which restarts it automatically:

```bash
npm install -g pm2
npm run start:pm2
pm2 status
```

This is preferable to a process spawning another copy of itself, which can create duplicate servers and unstable restart loops.

## Notes about the supplied sheet

The provided assessment file contains 1,198 rows and fields such as `agent`, `firstname`, `account_name`, `category_name`, `company_name`, `policy_number`, `policy_start_date`, `policy_end_date`, `email`, `phone`, `address`, `state`, `zip` and `dob`.

The importer maps those fields into the normalized collections rather than storing the entire source row in one MongoDB document.
