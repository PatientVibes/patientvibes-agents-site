import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';

import { pullAll } from '../scripts/pull-readmes.mjs';

const FIXTURES = path.resolve('__fixtures__/readmes');

// Stub fetch responses keyed by URL fragment
function stubFetch({ readmes = {}, releases = {}, repos = {} }) {
  return vi.fn(async (url) => {
    if (url.includes('/readme')) {
      const slug = url.match(/\/repos\/PatientVibes\/([^/]+)\/readme/)[1];
      if (!(slug in readmes)) return new Response('not found', { status: 404 });
      const md = await readFile(path.join(FIXTURES, `${slug}.md`), 'utf-8');
      return new Response(JSON.stringify({
        content: Buffer.from(md).toString('base64'),
        encoding: 'base64',
        html_url: `https://github.com/PatientVibes/${slug}/blob/main/README.md`,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/releases/latest')) {
      const slug = url.match(/\/repos\/PatientVibes\/([^/]+)\/releases\/latest/)[1];
      if (!(slug in releases)) return new Response('no releases', { status: 404 });
      return new Response(JSON.stringify({ tag_name: releases[slug] }), { status: 200 });
    }
    if (url.match(/\/repos\/PatientVibes\/[^/]+$/)) {
      const slug = url.match(/\/repos\/PatientVibes\/([^/]+)$/)[1];
      const meta = repos[slug] || { html_url: `https://github.com/PatientVibes/${slug}`, description: '' };
      return new Response(JSON.stringify(meta), { status: 200 });
    }
    return new Response('unmatched', { status: 500 });
  });
}

describe('pullAll', () => {
  let tmpRoot;
  let originalFetch;

  beforeEach(async () => {
    tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'pull-readmes-'));
    await mkdir(path.join(tmpRoot, 'src/content/tools'), { recursive: true });
    await mkdir(path.join(tmpRoot, 'src/content/_overrides'), { recursive: true });
    originalFetch = globalThis.fetch;
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    await rm(tmpRoot, { recursive: true, force: true });
  });

  it('writes a .md file per repo with valid frontmatter', async () => {
    globalThis.fetch = stubFetch({
      readmes: { 'agent-skills': true, 'agent-tool-pr-reviewer': true, 'agent-harness-kindle-pipeline': true },
      releases: { 'agent-tool-pr-reviewer': 'v0.2.2' },
    });

    // Override the manifest to just the 3 fixtures
    const overrideRepos = [
      { slug: 'agent-skills',                  kind: 'skill',   name: 'pr-review-tools' },
      { slug: 'agent-tool-pr-reviewer',        kind: 'tool',    name: 'agent-tool-pr-reviewer' },
      { slug: 'agent-harness-kindle-pipeline', kind: 'harness', name: 'agent-harness-kindle-pipeline' },
    ];
    const summary = await pullAll({ repoRoot: tmpRoot, repos: overrideRepos });

    expect(summary.succeeded).toBe(3);
    expect(summary.failed).toBe(0);

    const prContent = await readFile(path.join(tmpRoot, 'src/content/tools/agent-tool-pr-reviewer.md'), 'utf-8');
    const { data, content } = matter(prContent);
    expect(data.slug).toBe('agent-tool-pr-reviewer');
    expect(data.kind).toBe('tool');
    expect(data.status).toBe('v0.2.2');
    expect(data.shortDescription).toContain('CLI producing');
    expect(content).toContain('# agent-tool-pr-reviewer');
    expect(content).toContain('https://github.com/PatientVibes/agent-tool-pr-reviewer/blob/main/docs/MODELS.md');
  });

  it('writes a placeholder stub when fetch fails for a single repo', async () => {
    globalThis.fetch = stubFetch({
      readmes: { 'agent-skills': true },                    // pr-reviewer fails (404)
    });

    const overrideRepos = [
      { slug: 'agent-skills',           kind: 'skill', name: 'pr-review-tools' },
      { slug: 'agent-tool-pr-reviewer', kind: 'tool',  name: 'agent-tool-pr-reviewer' },
    ];
    const summary = await pullAll({ repoRoot: tmpRoot, repos: overrideRepos });

    expect(summary.succeeded).toBe(1);
    expect(summary.failed).toBe(1);

    const prContent = await readFile(path.join(tmpRoot, 'src/content/tools/agent-tool-pr-reviewer.md'), 'utf-8');
    const { data, content } = matter(prContent);
    expect(data.status).toBe('unavailable');
    expect(data.shortDescription).toMatch(/could not be fetched/);
    expect(content.trim()).toBe('');
  });

  it('throws when more than half the repos fail', async () => {
    globalThis.fetch = stubFetch({ readmes: {} });           // all fail

    const overrideRepos = [
      { slug: 'a', kind: 'tool', name: 'a' },
      { slug: 'b', kind: 'tool', name: 'b' },
      { slug: 'c', kind: 'tool', name: 'c' },
    ];
    await expect(pullAll({ repoRoot: tmpRoot, repos: overrideRepos })).rejects.toThrow(/more than half/i);
  });
});
