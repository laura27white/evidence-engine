#!/usr/bin/env node
// Fail if any em dash (U+2014) appears in a tracked source or documentation file.
// Per userPreferences: no em dashes in code comments, UI copy, or docs.
// Run via `pnpm lint:emdash` and from CI.

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const EM_DASH = '\u2014';

const ALLOWED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.toml',
  '.sh',
  '.sql',
  '.env.example',
]);

const SKIP_FILES = new Set([
  'scripts/check-no-emdash.mjs',
  'pnpm-lock.yaml',
]);

function listTrackedFiles() {
  const output = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
  return output.split(/\r?\n/).filter(Boolean);
}

function shouldScan(file) {
  if (SKIP_FILES.has(file)) return false;
  const ext = extname(file).toLowerCase();
  if (file.endsWith('.env.example')) return true;
  if (!ext) return false;
  return ALLOWED_EXTENSIONS.has(ext);
}

function scanFile(file) {
  let contents;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) return [];
    contents = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const hits = [];
  const lines = contents.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line !== undefined && line.includes(EM_DASH)) {
      hits.push({ line: i + 1, text: line.trim() });
    }
  }
  return hits;
}

function main() {
  const files = listTrackedFiles().filter(shouldScan);
  const violations = [];
  for (const file of files) {
    const hits = scanFile(file);
    for (const hit of hits) {
      violations.push({ file, ...hit });
    }
  }

  if (violations.length === 0) {
    console.log('No em dashes found. All', files.length, 'scanned files are clean.');
    process.exit(0);
  }

  console.error('Em dashes found. Replace with a comma, semicolon, or full stop.\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}: ${v.text}`);
  }
  console.error(`\nTotal violations: ${violations.length}`);
  process.exit(1);
}

main();
