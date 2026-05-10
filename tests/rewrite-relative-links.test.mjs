import { describe, it, expect } from 'vitest';
import { rewriteRelativeLinks } from '../scripts/lib/rewrite-relative-links.mjs';

const ctx = { org: 'PatientVibes', slug: 'agent-tool-x', branch: 'main' };
const base = 'https://github.com/PatientVibes/agent-tool-x/blob/main';

describe('rewriteRelativeLinks', () => {
  it('rewrites `./CONTRIBUTING.md` to absolute github URL', () => {
    const out = rewriteRelativeLinks('See [contrib](./CONTRIBUTING.md).', ctx);
    expect(out).toBe(`See [contrib](${base}/CONTRIBUTING.md).`);
  });

  it('rewrites `docs/foo.md` (no leading ./) to absolute', () => {
    const out = rewriteRelativeLinks('See [docs](docs/foo.md).', ctx);
    expect(out).toBe(`See [docs](${base}/docs/foo.md).`);
  });

  it('does not rewrite absolute http/https URLs', () => {
    const md = 'See [google](https://google.com) and [http](http://example.com).';
    expect(rewriteRelativeLinks(md, ctx)).toBe(md);
  });

  it('does not rewrite mailto: or anchor-only links', () => {
    const md = 'Email [me](mailto:x@y.com) or jump to [top](#top).';
    expect(rewriteRelativeLinks(md, ctx)).toBe(md);
  });

  it('does not rewrite `../` parent-relative links (out of scope; leave alone)', () => {
    const md = 'See [up](../CHANGELOG.md).';
    // Parent-relative paths are ambiguous (which repo?). Leave as-is.
    expect(rewriteRelativeLinks(md, ctx)).toBe(md);
  });

  it('rewrites image links with same rules', () => {
    const out = rewriteRelativeLinks('![diagram](./docs/img.png)', ctx);
    expect(out).toBe(`![diagram](${base}/docs/img.png)`);
  });
});
