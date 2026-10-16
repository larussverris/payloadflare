import type { Page } from '@/payload-types'

type TextData = Extract<NonNullable<Page['layout']>[number], { blockType: 'text' }>

export function TextBlock({ heading, body }: TextData) {
  return (
    <section>
      {heading && <h2>{heading}</h2>}
      {body && <p style={{ whiteSpace: 'pre-wrap' }}>{body}</p>}
    </section>
  )
}
