// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    kind: z.enum(['skill', 'tool', 'harness']),
    status: z.string(),                              // 'v0.2.2' | 'dev' | 'unavailable'
    githubUrl: z.string().url(),
    shortDescription: z.string(),
    pulledAt: z.string().datetime(),
    // optional site-only fields, merged from src/content/_overrides/<slug>.yml
    featuredScreenshot: z.string().optional(),
    tagline: z.string().optional(),
    skipReadmeSections: z.array(z.string()).optional(),
  }),
});

export const collections = { tools };
