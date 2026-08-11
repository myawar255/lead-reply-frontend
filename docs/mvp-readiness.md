# MVP production-readiness audit

Audit date: 2026-08-12

## Readiness summary

The frontend is ready for full end-to-end MVP testing against a production-like Laravel environment. Static analysis, production compilation, and contract tests must pass before deployment; the manual matrix below remains a release prerequisite because the repository does not include a browser automation framework.

## Completed workflows and API dependencies

- Authentication: Sanctum CSRF cookie, registration, login, logout, current user, password reset, verification resend, and verified-state routing.
- Workspace: list, create, switch, current resource, permission navigation, stale-selection recovery, and hard tenant-state reset.
- CRM: paginated/filterable lead list, UUID detail, status, assignment/unassignment, notes, tags, and activity.
- Communications: paginated conversations, chronological paginated message history, queued replies, delivery-state display, and email templates.
- Configuration: explicit workspace fields and email acknowledgement fields with Laravel 422 messages.
- Public/admin: server-rendered public plans and isolated permission-aware monitoring pages.
- Onboarding: a dismissible dashboard checklist deep-links to existing screens and calculates profile, active-template, saved acknowledgement, and first-lead progress from current workspace APIs.

All authenticated browser calls use `credentials: include`. Mutations initialize CSRF and send the decoded XSRF cookie. Tenant calls propagate `X-Business-UUID`; Laravel remains authoritative for membership, permissions, active business state, and cross-tenant UUID rejection.

## Authentication and tenant lifecycle

Unauthenticated protected routes redirect to login. Authenticated verified users visiting login/register go to the app; unverified users go to verification guidance without a redirect loop. Nested admin routes use `/api/admin/me`. Browser 401 responses clear local workspace state and replace the document with login.

Tenant screens remain unmounted until workspace resolution completes. Stale or revoked selections are removed. A successful switch updates Laravel, saves the returned UUID, and performs a full document replacement, ensuring no prior tenant component state survives.

Onboarding dismissal uses `leadreply_onboarding_dismissed_<business UUID>`. This stores no credentials or completion claims and cannot leak dismissal across workspaces. First-reply progress remains informational because the API exposes no reliable milestone aggregate.

## Required public environment variables

- `NEXT_PUBLIC_API_URL`: browser-reachable Laravel origin, without credentials or secret path parameters.
- `NEXT_PUBLIC_APP_URL`: canonical Next.js application origin.

Laravel production configuration must align `FRONTEND_URL`, Sanctum stateful domains, credentialed CORS origins, session cookie domain, secure/SameSite cookie policy, trusted proxies, HTTPS, mail/queue workers, and verification URL generation. Never copy Laravel `APP_KEY`, database credentials, Resend keys, webhook secrets, provider tokens, or encryption keys into frontend variables.

## Production deployment prerequisites

1. Serve frontend and API over HTTPS on the configured origins.
2. Confirm cross-origin CSRF-cookie and session-cookie behavior in the target browser matrix.
3. Run migrations/seed authorization roles and ensure queues plus scheduler/health snapshot jobs operate.
4. Confirm public plan records and active prices/features are configured.
5. Configure an active email integration before enabling acknowledgements or sending replies.
6. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build` with production public URLs.
7. Execute the manual checklist below with at least two businesses and customer/admin accounts.

## Manual end-to-end checklist

- Register, observe verification lock, resend, verify, return, and continue into workspace creation.
- Test valid/invalid login, authenticated refresh, expired session, logout, browser Back after logout, guest routes while authenticated, and unverified route access.
- Test zero, one, and multiple workspaces; switch A → B from every major screen; verify no A names, records, requests, or UUID links appear after the switch.
- Revoke membership and suspend a business while its screen is open; refresh and confirm safe recovery/denial.
- Exercise lead search/filter/pagination, UUID detail, status, assignment/unassignment, note, tag, activity, missing lead, and denied mutations.
- Open empty and long conversations; inspect inbound/outbound direction; queue a manual and template reply; confirm queued is not labelled delivered; then observe sent/delivered/failed updates after refresh.
- Save valid/invalid workspace and acknowledgement settings; confirm 422 field messages, integration-readiness rejection, success persistence, and refresh persistence.
- Test team search, role filter, pagination, empty state, and read-only behavior.
- Test a new workspace checklist at 0%, then complete profile, create an active email template, save accepted acknowledgement settings, and receive a lead; confirm each completion appears only after current API data changes. Dismiss in Business A and verify the checklist remains visible in Business B.
- Load pricing with empty catalogue, multiple currencies/intervals, limits/trials, and simulated API outage.
- Test `/admin` and every child route as guest, normal customer, platform viewer, security viewer, and super-admin; verify only returned metrics and sanitized errors appear.
- Review mobile (approximately 375px), tablet (768px), and desktop (1280px+) navigation, tables, lead detail, conversation composer/messages, settings, team, pricing, and admin screens using keyboard-only navigation and a screen reader smoke test.

## Known limitations and deferred work

- Verification links return backend JSON rather than redirecting to the frontend.
- Template listing is backend-fixed to the first 50 records.
- Member status filtering is effectively active-only and no role catalogue is exposed.
- Acknowledgement readiness is reported only when PATCH validation runs.
- No automated browser E2E suite currently exists.

Deferred by product scope: AI, automation, Stripe checkout, SMS, WhatsApp, calendar, team invitations/role editing/removal, integrations UI, impersonation, and advanced analytics.
