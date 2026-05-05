#!/usr/bin/env node
/**
 * launch_indicator.js
 * Launches TradingView with CDP, injects crypto_lifer_indicator.pine, and compiles it.
 */
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const { launch } = await import(pathToFileURL(join(root, 'src/core/health.js')).href);
const { newScript, setSource, smartCompile, getErrors } = await import(pathToFileURL(join(root, 'src/core/pine.js')).href);

const source = readFileSync(join(__dirname, 'crypto_lifer_indicator.pine'), 'utf8');

// ── Step 1: Launch TradingView ─────────────────────────────────────────────
console.log('Launching TradingView...');
try {
  const result = await launch({ port: 9222, kill_existing: false });
  if (result.success) {
    console.log(`TradingView ready — CDP on port ${result.cdp_port}`);
    if (result.warning) console.warn('Warning:', result.warning);
  }
} catch (err) {
  // Already running is fine — continue
  if (!err.message?.includes('already')) {
    console.error('Launch error:', err.message);
    console.log('Attempting to connect to existing TradingView instance...');
  }
}

// Poll until CDP is reachable (up to 45 seconds)
console.log('Waiting for TradingView CDP to be ready...');
let cdpReady = false;
for (let i = 0; i < 45; i++) {
  await new Promise(r => setTimeout(r, 1000));
  try {
    const res = await fetch('http://localhost:9222/json/version');
    if (res.ok) { cdpReady = true; break; }
  } catch { /* not yet */ }
  if (i % 5 === 4) console.log(`  Still waiting... (${i + 1}s)`);
}
if (!cdpReady) { console.error('CDP never became ready after 45s. Is TradingView running?'); process.exit(1); }
// Extra settle time for the chart to initialize
await new Promise(r => setTimeout(r, 4000));
console.log('CDP ready.');

// ── Step 2: Open a fresh blank indicator slot ─────────────────────────────
console.log('Opening new blank indicator slot...');
await newScript({ type: 'indicator' });
await new Promise(r => setTimeout(r, 1500));

// ── Step 3: Inject the Pine Script ────────────────────────────────────────
console.log('Setting Pine source...');
const setResult = await setSource({ source });
if (!setResult.success) {
  console.error('Failed to set source:', setResult.error || setResult);
  process.exit(1);
}
console.log('Source injected.');

// ── Step 3: Smart compile ──────────────────────────────────────────────────
console.log('Compiling...');
const compileResult = await smartCompile();
if (!compileResult.success) {
  console.error('Compile failed:', compileResult.error || compileResult);
  const errors = await getErrors();
  if (errors?.errors?.length) {
    console.error('Errors:');
    errors.errors.forEach(e => console.error(`  Line ${e.line}: ${e.message}`));
  }
  process.exit(1);
}

console.log('Done. Crypto Lifer Indicator is live on the chart.');
console.log('Result:', JSON.stringify(compileResult, null, 2));
