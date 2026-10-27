import type { TextBlock as TextData } from '@/payload-types'

export function TextBlock({ heading, body }: TextData) {
  return (
    <section>
      {heading && <h2>{heading}</h2>}
      {body && <p style={{ whiteSpace: 'pre-wrap' }}>{body}</p>}
    </section>
  )
}
