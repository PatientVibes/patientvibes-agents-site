import { describe, it, expect } from 'vitest';
import { extractShortDescription } from '../scripts/lib/extract-short-description.mjs';

describe('extractShortDescription', () => {
  it('returns the first paragraph after the h1', () => {
    const md = '# my-tool\n\nA helpful tool that does things.\n\n## Install\n\nstuff';
    expect(extractShortDescription(md)).toBe('A helpful tool that does things.');
  });

  it('handles an h1 immediately followed by an h2 (no para)', () => {
    const md = '# my-tool\n\n## Install\n\nstuff';
    expect(extractShortDescription(md)).toBe('');
  });

  it('handles missing h1', () => {
    const md = 'No header here.\n\nJust text.';
    expect(extractShortDescription(md)).toBe('');
  });

  it('joins multi-line paragraphs into one space-separated string', () => {
    const md = '# x\n\nLine one\nLine two.\n\nNext para';
    expect(extractShortDescription(md)).toBe('Line one Line two.');
  });

  it('strips leading/trailing whitespace', () => {
    const md = '#   x   \n\n   Trim me.   \n\n## Next';
    expect(extractShortDescription(md)).toBe('Trim me.');
  });
});
