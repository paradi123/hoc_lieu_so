import { useEffect, useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key)
    if (!stored) return initialValue

    try {
      const parsed = JSON.parse(stored) as T
      // Resync arrays (e.g. question bank) when initial length changes,
      // so updates to the bundled defaults propagate without manual cache clearing.
      if (
        Array.isArray(initialValue) &&
        Array.isArray(parsed) &&
        parsed.length !== initialValue.length
      ) {
        return initialValue
      }
      return parsed
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}