# patientvibes-agents-site

Static site at [agents.patientvibes.io](https://agents.patientvibes.io) — the public catalog for the PatientVibes agent ecosystem (skills, tools, harnesses). Each entry's content is auto-pulled from its source repo's `README.md` at build time.

## Stack

- Astro 6 with content collections
- Tailwind 4 via `@tailwindcss/vite` plugin (CSS-first theme config)
- Cloudflare Pages hosting
- GitHub Actions: daily cron triggers Pages rebuild for README freshness

## Local dev

```bash
npm install
npm run pull-readmes   # one-time: fetches READMEs from GitHub into src/content/tools/
npm run dev
```

## Build

```bash
npm run build    # runs pull-readmes via prebuild, then astro build
```

## Source

See [the design spec](https://github.com/PatientVibes/ai-agents/blob/master/docs/superpowers/specs/2026-05-10-patientvibes-agents-site-design.md) and [implementation plan](https://github.com/PatientVibes/ai-agents/blob/master/docs/superpowers/plans/2026-05-10-patientvibes-agents-site.md) (in the private `ai-agents` catalog repo).
