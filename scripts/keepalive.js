#!/usr/bin/env node
// keepalive.js — Pings the Render /health endpoint every 4 minutes to
// prevent the free-tier instance from spinning down (timeout is 50 seconds).
//
// Usage:
//   node scripts/keepalive.js https://your-app.onrender.com
//   RENDER_URL=https://your-app.onrender.com node scripts/keepalive.js
//
// Requires Node 18+ (uses built-in fetch). No dependencies.

const BASE_URL = process.argv[2] || process.env.RENDER_URL;

if (!BASE_URL) {
  console.error('❌  Provide the Render URL as an argument or RENDER_URL env var.');
  console.error('   Example: node scripts/keepalive.js https://your-app.onrender.com');
  process.exit(1);
}

// Strip trailing slash so /health always produces a clean URL.
const healthUrl = `${BASE_URL.replace(/\/$/, '')}/health`;

// 4 minutes — well under the 50-second inactivity window.
const INTERVAL_MS = 4 * 60 * 1000;

let pingCount = 0;

async function ping() {
  pingCount++;
  const timestamp = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000); // 15-second timeout

    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const body = await res.json().catch(() => ({}));
      console.log(`[${timestamp}] #${pingCount} ✅ ${res.status} — ${JSON.stringify(body)}`);
    } else {
      console.warn(`[${timestamp}] #${pingCount} ⚠️  HTTP ${res.status}`);
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[${timestamp}] #${pingCount} ❌ ${reason}`);
  }
}

console.log(`🏓 Keepalive started — pinging ${healthUrl} every ${INTERVAL_MS / 1000}s`);
console.log('   Press Ctrl+C to stop.\n');

// Ping once immediately, then on the interval.
ping();
setInterval(ping, INTERVAL_MS);
