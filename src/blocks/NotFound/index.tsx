import type { Page } from '@/payload-types'

type NotFoundData = Extract<NonNullable<Page['layout']>[number], { blockType: 'notFound' }>

export function NotFoundBlock({ heading, message }: NotFoundData) {
  return (
    <section>
      <h1>{heading}</h1>
      {message && <p>{message}</p>}
    </section>
  )
}
