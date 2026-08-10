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
