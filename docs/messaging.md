# Messaging

The three extension contexts (background, content scripts, extension pages) are isolated and
cannot share memory. They communicate by passing serialisable messages.

See [architecture.md](architecture.md) for an overview of which contexts exist and what they
can do.

## Patterns

### Content Script → Background

Send a message from a content script and receive a response:

```ts
// src/content/your-script/index.ts
const response = await chrome.runtime.sendMessage({
  type: "GET_DATA",
  payload: { id: 1 },
});
console.log(response);
```

Receive it in the background service worker:

```ts
// src/background/index.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_DATA") {
    // Do async work, then respond
    fetchData(message.payload.id).then((data) => sendResponse(data));
    return true; // Keep the channel open for async response
  }
});
```

> **Return `true`** from `onMessage` if you call `sendResponse` asynchronously. Without it,
> the message channel closes before your response is sent.

### Extension Page → Background

Identical to the content script pattern — use `chrome.runtime.sendMessage` and
`chrome.runtime.onMessage`.

### Background → Content Script

The background targets a specific tab by ID:

```ts
// src/background/index.ts
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
if (tab.id) {
  const response = await chrome.tabs.sendMessage(tab.id, { type: "HIGHLIGHT" });
}
```

Receive it in the content script:

```ts
// src/content/your-script/index.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "HIGHLIGHT") {
    document.body.style.outline = "2px solid red";
    sendResponse({ ok: true });
  }
});
```

### Extension Page → Content Script

Same as Background → Content Script — use `chrome.tabs.sendMessage` with a tab ID.

```ts
// src/pages/popup/App.tsx
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
if (tab.id) {
  await chrome.tabs.sendMessage(tab.id, { type: "HIGHLIGHT" });
}
```

This requires the `tabs` permission in `src/manifest.ts`:

```ts
const permissions = ["tabs", ...];
```

## Type-Safe Messages

Define a discriminated union for your message types to get full TypeScript safety:

```ts
// src/shared/types/messages.ts
export type Message =
  | { type: "GET_DATA"; payload: { id: number } }
  | { type: "HIGHLIGHT" }
  | { type: "CLEAR" };

export type MessageResponse = {
  GET_DATA: { value: string };
  HIGHLIGHT: { ok: boolean };
  CLEAR: void;
};
```

Then cast in the listener:

```ts
import type { Message } from "../../shared/types/messages";

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === "GET_DATA") {
      // message.payload.id is typed as number
    }
  },
);
```
