# LeadReply frontend architecture

## Structure and data flow

LeadReply uses Next.js 16 App Router and TypeScript. Public marketing pages are Server Components, interactive customer/admin screens are focused Client Components, and `/app` and `/admin` have separate shells. The pricing page fetches `/api/public/plans` on the server with a five-minute revalidation window so plan content is present in indexable HTML.

Browser API traffic is centralized in `lib/api/client.ts`; domain modules in `lib/api/` reuse its Sanctum CSRF, credential, validation-error, and `X-Business-UUID` behavior. Authentication tokens are never stored in local storage. The selected business UUID is UI state only and is also submitted through the backend workspace switch endpoint.

## Supporting API integrations

- `members.ts`: paginated active member directory (`search`, `role_uuid`, `page`) and active assignee discovery. Public member/user UUIDs are identifiers; internal IDs are never consumed.
- `settings.ts`: explicit workspace GET/PATCH fields (`name`, `legal_name`, `industry`, `country_code`, `timezone`, `locale`, `default_currency`, `website_url`) and acknowledgement fields (`enabled`, `template_uuid`, `sender_name`, `reply_to`). Laravel 422 arrays render beside fields.
- `plans.ts`: unauthenticated server fetch of the public plan catalogue. Only returned prices, intervals, currencies, trials, enabled features, and limits are rendered.
- `admin.ts`: current admin identity, overview, businesses, users, integration errors, and system-health monitoring. Admin navigation is permission-filtered and customer authorization is still rejected by Laravel.

Lead assignment loads assignees only on the lead detail screen and refreshes lead data after assignment or unassignment. Email acknowledgement templates come from the existing template API and are restricted client-side to active email templates; Laravel remains authoritative.

## Errors, permissions, and security

New screens distinguish loading, empty, normal API failure, field validation, and 403 permission states. Navigation checks improve UX but do not replace backend authorization. Admin/app routes remain noindex. No credentials, provider payloads, security fields, internal bigint IDs, authorization headers, or secret settings are rendered.

## Environment and deployment

`NEXT_PUBLIC_API_URL` is the public browser-reachable Laravel origin and is also used by the pricing Server Component. `NEXT_PUBLIC_APP_URL` supplies the canonical frontend origin. Neither variable may contain secrets. Laravel must configure matching Sanctum stateful domains, credentialed CORS, session cookie domain, CSRF origins, and HTTPS settings.

## Backend limitations and deferred work

The member controller currently always returns active memberships even though its request accepts `status`; the directory therefore presents active users and does not claim invited/suspended filtering. Role options are derived from returned members because no role catalogue endpoint exists. Templates use the existing paginated endpoint and thus select from its returned page. Health data is snapshot-only. Team invitation/removal/role mutation, checkout/billing, impersonation, raw integration diagnostics, AI, automation, SMS, WhatsApp, and advanced reporting remain deferred.
