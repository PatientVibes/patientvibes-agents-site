// scripts/lib/manifest.mjs
// Single source of truth for what's in the catalog.
// Adding a new public agent-* repo on GitHub requires adding it here too;
// the manifest-drift check (Phase 4) fails CI until you do.

export const ORG = 'PatientVibes';

export const REPOS = [
  { slug: 'agent-skills',                   kind: 'skill',   name: 'pr-review-tools' },
  { slug: 'agent-tool-pr-reviewer',         kind: 'tool',    name: 'agent-tool-pr-reviewer' },
  { slug: 'agent-tool-pdf-builder',         kind: 'tool',    name: 'agent-tool-pdf-builder' },
  { slug: 'agent-tool-marker-cleanup',      kind: 'tool',    name: 'agent-tool-marker-cleanup' },
  { slug: 'agent-tool-figure-scanner',      kind: 'tool',    name: 'agent-tool-figure-scanner' },
  { slug: 'agent-tool-prose-quality',       kind: 'tool',    name: 'agent-tool-prose-quality' },
  { slug: 'agent-tool-scrape-sources',      kind: 'tool',    name: 'agent-tool-scrape-sources' },
  { slug: 'agent-tool-llm-proofreader',     kind: 'tool',    name: 'agent-tool-llm-proofreader' },
  { slug: 'agent-tool-book-builder',        kind: 'tool',    name: 'agent-tool-book-builder' },
  { slug: 'agent-harness-kindle-pipeline',  kind: 'harness', name: 'agent-harness-kindle-pipeline' },
];

export const KINDS = ['skill', 'tool', 'harness'];
