import { useEffect, useRef, useState } from "react"

export function useStudyMonitoring({
  enabled,
  hasStarted,
}: {
  enabled: boolean
  hasStarted: boolean
}) {
  const [violationCount, setViolationCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const violationLatched = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const recordViolation = () => {
      if (!hasStarted || violationLatched.current || isLocked) return
      violationLatched.current = true
      setViolationCount((current) => {
        const next = current + 1
        if (next >= 3) {
          setIsLocked(true)
          setShowWarning(false)
        } else {
          setShowWarning(true)
        }
        return next
      })
    }

    const handleVisibility = () => {
      if (document.hidden) recordViolation()
      else violationLatched.current = false
    }
    const handleBlur = () => {
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLIFrameElement) return
        recordViolation()
      }, 0)
    }
    const handleFocus = () => {
      if (!document.hidden) violationLatched.current = false
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
    }
  }, [enabled, hasStarted, isLocked])

  return {
    violationCount,
    showWarning,
    setShowWarning,
    isLocked,
  }
}
