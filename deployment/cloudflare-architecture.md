# Cloudflare Deployment Architecture

## Topology
- Cloudflare DNS + SSL/TLS + WAF in front of the application.
- Next.js application deployed to Cloudflare Workers with the OpenNext Cloudflare adapter.
- Supabase Postgres is hosted separately and reached from Workers through Cloudflare Hyperdrive.
- Cloudflare serves static assets from Workers Assets and executes dynamic Next.js route handlers in the Worker runtime.

## Environments
- Development: local Next.js + development SQL database.
- Staging: isolated app service + staging SQL database + separate Cloudflare subdomain.
- Production: dedicated app service + production SQL database + strict WAF and managed TLS.

## Environment variables
- Configure per environment in secret manager, never in source control.
- Required keys are documented in .env.example.
- Production requires `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and `DEFAULT_CURRENCY`.
- Local OpenNext builds also need `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` set to a local or development Postgres connection string so Hyperdrive can be emulated.

## Workers deployment
- Build and preview locally with `npm run preview`.
- Deploy with `npm run deploy` or configure Cloudflare Workers Builds to run the deploy command.
- The Worker entrypoint is `.open-next/worker.js` and static assets are emitted to `.open-next/assets`.
- `nodejs_compat` is enabled in `wrangler.jsonc` because the app uses Node-compatible server code.
- The Worker binds `HYPERDRIVE` to the `personal-finance-db` Hyperdrive config and uses it for Postgres access in production.
- Use the Workers/OpenNext flow for this app, not the Cloudflare Pages static-site form. The app has dynamic Next.js route handlers and middleware that need a Worker runtime.

## Cloudflare build settings
- Project type: Workers, using the connected GitHub repository.
- Production branch: `master`.
- Build/deploy command: `npm run deploy`.
- Runtime entrypoint: configured by `wrangler.jsonc` as `.open-next/worker.js`.
- Static assets: configured by `wrangler.jsonc` as `.open-next/assets`.
- Required variables/secrets: copy the same keys from `.env.local`, but set secrets through Cloudflare rather than source control.

## DNS and SSL/TLS
- Create DNS records for staging and production origins.
- Enable Full (strict) TLS.
- Enable Automatic HTTPS Rewrites.

## Security
- Enable WAF managed rules.
- Add rate limiting on /api/auth/login and /api/auth/register.
- Add bot protection challenge for repeated failed auth attempts.

## Caching
- Cache static assets aggressively.
- Bypass cache for /api/* and authenticated routes.

## Rollback
- Keep previous application image/build artifact for instant rollback.
- Apply database migrations forward-only in production where possible.
- For breaking schema changes, use expand-and-contract migration strategy.
