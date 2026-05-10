#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

import { ORG, REPOS } from './lib/manifest.mjs';
import { fetchOrgRepos } from './lib/github.mjs';

export function findDrift(manifest, remoteRepos) {
  const remoteAgents = remoteRepos
    .filter((r) => r.visibility === 'public' && r.name.startsWith('agent-'))
    .map((r) => r.name);
  const manifestSlugs = manifest.map((m) => m.slug);

  const missing = remoteAgents.filter((name) => !manifestSlugs.includes(name));
  const extra = manifestSlugs.filter((slug) => !remoteAgents.includes(slug));

  return { missing, extra };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const remote = await fetchOrgRepos(ORG);
  const { missing, extra } = findDrift(REPOS, remote);

  if (missing.length === 0 && extra.length === 0) {
    console.log('[manifest-drift] no drift — manifest matches public agent-* repos.');
    process.exit(0);
  }

  if (missing.length > 0) {
    console.error(`[manifest-drift] MISSING from manifest (public agent-* on GitHub but not listed):`);
    for (const slug of missing) console.error(`  - ${slug}`);
    console.error(`  → add them to scripts/lib/manifest.mjs`);
  }

  if (extra.length > 0) {
    console.error(`[manifest-drift] EXTRA in manifest (listed but not a public agent-* repo):`);
    for (const slug of extra) console.error(`  - ${slug}`);
    console.error(`  → remove them or check the repo's visibility`);
  }

  process.exit(1);
}
