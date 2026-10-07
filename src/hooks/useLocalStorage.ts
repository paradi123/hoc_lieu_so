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
      // Merge optional fields (e.g. image/imageAlt) added to defaults in newer builds
      // so existing localStorage entries pick them up without manual cache clearing.
      if (Array.isArray(initialValue) && Array.isArray(parsed)) {
        const defaults = initialValue as unknown as Array<Record<string, unknown>>
        const storedArr = parsed as unknown as Array<Record<string, unknown>>
        const merged = storedArr.map((item, index) => {
          const fresh = defaults[index]
          if (!fresh || typeof item !== "object" || item === null) return item
          const result: Record<string, unknown> = { ...item }
          for (const key of Object.keys(fresh)) {
            if (result[key] === undefined && fresh[key] !== undefined) {
              result[key] = fresh[key]
            }
          }
          return result
        })
        return merged as unknown as T
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