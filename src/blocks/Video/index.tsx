import type { VideoBlock as VideoBlockProps } from '@/payload-types'

export function VideoBlock({ video, caption, captions, captionsLanguage }: VideoBlockProps) {
  if (!video || typeof video !== 'object' || !video.url) return null

  const captionsURL =
    captions && typeof captions === 'object' ? captions.url || undefined : undefined

  return (
    <figure>
      <video controls playsInline preload="metadata" aria-label={video.alt}>
        <source src={video.url} type={video.mimeType || undefined} />
        {captionsURL && (
          <track kind="captions" src={captionsURL} srcLang={captionsLanguage || 'en'} default />
        )}
        Your browser does not support video playback. <a href={video.url}>Download the video</a>.
      </video>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
