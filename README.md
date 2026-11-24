# Urbaniz

Mobile-first parking discovery PWA in `apps/client`, with Next.js API routes, a Supabase/Postgres integration path, a real OpenStreetMap city map, and offline caching for previously fetched parking results.

## Run locally

```sh
pnpm install
pnpm --filter web dev
```

Open http://localhost:3000. Without Supabase variables, development uses clearly labelled, illustrative sample inventory; reservations are disabled. The demo entries are not verified parking supply or bookable offers. Production refuses to return demo inventory.

## Production setup (required)

1. Create a Supabase project and configure email/password authentication and email confirmation according to your security policy.
2. Apply `supabase/migrations/202611240001_urbaniz_core.sql`. Import only parking locations for which you have permission to publish accurate coordinates, pricing, capacity, and current inventory. Sample data must not be used as live inventory.
3. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the server deployment environment (and local `apps/client/.env.local` for development). Never expose the service-role key to client code.
4. Provision the Supabase Auth redirect/site URLs, email delivery, database backups, monitoring, rate limits, and operator inventory ingestion. Serve only over HTTPS.
5. Run `pnpm --filter web check-types`, `pnpm --filter web lint`, and `pnpm --filter web build`, then perform device, browser, accessibility, offline, auth, and reservation concurrency tests before launch.

Availability is computed from active 15-minute holds inside Postgres. Reservation requests require an authenticated account, validate the session server-side, and call a transaction-backed function with an idempotency key. A reservation is not made when the service is unreachable. The map uses OpenStreetMap and source coordinates; it is not a navigation/routing service, and map tiles do not verify a space's entrance or availability. Review OpenStreetMap tile/service usage terms before high-volume or commercial production use; a production SLA may require a contracted map provider.

## Remaining operational requirements

This repository cannot provision credentials, parking-operator agreements/feeds, email delivery, billing, production hosting, or a supported map SLA. Configure and validate those external services before calling a deployment production-ready. No compliance percentage or Uber-equivalent location accuracy is claimed. Add a privacy notice and jurisdiction-specific retention/payment/security review before collecting production user data.
