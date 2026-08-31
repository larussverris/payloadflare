const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')

const getLLMsText = () => {
  const baseUrl = siteUrl || 'http://localhost:3000'

  return `# Payloadflare

> A minimal Payload CMS and Next.js site deployed to Cloudflare Workers, with application data in D1 and uploaded media in R2.

## Site

- [Home](${baseUrl}/): The public website.
- [Sitemap](${baseUrl}/sitemap.xml): Canonical list of public pages.
- [Robots policy](${baseUrl}/robots.txt): Crawler access rules.

## Content

This starter includes authenticated Payload users, media uploads, and form-builder collections. Application-specific public collections and pages can be added as the site evolves.

Payload REST endpoints are available under \`${baseUrl}/api\` and GraphQL is available at \`${baseUrl}/api/graphql\`. API responses are subject to the access controls configured for each Payload collection; do not assume that an endpoint or document is public.

## Guidance

- Prefer the sitemap and linked public pages when discovering content.
- Do not use the Payload admin area as a content source.
- Respect robots.txt, authentication requirements, and collection access controls.
`
}

export function GET() {
  return new Response(getLLMsText(), {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=31536000',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
