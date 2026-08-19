# Supabase Setup Guide

This budgeting application uses Supabase (PostgreSQL) as the backend database and authentication provider. Follow these steps to set up your Supabase project.

## Prerequisites

- A [Supabase account](https://supabase.com) (free tier is available)
- Node.js 18+ and npm installed locally
- VS Code or your preferred code editor

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in with your account
2. Click "New Project" or navigate to your organization
3. Fill in the project details:
   - **Name**: `personal-finance` (or your preferred name)
   - **Database Password**: Create a strong password (you'll need this once, keep it safe)
   - **Region**: Select the region closest to you for best performance
   - **Pricing Plan**: Free tier is sufficient for development/testing

4. Wait for the project to be created (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

Once your Supabase project is created:

1. Go to **Settings → API** in the left sidebar
2. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **Anon Public Key**: Copy this (starts with `eyJ...`)
   - **Service Role Secret**: Copy this (starts with `eyJ...`) - **KEEP THIS SECRET**, only for server-side

3. Also note the **Database Password** you created earlier

## Step 3: Set Up Environment Variables

1. In the root of the project, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   AUTH_SECRET=generate-a-random-32-character-string
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
   DATABASE_URL=postgresql://postgres.xxxxx:YOUR_DB_PASSWORD@aws-0-your-region.pooler.supabase.com:6543/postgres?pgbouncer=true
   DEFAULT_CURRENCY=AUD
   ```

   **Important:**
   - `AUTH_SECRET`: Generate a random 32+ character string (can use `openssl rand -hex 16`)
   - `DATABASE_URL`: Use **Settings -> Database -> Connection string -> Transaction pooler** in Supabase. Replace `YOUR_DB_PASSWORD` with the database password you created, and `xxxxx` with your project ref.
   - **Keep `.env.local` private** - add it to `.gitignore` (already done by default)

## Step 4: Create the Database Schema

The easiest way is to use Supabase's SQL Editor:

1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **"RUN"** to execute the migration

The schema will:
- Create all necessary tables (users, accounts, categories, transactions, budgets, etc.)
- Set up Row-Level Security (RLS) policies for data privacy
- Create indexes for performance
- Create helper views for reports

## Step 5: Verify the Installation

1. In the Supabase dashboard, go to **Table Editor** to confirm tables were created:
   - `users`
   - `financial_accounts`
   - `categories`
   - `transactions`
   - `transfers`
   - `budgets`
   - `budget_categories`
   - `savings_goals`
   - `recurring_transactions`
   - `notifications`
   - `audit_logs`

2. Verify RLS is enabled on each table (look for the lock icon in Table Editor)

## Step 6: Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 7: Test the Application

1. Navigate to `http://localhost:3000/register`
2. Create a new account with:
   - Email: your test email
   - Password: minimum 8 characters
   - First/Last Name: anything you prefer
   - Default Currency: AUD (or your preference)
   - Timezone: Australia/Sydney (or your timezone)

3. After registering, you should be logged in and see the dashboard
4. Default expense categories will be auto-created:
   - Groceries, Dining Out, Transportation, Utilities, Healthcare, Entertainment, Shopping, Subscriptions, Travel, Other Expense
5. Start by creating financial accounts

## Troubleshooting

### Connection Errors
- Verify your `DATABASE_URL` is correct (especially the password)
- If direct database connections fail with IPv6 errors like `ENETUNREACH`, use Supabase's transaction pooler connection string instead
- Check that your Supabase project is active (not paused)
- Ensure your firewall allows connections to Supabase

### RLS Policy Errors
- If you get permission denied errors, the RLS policies may not have been set up correctly
- Re-run the migration SQL in the Supabase SQL Editor
- In Table Editor, verify that RLS is "ON" for each table

### Authentication Issues
- Clear cookies and local storage in your browser
- Check that `AUTH_SECRET` is at least 32 characters
- Verify the session cookie is being set (check browser DevTools)

### Build Errors
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- These should be in `.env.local` (not `.env`)
- Rebuild with `npm run build`

## Production Deployment

For production (Cloudflare Workers, Vercel, etc.):

1. Set up environment variables in your hosting platform's dashboard
2. Ensure `DATABASE_URL` uses the correct Supabase connection string
3. Set `NODE_ENV=production` in your hosting environment
4. Database SSL will be enabled automatically for production connections
5. See `deployment/cloudflare-architecture.md` for Cloudflare-specific instructions

## Security Notes

1. **Never commit `.env.local`** - this file contains secrets
2. **Service Role Key** is server-only - never expose it to the client
3. **Row-Level Security (RLS)** ensures users can only access their own data
4. Supabase provides additional security features:
   - JWT-based authentication
   - SSL/TLS encryption in transit
   - Database encryption at rest (on paid plans)

## Next Steps

1. Add financial accounts
2. Import transactions (if CSV import is configured)
3. Set up budgets for expense tracking
4. Create savings goals
5. Review reports and dashboards

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Supabase Community Slack
- GitHub Issues for this project
