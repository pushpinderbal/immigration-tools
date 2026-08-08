# ImmiCalc

Canadian immigration points calculator web-app. Runs client-side.

## Features

- Runs entirely in the browser. No account, no server, nothing stored or tracked.
- Live Express Entry draws feed, pulled from IRCC's published data.
- Score-improvement tips on the CRS page, computed from your actual inputs.

## Getting started

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

`npm run build` runs typecheck plus the production build.

## Project structure

Each calculator is a pure scoring module in `src/lib/<province>/score.ts` with a `score()` function and an `eligibility()` function, plus a tool page in `src/routes/<province>/`. Shared UI such as the score sidebar, eligibility banner, and map lives in `src/components/`.

## Disclaimers

Not affiliated with any government agency. Immigration rules change often. These are estimates for planning, not legal advice. Confirm anything important against the official IRCC or provincial pages.

## License

MIT. See [LICENSE](LICENSE).
