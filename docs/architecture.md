# Extension Architecture

A Chrome extension is made up of several isolated JavaScript contexts that **cannot share
memory**. Understanding what runs where — and how the parts communicate — is the foundation
for building anything non-trivial.

## The Three Contexts

```text
┌─────────────────────────────────────────────────────────────────┐
│ Chrome Browser                                                   │
│                                                                  │
│  ┌──────────────────────┐     ┌───────────────────────────────┐ │
│  │  Background          │     │  Extension Pages              │ │
│  │  Service Worker      │     │  (popup / options / sidepanel │ │
│  │                      │     │   devtools / newtab)          │ │
│  │  - No DOM            │     │                               │ │
│  │  - Full chrome.* API │     │  - Full chrome.* API          │ │
│  │  - Shared state      │◄───►│  - Own DOM                    │ │
│  │  - Always one copy   │     │  - No access to page DOM      │ │
│  └──────────┬───────────┘     └───────────────────────────────┘ │
│             │                                                    │
│             │  messaging                                         │
│             ▼                                                    │
│  ┌──────────────────────┐                                        │
│  │  Content Scripts     │  (injected into web pages)            │
│  │                      │                                        │
│  │  - Access to page DOM│                                        │
│  │  - Limited chrome.*  │                                        │
│  │  - Isolated from     │                                        │
│  │    page's own JS     │                                        │
│  └──────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Background Service Worker (`src/background/`)

- Runs once per browser session in the extension's background context
- No DOM access
- Has access to most `chrome.*` APIs
- Acts as the central coordinator — ideal for network requests, alarms, and shared state
- Can be terminated by Chrome when idle; do not store state in variables (use `chrome.storage`)

### Content Scripts (`src/content/`)

- Injected into web pages matching the `matches` pattern in the manifest
- Can read and modify the DOM of the host page
- Runs in an isolated world — shares the page's DOM but **not** its JavaScript variables
- Limited `chrome.*` API access (mainly `chrome.runtime` and `chrome.storage`)
- Cannot directly call background APIs; must use messaging

### Extension Pages (`src/pages/`)

Popup, options, side panel, DevTools panel, and new tab override are all regular HTML pages:

- Full access to all `chrome.*` APIs
- Own isolated DOM — cannot access the DOM of the current tab
- Communicate with content scripts via `chrome.tabs.sendMessage`

## Communication

Because the contexts are isolated, they communicate by passing **messages**.

| From → To                       | API                          |
| ------------------------------- | ---------------------------- |
| Content script → Background     | `chrome.runtime.sendMessage` |
| Extension page → Background     | `chrome.runtime.sendMessage` |
| Background → Content script     | `chrome.tabs.sendMessage`    |
| Extension page → Content script | `chrome.tabs.sendMessage`    |

See [messaging.md](messaging.md) for patterns and examples.

## Shared State

Because the background service worker can be terminated at any time, **never store shared state
in variables**. Use `chrome.storage` instead — it persists across context restarts and is
accessible from all contexts.

See [storage.md](storage.md) for usage.

## What Can Each Context Do?

| Capability         | Background | Content Script | Extension Page |
| ------------------ | :--------: | :------------: | :------------: |
| Access page DOM    |     ✗      |       ✓        |       ✗        |
| `chrome.tabs.*`    |     ✓      |       ✗        |       ✓        |
| `chrome.storage.*` |     ✓      |       ✓        |       ✓        |
| `chrome.runtime.*` |     ✓      |    partial     |       ✓        |
| `fetch` / network  |     ✓      |       ✓        |       ✓        |
| DOM / `document`   |     ✗      |       ✓        |       ✓        |
