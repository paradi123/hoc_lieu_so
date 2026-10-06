import type React from "react"

export type IconName = "atom" | "book" | "video" | "flask" | "quiz" | "arrow" | "check" | "close" | "external" | "spark" | "pencil"

export default function Icon({
  name,
  size = 20,
}: {
  name: IconName
  size?: number
}) {
  const paths: Record<IconName, React.ReactNode> = {
    atom: (
      <>
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.8"
          transform="rotate(120 12 12)"
        />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3z" />
      </>
    ),
    flask: (
      <path d="M9 3h6m-5 0v5.5L4.7 18a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3L14 8.5V3M8 14h8" />
    ),
    quiz: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M15 9h2M15 15h2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    external: (
      <path d="M14 4h6v6m0-6-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    ),
    spark: (
      <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8zM18.5 15l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
    ),
    pencil: (
      <>
        <path d="M4 20h4l10.5-10.5a2.5 2.5 0 0 0 0-3.5l-1-1a2.5 2.5 0 0 0-3.5 0L4 15.5z" />
        <path d="M13.5 7.5 16 10" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}
export { Icon }
