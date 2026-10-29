# ImmiCalc

Calculate your Express Entry and PNP scores in the browser.

## Features

- Everything runs in your browser: no account or server needed.
- Live Draw Feed: Express Entry draw results pulled straight from IRCC's published data.
- No trackers or data collection: nothing is stored or tracked.
- Federal and provincial calculators: CRS plus selected worker grids for OINP, BC PNP, SINP, AAIP and MPNP.
- CRS includes the pre-November 3, 2026 rules and the announced high-wage Labour Market Integration factor, with automatic date-based defaults.
- Program coverage and official guides for all provinces and territories, including programs without a calculator.

Scoring sources, effective dates, coverage gaps and unresolved source ambiguities are recorded in [the October 28, 2026 audit](docs/scoring-audit-2026-10-28.md).

## Getting started

```sh
bun install
bun run dev
bun run test
bun run typecheck
bun run build
```

`bun run build` runs typecheck plus the production build.

## Disclaimers

Not affiliated with any government agency. Immigration rules change often. These are estimates for planning, not legal advice. Confirm anything important against the official IRCC or provincial pages.

## License

MIT. See [LICENSE](LICENSE).
