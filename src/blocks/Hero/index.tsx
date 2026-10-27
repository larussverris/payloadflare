import type { HeroBlock as HeroData } from '@/payload-types'

export function HeroBlock({ heading, subheading }: HeroData) {
  return (
    <section>
      <h1>{heading}</h1>
      {subheading && <p>{subheading}</p>}
    </section>
  )
}
