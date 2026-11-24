# Urbaniz

A mobile-first smart parking experience for discovering nearby parking, comparing rates, and making a quick reservation. The client lives in `apps/client` in this Next.js/Turborepo workspace.

## Run locally

```sh
pnpm install
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000). Build the client with `pnpm --filter web build` or run workspace checks with `pnpm check-types`.

## Included in this starter

- Responsive parking discovery interface with map/list presentation, spot filters, search, saved spots, and a reservation confirmation flow.
- PWA manifest, installable app metadata, and a service worker that caches the app shell and parking results for offline viewing.
- Next.js API routes for sample parking availability (`GET /api/spots`) and reservation validation (`POST /api/reservations`).

## Demo data and production work

Parking listings are illustrative Civic Center / Hayes Valley sample data. Reservation API responses are demo holds, not live bookings; the route currently has no payment, account, durable database, or operator inventory integration. Production deployment should connect authenticated users, a transactional reservation database, real-time parking operator feeds, payment processing, and a maps/geocoding provider. Offline mode retains the app shell, last fetched parking response, and saved spot IDs on the device; confirming a new reservation requires a connection.
