import { writeFile, mkdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';

// Writes src/content/tools/<slug>.md with YAML frontmatter + body.
// Merges in src/content/_overrides/<slug>.yml if present.
export async function writeToolMd(repoRoot, slug, frontmatter, body) {
  const outDir = path.join(repoRoot, 'src/content/tools');
  await mkdir(outDir, { recursive: true });

  // Merge override file if present
  const overridePath = path.join(repoRoot, 'src/content/_overrides', `${slug}.yml`);
  let merged = { ...frontmatter };
  try {
    await access(overridePath);
    const overrideText = await readFile(overridePath, 'utf-8');
    const override = yaml.load(overrideText) || {};
    merged = { ...merged, ...override };
  } catch {
    // No override file — fine.
  }

  const fileContent = matter.stringify(body, merged);
  const outPath = path.join(outDir, `${slug}.md`);
  await writeFile(outPath, fileContent, 'utf-8');
  return outPath;
}
