# Binance Case Tracking

A static Ethereum downstream case study, prepared for GitHub Pages. The repository slug intentionally follows `Binance_Case_Traking`.

Intended website URL: https://fuqishuang228.github.io/Binance_Case_Traking/

## Publish

1. Create this repository on GitHub and initialize it with a README.
2. Upload `index.html`, `styles.css`, `app.js`, `full-flow.html`, `.nojekyll`, and the `assets` directory to the default branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, then **main / (root)** and save.
4. Wait for the GitHub Pages deployment to succeed, then check the URL above before using the presentation QR publicly.

No build step, server, API key, analytics service or external JavaScript dependency is required. All links and assets are relative to the repository path. The website reads only the bundled display data.

## Files

- `index.html`, `styles.css`, `app.js`: overview, route selector, outcomes and evidence links.
- `assets/case-flow.svg`: compact display figure.
- `assets/case-data.json`: reviewed route quantities and selected transaction references.
- `full-flow.html`: read-only illustrated detail page with selected evidence records.

## Evidence scope

Holdings refer to the saved Ethereum collection cutoff, block **26,339,145**, rather than live balances. Token quantities are not USD valuations. The panels summarize selected, sometimes overlapping paths and must not be summed into a case total.

The 200m USDT route includes the earlier 10m USDT exchange, subsequent 100m USDT exchanges, 60m USDT collateral and 30m USDT retained. Borrowed ETH is included in ETH holdings; collateral and debt remain open. Bridge evidence is limited to source-chain activity. The SAND deposit label was manually confirmed by the investigator.

This case illustration is independent of the reported FlowShield and MixGuard evaluations. The complete tracing database, credentials and API configuration are not part of this repository.
