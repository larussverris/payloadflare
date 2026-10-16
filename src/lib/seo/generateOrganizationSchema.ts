import type { Preference } from '@/payload-types'

export function generateOrganizationSchema(business: Preference['business'], siteURL: string) {
  if (!business?.name?.trim()) return null

  const name = business.name.trim()
  const url = new URL('/', siteURL).href
  const logo = business.logo
  const address = business.address
  const profiles = business.profiles?.map((profile) => profile.url.trim()).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name,
    url,
    ...(business.legalName && { legalName: business.legalName }),
    ...(business.description && { description: business.description }),
    ...(logo && typeof logo === 'object' && logo.url && {
      logo: new URL(logo.url, url).href,
    }),
    ...(business.email && { email: business.email }),
    ...(business.telephone && { telephone: business.telephone }),
    ...(address &&
      Object.values(address).some(Boolean) && {
        address: {
          '@type': 'PostalAddress',
          ...(address.streetAddress && { streetAddress: address.streetAddress }),
          ...(address.addressLocality && { addressLocality: address.addressLocality }),
          ...(address.postalCode && { postalCode: address.postalCode }),
          ...(address.addressCountry && { addressCountry: address.addressCountry }),
        },
      }),
    ...(profiles?.length && { sameAs: profiles }),
  }
}
