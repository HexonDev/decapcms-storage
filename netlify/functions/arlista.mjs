const repository = 'HexonDev/decapcms-storage';
const path = 'src/data/arlista.json';

export default async function getPriceList() {
  const token = process.env.GITHUB_READ_TOKEN;
  if (!token) {
    return Response.json({ error: 'The GitHub read token is not configured.' }, { status: 503 });
  }

  const url = `https://api.github.com/repos/${repository}/contents/${path}?ref=main`;
  const upstream = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'astro-arlista-site',
    },
  });

  if (!upstream.ok) {
    console.error(`GitHub returned ${upstream.status} while reading the price list.`);
    return Response.json({ error: 'The GitHub price list could not be loaded.' }, { status: 502 });
  }

  const json = await upstream.text();
  try {
    JSON.parse(json);
  } catch {
    return Response.json({ error: 'The price-list JSON is invalid.' }, { status: 502 });
  }

  return new Response(json, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export const config = {
  path: '/api/arlista',
  method: 'GET',
};
