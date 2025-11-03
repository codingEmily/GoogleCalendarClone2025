import { useEffect, useState, type Dispatch, type SetStateAction } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (err) {
      console.error("useLocalStorage: failed to read", err)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (err) {
      console.error("useLocalStorage: failed to write", err)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
