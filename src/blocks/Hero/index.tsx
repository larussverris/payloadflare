import type { Page } from '@/payload-types'

type HeroData = Extract<NonNullable<Page['layout']>[number], { blockType: 'hero' }>

export function HeroBlock({ heading, subheading }: HeroData) {
  return (
    <section>
      <h1>{heading}</h1>
      {subheading && <p>{subheading}</p>}
    </section>
  )
}
