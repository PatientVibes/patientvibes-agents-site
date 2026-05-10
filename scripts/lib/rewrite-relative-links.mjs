// Rewrites markdown link/image targets that are relative paths into absolute
// GitHub URLs. Leaves http/https/mailto/anchor/parent-relative links alone.
//
// Supported input forms:
//   [text](./path/to/file.md)
//   [text](path/to/file.md)
//   ![alt](./img.png)
//
// Output:
//   [text](https://github.com/<org>/<slug>/blob/<branch>/path/to/file.md)
//
// Limitations: doesn't touch reference-style links (`[x][1]` ... `[1]: path`).
// READMEs in the catalog use inline links overwhelmingly.

const LINK_RE = /(!?\[[^\]]*\])\(([^)]+)\)/g;

export function rewriteRelativeLinks(markdown, { org, slug, branch = 'main' }) {
  const base = `https://github.com/${org}/${slug}/blob/${branch}`;
  return markdown.replace(LINK_RE, (whole, label, target) => {
    if (/^(https?:|mailto:|tel:|#|\/\/)/i.test(target)) return whole;
    if (target.startsWith('../')) return whole;             // ambiguous; leave
    if (target.startsWith('/')) return whole;               // absolute path; leave
    const cleaned = target.startsWith('./') ? target.slice(2) : target;
    return `${label}(${base}/${cleaned})`;
  });
}
