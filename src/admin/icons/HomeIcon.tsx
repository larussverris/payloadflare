import type { SVGProps } from 'react'

export function HomeIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      data-fpl-icon-size="16"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M7.336 2.422a1 1 0 0 1 1.328 0l4 3.555-.332.374.332-.374a1 1 0 0 1 .336.747V12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9H7v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.725a1 1 0 0 1 .336-.748zM8 3.169 4 6.725V12h2V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h2V6.725z"
        clipRule="evenodd"
      />
    </svg>
  )
}
