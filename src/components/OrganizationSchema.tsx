import 'server-only'
import { getPreferences } from '@/utilities/getPreferences'
import config from '@payload-config'

export async function OrganizationSchema() {
  const { serverURL } = await config
  const { business } = await getPreferences()
  const url = new URL('/', serverURL).href
  const logo = business?.logo
  const address = business?.address
  const profiles = business?.profiles?.map((profile) => profile.url.trim()).filter(Boolean)
  const organization = business?.name?.trim()
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${url}#organization`,
        name: business.name.trim(),
        url,
        ...(business.legalName && { legalName: business.legalName }),
        ...(business.description && { description: business.description }),
        ...(logo &&
          typeof logo === 'object' &&
          logo.url && {
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
    : null

  if (!organization) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organization).replace(/</g, '\\u003c'),
      }}
    />
  )
}
