import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const tools = await getCollection('tools');

  const projects = tools.map((t) => ({
    id: t.data.slug,
    kind: t.data.kind,
    name: t.data.name,
    status: t.data.status,
    last_run: t.data.pulledAt,
    summary: t.data.shortDescription,
    url: `https://agents.patientvibes.io/tools/${t.data.slug}/`,
    githubUrl: t.data.githubUrl,
  }));

  return new Response(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: projects.length,
        projects,
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // Cache 5 min at the edge so a README edit shows up the same day, not next week.
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
};
