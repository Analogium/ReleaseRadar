import { useEffect, useState } from 'react'

/** Renvoie `value` avec un délai, pour éviter de déclencher une requête à chaque frappe. */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
