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

// /// **********************************************************************************************************************

// import { useEffect, useState } from "react"

// export function useLocalStorage(props: { key: string; initialValue: object }) {
//   const [storedValue, setStoredValue] = useState(() => {
//     try {
//       const item = localStorage.getItem(props.key)
//       return item ? JSON.parse(item) : props.initialValue
//     } catch (err) {
//       console.error("useLocalStorage: failed to read", err)
//       return props.initialValue
//     }
//   })

//   useEffect(() => {
//     try {
//       localStorage.setItem(props.key, JSON.stringify(storedValue))
//     } catch (err) {
//       console.error("useLocalStorage: failed to write", err)
//     }
//   }, [props.key, storedValue])
//   return [storedValue, setStoredValue]
// }
/// **********************************************************************************************************************
/// MY THOUGHTS- how does this run on storedValue being changed,
// because (a) storedValue is the value of a RETRIEVED item, so how does retrieving an item
//lead to storing an item?
// also (b) useLocalStorage does not have a param/prop for receiving
// new data (I guess useLocalStorage is implemented ONCE per SET of data -ex. ArrayOfEvents-
// and once it's implemented once everything else happens automatically?)

// --- 3. Return same interface as useState --- // reasonable but I can't picture the implementation rn
