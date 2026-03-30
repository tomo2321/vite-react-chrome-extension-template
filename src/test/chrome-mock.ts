import { vi } from "vitest";

/**
 * Minimal stub of the `chrome` extension API for use in tests.
 * Only the subset actually used by source files is implemented.
 * Functions are vi.fn() so tests can assert on calls and override return values.
 *
 * `storage.local.get` supports both callback-style (used in source) and
 * promise-style (used in tests via mockImplementation).
 */
export function installChromeMock(): void {
  const chromeMock = {
    runtime: {
      getURL: vi.fn(
        (path: string) => `chrome-extension://test-extension-id/${path}`,
      ),
      onInstalled: {
        addListener: vi.fn(),
      },
    },
    storage: {
      local: {
        get: vi.fn(
          (
            _keys: unknown,
            callback?: (result: Record<string, unknown>) => void,
          ) => {
            const result: Record<string, unknown> = {};
            if (typeof callback === "function") callback(result);
            return Promise.resolve(result);
          },
        ),
        set: vi.fn((_items: unknown) => Promise.resolve()),
      },
    },
    tabs: {
      create: vi.fn((_props: unknown) => Promise.resolve()),
      query: vi.fn((_info: unknown) => Promise.resolve([])),
    },
    devtools: {
      panels: {
        create: vi.fn(
          (
            _title: unknown,
            _icon: unknown,
            _page: unknown,
            callback?: (panel: unknown) => void,
          ) => {
            if (typeof callback === "function") callback({});
            return Promise.resolve({});
          },
        ),
      },
    },
  };

  Object.defineProperty(globalThis, "chrome", {
    value: chromeMock,
    writable: true,
    configurable: true,
  });
}
