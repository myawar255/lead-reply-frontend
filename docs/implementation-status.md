# Implementation status

Last reviewed: 2026-08-12

Implemented: marketing/authentication, verified-session route protection, workspace selection and switching, responsive customer shell, dashboard, lead/conversation/template workflows, SEO foundations, normalized Laravel errors, and environment documentation.

New supporting integrations completed:

- Read-only active team directory with search, role filtering, member indicators, pagination, and permission/error/empty states.
- UUID-based lead assignment and unassignment using tenant-safe assignee discovery, with post-mutation refresh.
- Explicit workspace settings GET/PATCH form and Laravel validation feedback.
- Email acknowledgement settings with enable toggle, active email-template selection, sender name, reply-to, and backend integration warnings surfaced as validation messages.
- Server-rendered public plan catalogue with actual prices, billing intervals, currencies, trials, public features/limits, and graceful outage/empty behavior.
- Separate platform-admin shell with returned overview metrics, filtered/paginated business and user tables, sanitized integration errors, and latest system-health snapshots.
- Static contract tests covering tenant/CSRF behavior, UUID usage, supported settings fields, permission states, no secrets, dynamic plans, and non-fabricated admin metrics.
- Production stabilization covering verified-user redirects, nested admin protection, global expired-session handling, stale membership recovery, tenant-state destruction during switching, workspace-resolution fetch gating, complete paginated message history, conversation/dashboard failures, and responsive message composition.

Known backend limitations: member status is validated but the directory query is active-only; there is no business-role catalogue; no team mutations are exposed; template index pagination is fixed at 50 and later pages cannot be requested; email verification links return JSON instead of redirecting to the frontend; no acknowledgement readiness payload exists beyond PATCH validation; and monitoring exposes snapshots/summaries only.

Intentionally deferred: invitations, role editing/removal, Stripe checkout and billing UI, integration configuration/credentials, impersonation, raw provider payloads, AI, automation, SMS/WhatsApp, calendar, and advanced analytics.
