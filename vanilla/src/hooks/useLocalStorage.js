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
  /// MY THOUGHTS- how does this run on storedValue being changed,
  // because (a) storedValue is the value of a RETRIEVED item, so how does retrieving an item
  //lead to storing an item?
  // also (b) useLocalStorage does not have a param/prop for receiving
  // new data (I guess useLocalStorage is implemented ONCE per SET of data -ex. ArrayOfEvents-
  // and once it's implemented once everything else happens automatically?)

  // --- 3. Return same interface as useState --- // reasonable but I can't picture the implementation rn
  return [storedValue, setStoredValue]
}
