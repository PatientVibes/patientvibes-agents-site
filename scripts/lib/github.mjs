// Minimal anonymous GitHub REST client. 60 req/hr unauth — fine for one
// rebuild every few hours.

const BASE = 'https://api.github.com';
const HEADERS = {
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'patientvibes-agents-site-build',
};

// Auth boost: when GITHUB_TOKEN is set (e.g. in GitHub Actions, where
// secrets.GITHUB_TOKEN is auto-provided), use it. Bumps the rate limit
// from 60/hr unauth to 5000/hr authed — removes a CI flake vector.
if (process.env.GITHUB_TOKEN) {
  HEADERS['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} ${res.statusText} on ${path}`);
  }
  return res.json();
}

export async function fetchReadme(org, slug) {
  // Returns { content (base64), encoding, html_url, sha }
  return get(`/repos/${org}/${slug}/readme`);
}

export async function fetchLatestRelease(org, slug) {
  // Returns { tag_name, ... } or null on 404 (no releases yet)
  try {
    return await get(`/repos/${org}/${slug}/releases/latest`);
  } catch (err) {
    if (/404/.test(err.message)) return null;
    throw err;
  }
}

export async function fetchRepoMeta(org, slug) {
  return get(`/repos/${org}/${slug}`);
}

export async function fetchOrgRepos(owner) {
  // For manifest drift check. Returns array of repo objects.
  // PatientVibes is a USER account, not an org — /orgs/<owner>/repos 404s.
  // /users/<owner>/repos works for both user and org owners (GitHub's
  // user-repos endpoint silently includes the case where <owner> is an org),
  // so we use it unconditionally. We filter by visibility downstream.
  // Pagination: per_page=100 fits comfortably under the unauth 60/hr limit
  // for the modest repo counts under this owner.
  return get(`/users/${owner}/repos?per_page=100`);
}

export function decodeBase64(content) {
  return Buffer.from(content.replace(/\n/g, ''), 'base64').toString('utf-8');
}
