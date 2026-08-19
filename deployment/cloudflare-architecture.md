# Cloudflare Deployment Architecture

## Topology
- Cloudflare DNS + SSL/TLS + WAF in front of the application.
- Next.js application deployed to a Node-compatible runtime (Cloudflare containerized origin via Cloudflare Tunnel or Cloudflare-integrated container platform).
- SQL Server-compatible database hosted separately (Azure SQL / SQL Server).
- Cloudflare used for CDN caching of static assets and security controls, not for direct SQL execution in edge workers.

## Environments
- Development: local Next.js + development SQL database.
- Staging: isolated app service + staging SQL database + separate Cloudflare subdomain.
- Production: dedicated app service + production SQL database + strict WAF and managed TLS.

## Environment variables
- Configure per environment in secret manager, never in source control.
- Required keys are documented in .env.example.

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
