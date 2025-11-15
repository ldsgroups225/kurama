import { atom } from 'jotai'
import { atomWithLocalStorageBooleanStorage } from './atomWithLocalStorage'

export function atomWithToggleAndStorage(key: string, initialValue: boolean) {
  const anAtom = atomWithLocalStorageBooleanStorage(key, initialValue)
  const derivedAtom = atom(
    get => get(anAtom),
    (get, set, nextValue?: boolean) => {
      const update = nextValue ?? !get(anAtom)
      set(anAtom, update)
    },
  )
  return derivedAtom
}
