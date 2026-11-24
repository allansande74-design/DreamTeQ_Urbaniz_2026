# Operations console and role setup

The `/admin` operations console is intended for authenticated staff only. Access is checked server-side on every `/api/admin` request against Supabase Auth `app_metadata.role === "admin"`; a hidden link or client-side route is not an authorization boundary. Assign the `admin` role through a trusted Supabase server-side admin process only. Do not let users set their own `app_metadata` or expose the service-role secret.

The console provides verified-inventory list, active/paused state, available-space and active-hold summaries, recent reservation records, and a validated create/update flow. It does not process payments, reconcile operator invoices, manage customers, issue refunds, or replace a full ERP. Only report real operational values from the connected database. Configure the Supabase project and verified operator data before production use.

Sign in with an admin-role account and open `/admin`. The production app intentionally returns no demo inventory if its backend is not configured.
