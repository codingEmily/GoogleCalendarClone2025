// -------------------- hooks/useLocalStorage.js --------------------
// A pure, reusable synchronization hook for localStorage-backed state.
// Keeps logic generic so it can persist *any* data type, not just events.

import { useEffect, useState } from "react"

export function useLocalStorage(key, initialValue) {
  // --- 1. Initialize from localStorage if available ---
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (err) {
      console.error("useLocalStorage: failed to read", err)
      return initialValue
    }
  })

  // --- 2. Write to localStorage whenever state changes ---
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (err) {
      console.error("useLocalStorage: failed to write", err)
    }
  }, [key, storedValue])

  // --- 3. Return same interface as useState ---
  return [storedValue, setStoredValue]
}
