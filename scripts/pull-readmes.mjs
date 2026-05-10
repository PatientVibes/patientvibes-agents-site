#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ORG, REPOS } from './lib/manifest.mjs';
import { fetchReadme, fetchLatestRelease, fetchRepoMeta, decodeBase64 } from './lib/github.mjs';
import { extractShortDescription } from './lib/extract-short-description.mjs';
import { rewriteRelativeLinks } from './lib/rewrite-relative-links.mjs';
import { writeToolMd } from './lib/write-tool-md.mjs';

async function pullOneRemote(repoRoot, repo, org) {
  const [readmeRes, releaseRes, metaRes] = await Promise.all([
    fetchReadme(org, repo.slug),
    fetchLatestRelease(org, repo.slug),
    fetchRepoMeta(org, repo.slug),
  ]);

  const md = decodeBase64(readmeRes.content);
  const status = releaseRes?.tag_name || 'dev';
  const githubUrl = metaRes.html_url;
  const repoDescription = metaRes.description || '';

  const description = extractShortDescription(md) || repoDescription || repo.name;
  const rewrittenBody = rewriteRelativeLinks(md, { org, slug: repo.slug, branch: 'main' });

  const frontmatter = {
    slug: repo.slug,
    name: repo.name,
    kind: repo.kind,
    status,
    githubUrl,
    shortDescription: description,
    pulledAt: new Date().toISOString(),
  };

  await writeToolMd(repoRoot, repo.slug, frontmatter, rewrittenBody);
}

async function pullOneFixture(repoRoot, repo, org, fixtureDir) {
  const fixturePath = path.resolve(fixtureDir, `${repo.slug}.md`);
  const md = await readFile(fixturePath, 'utf-8');

  const description = extractShortDescription(md) || repo.name;
  const rewrittenBody = rewriteRelativeLinks(md, { org, slug: repo.slug, branch: 'main' });

  const frontmatter = {
    slug: repo.slug,
    name: repo.name,
    kind: repo.kind,
    status: 'fixture',
    githubUrl: `https://github.com/${org}/${repo.slug}`,
    shortDescription: description,
    pulledAt: new Date().toISOString(),
  };

  await writeToolMd(repoRoot, repo.slug, frontmatter, rewrittenBody);
}

async function pullStub(repoRoot, repo, org, reason) {
  const frontmatter = {
    slug: repo.slug,
    name: repo.name,
    kind: repo.kind,
    status: 'unavailable',
    githubUrl: `https://github.com/${org}/${repo.slug}`,
    shortDescription: '(latest README could not be fetched; see GitHub for current docs)',
    pulledAt: new Date().toISOString(),
  };
  await writeToolMd(repoRoot, repo.slug, frontmatter, '');
  console.warn(`[pull-readmes] ${repo.slug}: STUB (${reason})`);
}

export async function pullAll({ repoRoot, repos = REPOS, org = ORG, fixtureDir = null } = {}) {
  let succeeded = 0;
  let failed = 0;

  for (const repo of repos) {
    try {
      if (fixtureDir) {
        await pullOneFixture(repoRoot, repo, org, fixtureDir);
      } else {
        await pullOneRemote(repoRoot, repo, org);
      }
      succeeded++;
      console.log(`[pull-readmes] ${repo.slug}: OK${fixtureDir ? ' (fixture)' : ''}`);
    } catch (err) {
      failed++;
      await pullStub(repoRoot, repo, org, err.message).catch(() => {});
    }
  }

  if (failed > repos.length / 2) {
    throw new Error(`More than half of repos failed (${failed}/${repos.length}). Aborting build to keep last good deploy live.`);
  }

  return { succeeded, failed, total: repos.length };
}

// CLI entry — supports READMES_FIXTURE_DIR env var for CI smoke builds
// Use pathToFileURL for cross-platform comparison (Windows paths need file:///D:/... form).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const fixtureDir = process.env.READMES_FIXTURE_DIR
    ? path.resolve(repoRoot, process.env.READMES_FIXTURE_DIR)
    : null;

  // In fixture mode, restrict the manifest to entries that actually have fixture files
  let repos = REPOS;
  if (fixtureDir) {
    const fs = await import('node:fs/promises');
    const filtered = [];
    for (const r of REPOS) {
      try {
        await fs.access(path.join(fixtureDir, `${r.slug}.md`));
        filtered.push(r);
      } catch { /* no fixture for this slug — skip */ }
    }
    repos = filtered;
    console.log(`[pull-readmes] FIXTURE MODE: ${fixtureDir} (${repos.length} of ${REPOS.length} repos have fixtures)`);
  }

  pullAll({ repoRoot, repos, fixtureDir })
    .then((s) => {
      console.log(`[pull-readmes] DONE: ${s.succeeded}/${s.total} succeeded, ${s.failed} stubbed.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[pull-readmes] FAILED: ${err.message}`);
      process.exit(1);
    });
}
