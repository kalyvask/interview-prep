#!/usr/bin/env node
/**
 * predev / prebuild hook.
 *
 * The personal config layer (src/content/personal.ts) is gitignored so a
 * user's profile, anchor stories, and metric facts never end up in the
 * repo. The committed file is src/content/personal.example.ts; this
 * script copies it to personal.ts the first time the dev server or
 * production build runs. If personal.ts already exists, it's left alone.
 *
 * To re-sync after pulling a new example, delete src/content/personal.ts
 * and re-run npm run dev / npm run build.
 */

import { existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const target = join(root, "src", "content", "personal.ts");
const source = join(root, "src", "content", "personal.example.ts");

if (existsSync(target)) {
  process.exit(0);
}
if (!existsSync(source)) {
  console.error("[init-personal] src/content/personal.example.ts is missing.");
  process.exit(1);
}
copyFileSync(source, target);
console.log("[init-personal] Created src/content/personal.ts from personal.example.ts.");
