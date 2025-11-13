import { atomWithLocalStorageBooleanStorage } from "./atomWithLocalStorage";
import { atom } from "jotai";

export function atomWithToggleAndStorage(key: string, initialValue: boolean) {
  const anAtom = atomWithLocalStorageBooleanStorage(key, initialValue);
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, nextValue?: boolean) => {
      const update = nextValue ?? !get(anAtom);
      set(anAtom, update);
    }
  );
  return derivedAtom;
}
