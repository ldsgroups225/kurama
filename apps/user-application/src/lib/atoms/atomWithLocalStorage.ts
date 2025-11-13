import { atomWithStorage } from "jotai/utils";

const defaultOpts = { getOnInit: true };

// Check if we're on the client side
const isClient = typeof window !== "undefined";

export const atomWithLocalStorageBooleanStorage = (
  key: string,
  initialValue: boolean
) =>
  atomWithStorage(
    key,
    initialValue,
    {
      getItem(key, initialValue: boolean) {
        if (!isClient) return initialValue;
        const item = localStorage.getItem(key);
        if (item === null) return initialValue;
        return item === "true";
      },
      setItem: (key, newValue) => {
        if (!isClient) return;
        localStorage.setItem(key, String(newValue));
      },
      removeItem: (key) => {
        if (!isClient) return;
        localStorage.removeItem(key);
      },
    },
    defaultOpts
  );

export const atomWithLocalStorageStringStorage = (
  key: string,
  initialValue: string
) =>
  atomWithStorage(
    key,
    initialValue,
    {
      getItem(key, initialValue: string) {
        if (!isClient) return initialValue;
        return localStorage.getItem(key) ?? initialValue;
      },
      setItem: (key, newValue) => {
        if (!isClient) return;
        localStorage.setItem(key, newValue);
      },
      removeItem: (key) => {
        if (!isClient) return;
        localStorage.removeItem(key);
      },
    },
    defaultOpts
  );
