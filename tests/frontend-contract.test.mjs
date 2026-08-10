import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const read = (path) => readFileSync(path, "utf8");
const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

test("API client applies the Sanctum and tenant contract", () => {
  const source = read("lib/api/client.ts");
  assert.match(source, /credentials:\s*"include"/);
  assert.match(source, /sanctum\/csrf-cookie/);
  assert.match(source, /X-Business-UUID/);
  assert.match(source, /X-XSRF-TOKEN/);
});

test("frontend does not persist auth tokens or reference internal IDs", () => {
  const files = [...walk("app"), ...walk("components"), ...walk("lib")].filter((path) => /\.(ts|tsx)$/.test(path));
  const source = files.map(read).join("\n");
  assert.doesNotMatch(source, /localStorage\.(setItem|getItem)\([^)]*(token|auth)/i);
  assert.doesNotMatch(source, /\b(business_id|lead_id|user_id)\b/);
});

test("lead mutations use dedicated action endpoints", () => {
  const source = read("lib/api/index.ts");
  for (const action of ["status", "assign", "notes", "tags"]) assert.match(source, new RegExp(`leads/.+/${action}`));
});

test("supporting API modules use exact UUID-based contracts", () => {
  assert.match(read("lib/api/members.ts"), /api\/app\/members/);
  assert.match(read("lib/api/members.ts"), /api\/app\/assignees/);
  assert.match(read("lib/api/settings.ts"), /settings\/workspace/);
  assert.match(read("lib/api/settings.ts"), /settings\/email-acknowledgement/);
  assert.match(read("components/lead-detail.tsx"), /leads\.assign\(uuid,e\.target\.value\|\|null\)/);
  assert.match(read("components/lead-detail.tsx"), /await load\(\)/);
});

test("settings submit only backend-supported fields and map validation errors", () => {
  const workspace = read("components/settings-screen.tsx");
  for (const field of ["name", "legal_name", "industry", "country_code", "timezone", "locale", "default_currency", "website_url"]) assert.match(workspace, new RegExp(field));
  assert.doesNotMatch(workspace, /slug/);
  assert.match(workspace, /error\?\.errors\[key\]/);
  const acknowledgement = read("components/email-settings-screen.tsx");
  for (const field of ["enabled", "template_uuid", "sender_name", "reply_to"]) assert.match(acknowledgement, new RegExp(field));
  assert.doesNotMatch(acknowledgement, /(api_key|secret|credential)/i);
});

test("team, pricing, and admin surfaces handle empty and permission states", () => {
  assert.match(read("app/app/team/page.tsx"), /status===403/);
  assert.match(read("app/app/team/page.tsx"), /role_uuid/);
  assert.match(read("app/pricing/page.tsx"), /publicPlans/);
  assert.match(read("app/pricing/page.tsx"), /temporarily unavailable/);
  assert.match(read("components/admin-shell.tsx"), /admin\.me/);
  assert.doesNotMatch(read("app/admin/page.tsx"), /(mrr|revenue|conversion)/i);
  assert.match(read("app/admin/system-health/page.tsx"), /No health snapshots/);
});
