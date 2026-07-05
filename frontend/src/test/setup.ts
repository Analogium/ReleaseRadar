import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Signale à React qu'on est dans un environnement de test (silence les warnings act()).
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Démonte le DOM rendu entre chaque test.
afterEach(() => {
  cleanup()
})
