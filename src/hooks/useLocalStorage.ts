"use client"

import { useState } from "react"

export function useLocalStorage(key: string, initialValue: string | null = null) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? item : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  // Función para establecer el valor
  const setValue = (value: string | null) => {
    try {
      setStoredValue(value)
      if (typeof window !== "undefined") {
        if (value === null) {
          window.localStorage.removeItem(key)
        } else {
          window.localStorage.setItem(key, value)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
