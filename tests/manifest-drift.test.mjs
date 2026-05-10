import { describe, it, expect, vi } from 'vitest';
import { findDrift } from '../scripts/check-manifest-drift.mjs';

describe('findDrift', () => {
  it('returns no drift when manifest matches public agent-* repos', () => {
    const manifest = [{ slug: 'agent-tool-a' }, { slug: 'agent-skills' }];
    const remote = [
      { name: 'agent-tool-a', visibility: 'public' },
      { name: 'agent-skills', visibility: 'public' },
      { name: 'chorus-forms', visibility: 'private' },          // ignored — not agent-*
      { name: 'chrispaulmoore-website', visibility: 'public' }, // ignored — not agent-*
    ];
    const result = findDrift(manifest, remote);
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual([]);
  });

  it('reports missing entries (public agent-* on GitHub but not in manifest)', () => {
    const manifest = [{ slug: 'agent-tool-a' }];
    const remote = [
      { name: 'agent-tool-a', visibility: 'public' },
      { name: 'agent-tool-b', visibility: 'public' },
    ];
    expect(findDrift(manifest, remote).missing).toEqual(['agent-tool-b']);
  });

  it('reports extra entries (in manifest but not public on GitHub)', () => {
    const manifest = [{ slug: 'agent-tool-a' }, { slug: 'agent-tool-deleted' }];
    const remote = [{ name: 'agent-tool-a', visibility: 'public' }];
    expect(findDrift(manifest, remote).extra).toEqual(['agent-tool-deleted']);
  });

  it('ignores private agent-* repos', () => {
    const manifest = [{ slug: 'agent-tool-a' }];
    const remote = [
      { name: 'agent-tool-a', visibility: 'public' },
      { name: 'agent-tool-private', visibility: 'private' },
    ];
    const result = findDrift(manifest, remote);
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual([]);
  });
});
