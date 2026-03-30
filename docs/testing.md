# Testing

## Commands

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `pnpm test`           | Run all tests (unit + Storybook browser)       |
| `pnpm test:watch`     | Run unit tests in watch mode                   |
| `pnpm test:coverage`  | Run unit tests with v8 coverage report         |
| `pnpm test:storybook` | Run Storybook story tests only (real Chromium) |

## Unit and Component Tests

- Framework: **Vitest** with **jsdom** environment
- Test renderer: **@testing-library/react** with **@testing-library/user-event**
- Matches: `src/**/*.{test,spec}.{ts,tsx}`
- Setup file: `src/test/setup.ts` — installs jest-dom matchers and the `chrome.*` API mock

Every component directory follows the pattern:

```text
src/pages/<page>/
  App.tsx
  App.test.tsx           # behaviour tests
  App.snapshot.test.tsx  # snapshot test
```

## Chrome API Mock

`src/test/chrome-mock.ts` installs a minimal `chrome.*` stub on `globalThis` before any tests
run. All stubs are `vi.fn()`, so tests can assert on calls and override return values.

`vi.resetAllMocks()` is called automatically before each test (in `src/test/setup.ts`), which
clears call history **and** any custom implementations. Set up mock behaviour in `beforeEach`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("MyComponent", () => {
  beforeEach(() => {
    vi.mocked(chrome.storage.local.get).mockImplementation(
      (_keys, callback) => {
        if (typeof callback === "function") callback({ my_key: 42 });
        return Promise.resolve({ my_key: 42 });
      },
    );
  });

  it("loads value from storage", async () => {
    // ...
  });

  it("persists value on change", async () => {
    // ...
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ my_key: 1 });
  });
});
```

Available mock APIs (see `src/test/chrome-mock.ts` for the full list):

- `chrome.runtime.getURL(path)` — returns `chrome-extension://test-extension-id/<path>`
- `chrome.runtime.onInstalled.addListener`
- `chrome.storage.local.get` / `chrome.storage.local.set`
- `chrome.tabs.create` / `chrome.tabs.query`
- `chrome.devtools.panels.create`

If your code calls a `chrome.*` API not in the mock, add a `vi.fn()` stub to
`src/test/chrome-mock.ts`.

## Snapshot Tests

Each component has a co-located `App.snapshot.test.tsx` that asserts on the rendered HTML
fragment. Snapshots live in `__snapshots__/` next to the test file.

After an **intentional** UI change, update snapshots:

```bash
pnpm vitest run -u --project=unit
```

Review the diff in `__snapshots__/` before committing to confirm only expected markup changed.

## Storybook Story Tests

Every component also has a `*.stories.tsx` file. Storybook runs each story as a browser test
in headless Chromium via Playwright:

- The `Default` export is smoke-tested automatically (renders without throwing)
- Stories with a `play` function are run as interaction tests

Run story tests in isolation:

```bash
pnpm test:storybook
```

When adding a new component, create a `*.stories.tsx` alongside it.

## Coverage

```bash
pnpm test:coverage   # writes reports to coverage/
```

| File                             | Contents                         |
| -------------------------------- | -------------------------------- |
| `coverage/coverage-summary.json` | Machine-readable totals per file |
| `coverage/coverage-final.json`   | Line-level detail per file       |
| `coverage/index.html`            | Interactive HTML report          |
