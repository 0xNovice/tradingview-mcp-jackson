# Change Summary — 2026-04-20

## Scripts Updated
- `scripts/npoc_sessions.pine` — indicator
- `scripts/npoc_confluence_strategy.pine` — strategy

---

## Moving Averages
- **Slow MA default changed from 50 → 200** (aligning with the 21/200 MA strategy)
- Added **200 SMA** (yellow) and **800 SMA** (fuchsia/magenta) to both scripts
- MA suite on chart: 21 EMA (aqua) · 200 EMA (red) · 200 SMA (yellow) · 800 SMA (fuchsia)

## Pre-Trade Checklist (9-Point Scoring System)
Integrated the Crypto Lifer Pre-Trade Checklist into both scripts:

| # | Rule | Implementation |
|---|------|----------------|
| 1 | Bullish pattern | `close > 21 MA` |
| 2 | Price at bottom of trend line | Within 1×ATR of 21 MA or near NPOC |
| 3 | Price in last 25% of pattern | Close ≤ lower 25% of recent swing range |
| 4 | MACD turning bullish | Histogram rising (`hist > hist[1]`) |
| 5 | MACD line curving toward signal | MACD line rising, approaching/crossing signal from below |
| 6 | RSI + Stoch below 50 / near oversold | `RSI < 50 and Stoch %K < 50` |
| 7 | Shorter MA curving toward longer MA | 21 MA slope positive + gap to 200 narrowing or above |
| 8 | Divergence (off by default) | Price at recent low, RSI above its recent low |
| 9 | Near significant S/R | Within proximity of a Naked POC level |

## New Indicators Added
- **MACD** (12/26/9) — calculations used for checklist items 4 & 5
- **Stochastic** (14/3/3) — used for checklist item 6
- RSI threshold changed from ≥50 to <50 for longs (per checklist rule 6)

## Live Checklist Table
- Top-right corner table showing ✓/✗ for all 9 items (LONG and SHORT columns)
- Score row highlights green (LONG ≥ 6/9) or red (SHORT ≥ 6/9)
- Each condition individually toggleable via input settings

## Strategy Changes (npoc_confluence_strategy.pine)
- Entry now requires configurable min score (default 6/9) instead of binary confluence
- Stop loss: 1.5× ATR · Take profit: 2.0× R:R (unchanged)

## Bug Fix
- `ta.crossover` / `ta.crossunder` moved to global scope variables to prevent
  inconsistent historical calculations when used inside conditional expressions
