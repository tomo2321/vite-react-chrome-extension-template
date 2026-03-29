# Storage

`chrome.storage` is the recommended way to persist data in a Chrome extension. Unlike
`localStorage`, it is accessible from **all extension contexts** (background, content scripts,
extension pages) and survives the background service worker being terminated.

## `local` vs `sync`

| Area                  | `chrome.storage.local`           | `chrome.storage.sync`                   |
| --------------------- | -------------------------------- | --------------------------------------- |
| Quota                 | 10 MB                            | 100 KB (8 KB per item)                  |
| Synced across devices | No                               | Yes (requires the user to be signed in) |
| Best for              | Large data, caches, binary blobs | Small user preferences                  |

Use `storage` permission in `src/manifest.ts` (already enabled when `features.options` is `true`).

> **Note:** The `storage` permission is included automatically only when `features.options` is
> `true`. If you disable `features.options` but still need `chrome.storage` elsewhere (e.g. in
> a background script or content script), add `"storage"` to the `permissions` array manually.

## Reading and Writing

### Write

```ts
await chrome.storage.local.set({ theme: "dark", count: 42 });
```

### Read

```ts
const result = await chrome.storage.local.get(["theme", "count"]);
console.log(result.theme); // "dark"
console.log(result.count); // 42
```

### Remove

```ts
await chrome.storage.local.remove("count");
```

### Clear all

```ts
await chrome.storage.local.clear();
```

## React Hook Example

A simple hook for reading and writing a single storage key with live updates:

```ts
// src/shared/hooks/useStorage.ts
import { useCallback, useEffect, useState } from "react";

export function useStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    (async () => {
      const result = await chrome.storage.local.get(key);
      if (result[key] !== undefined) setValue(result[key] as T);
    })();

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
    ) => {
      if (key in changes) setValue(changes[key].newValue as T);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key]);

  const set = useCallback(
    async (newValue: T) => {
      await chrome.storage.local.set({ [key]: newValue });
      setValue(newValue);
    },
    [key],
  );

  return [value, set];
}
```

Usage:

```tsx
const [theme, setTheme] = useStorage("theme", "light");
```

## Listening for Changes

Any context can react to storage changes made by another context:

```ts
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "theme" in changes) {
    console.log("theme changed to", changes.theme.newValue);
  }
});
```

This is useful for keeping the UI in sync when the background or another page modifies storage.
