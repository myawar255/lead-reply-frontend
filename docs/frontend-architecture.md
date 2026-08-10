# LeadReply frontend architecture

## Structure

The application uses Next.js 16 App Router and TypeScript. Public marketing pages live at the root, authentication routes use the `(auth)` group, customer screens live under `/app`, and the platform shell is isolated under `/admin`. Interactive API-backed screens are client components; public content and route wrappers remain server components.

## Laravel integration

`lib/api/client.ts` is the only fetch implementation. `lib/api/index.ts` separates auth, workspace, lead, conversation, and template operations. Types in `lib/types.ts` follow Laravel JSON resources and use public UUIDs only. Browser requests use `credentials: include`, obtain `/sanctum/csrf-cookie` before mutations, send `X-XSRF-TOKEN`, and propagate the selected workspace as `X-Business-UUID`.

Laravel remains authoritative for authentication, validation, permission checks, and tenancy. The selected workspace UUID is stored only as a UI convenience; switching is also submitted to Laravel. `proxy.ts` performs early server-side route checks by forwarding the incoming cookie to `/api/auth/me` (or `/api/admin/me`). Client checks handle expired sessions after navigation.

## Errors and forms

`ApiError` normalizes 401, 403, 404, 409, 422, 429, and server failures. Laravel 422 field arrays are exposed to forms. Forms deliberately implement only lightweight native constraints and do not duplicate Laravel validation.

## Permissions and boundaries

Workspace permissions returned by the current business resource hide inaccessible navigation and actions for convenience. The API remains the security boundary. No internal database IDs, bearer tokens, local-storage auth tokens, or secrets are used.

## Screens

Lead browsing maps filters and pagination to URL query parameters. Lead details use dedicated status, assignment, note, and tag actions and refresh after writes. Conversation lists do not preload histories; detail screens request messages separately and distinguish inbound/outbound plus explicit status text. Template changes create backend versions through the existing endpoint.

The backend does not currently expose a tenant member directory, workspace settings update contract, acknowledgement settings contract, public plans, or admin monitoring datasets. Team and Settings document these boundaries instead of inventing behavior. Assignment supports unassigning but cannot safely discover alternate assignees.

## SEO and deployment

Metadata, Open Graph defaults, robots, sitemap, and semantic public pages are included. Auth, app, and admin areas are non-indexable. Deploy with `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL`; configure Laravel Sanctum stateful domains, session cookie domain, CORS credentials, trusted HTTPS, and matching CSRF origins for the app/API domains.

## Deferred

AI, automation, SMS, WhatsApp, calendar booking, billing, social/CRM integrations, advanced reporting, team mutation, workspace mutation, and full platform monitoring are intentionally deferred.
