# Ledger Atlas

Ledger Atlas is a production-style personal budgeting application built with Next.js, TypeScript, and a SQL Server-backed data layer. It includes account management, transaction tracking, recurring schedules, savings goals, category budgets, CSV import/export, reporting, and secure authentication.

## Project status

The app is implemented and verified to build successfully in the current workspace.

Verified commands:

```bash
npm run build
npm run lint
```

The local dev server is intended to run on:

```text
http://127.0.0.1:3000
```

## Core features

- Secure registration and login flow with JWT session cookies
- Account and category management
- Income, expense, and transfer transactions
- Budgeting and category planning
- Savings goals with progress tracking
- Recurring transactions and schedule generation
- Dashboard reporting and spending summaries
- CSV transaction export/import support
- Audit logging and basic session-aware API guards
- Responsive app shell for a budgeting dashboard experience

## Tech stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: App Router route handlers and server-side services
- Auth: bcryptjs + jose JWT
- Database: SQL Server / Azure SQL via `mssql`
- Validation: Zod
- Charts: Recharts
- CSV: `csv-stringify` / `csv-parse`
- Date utilities: date-fns
- Testing: Vitest

## Repository structure

```text
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   ├── server/
│   ├── services/
│   ├── types/
│   ├── validators/
│   └── middleware.ts
├── database/
│   └── BudgetingDatabase/
├── deployment/
├── tests/
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
├── eslint.config.mjs
├── README.md
└── middleware.ts
```

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 20+
- npm
- Access to a SQL Server or Azure SQL instance
- A valid `AUTH_SECRET` value

## Local environment setup

Create a local environment file using the provided sample:

```bash
cp .env.example .env.local
```

Then update the values in `.env.local`:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-chars
DATABASE_CONNECTION_STRING=Server=tcp:your-sql-server.database.windows.net,1433;Initial Catalog=BudgetingDatabase;Persist Security Info=False;User ID=app_user;Password=replace-me;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
DEFAULT_CURRENCY=AUD
```

Notes:

- The app is designed around SQL Server, not SQLite/D1.
- If the database is not available, auth and data routes will fail at runtime, even though the frontend may render.
- A valid secret is required for session token creation.

## Running locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://127.0.0.1:3000
```

## Database notes

The project includes a SQL Database Project under `database/BudgetingDatabase` with schema definitions and related setup content. The application expects a relational database with tables for:

- Users
- FinancialAccounts
- Categories
- Transactions
- Transfers
- Budgets
- BudgetCategories
- SavingsGoals
- RecurringTransactions
- Notifications
- AuditLogs

This project is not currently built for Cloudflare D1/SQLite without code changes.

## Cloudflare deployment guidance

A recommended production setup is:

- Cloudflare Pages for the Next.js frontend
- Azure SQL or another SQL Server-hosted database for application data
- Cloudflare project environment variables for runtime config

Recommended environment variables to set in the Cloudflare project:

```env
AUTH_SECRET=
DATABASE_CONNECTION_STRING=
NEXT_PUBLIC_APP_URL=
DEFAULT_CURRENCY=AUD
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Testing

The repository includes Vitest test scaffolding for unit and integration checks. You can run:

```bash
npx vitest run
```

## Security and operational expectations

- Session tokens are signed with a secret from the environment
- Passwords are hashed using bcryptjs
- API handlers use server-side auth guards for protected resources
- Database access is centralized through a single `mssql` helper layer

## Contributing

This project is intended as a real budgeting application and is structured for continued development around a live SQL database and an authenticated app experience.

## License

This project is provided as an internal working project and does not currently include a formal license file.
