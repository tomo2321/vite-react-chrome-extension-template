/**
 * Converts a Vite-resolved asset path to an absolute `chrome-extension://` URL
 * using {@link chrome.runtime.getURL}.
 *
 * In content scripts, paths like `"/assets/react-HASH.svg"` are interpreted
 * relative to the host page, not the extension. This function ensures the URL
 * always points to the correct resource inside the extension package.
 *
 * ### Dev vs. build behaviour
 * - **Build mode**: Vite resolves imported assets to root-relative paths such as
 *   `"/assets/react-CHdo91hT.svg"`. The leading slash is stripped and the path is
 *   wrapped with `chrome.runtime.getURL`, producing a valid `chrome-extension://` URL.
 * - **Dev mode**: CRXJS resolves imported assets to absolute `http://localhost:PORT/...`
 *   URLs served by the local dev server. The origin is stripped so that only the
 *   pathname is passed to `chrome.runtime.getURL`, which CRXJS also serves within the
 *   extension during development. This avoids both a malformed `chrome-extension://`
 *   URL and Chrome's **Private Network Access (PNA)** policy — a content script on a
 *   public origin (e.g. `https://www.yahoo.co.jp/`) loading a subresource from
 *   `localhost` may trigger a permission prompt or be silently blocked.
 *
 * @param path - The asset path to convert. Accepted forms:
 *   - `http://localhost:PORT/...` (dev mode) – origin stripped, pathname forwarded
 *   - Root-relative path (`"/assets/foo.svg"`) – leading slash stripped, then wrapped
 *   - Relative path (`"vite.svg"`) – wrapped directly
 * @returns The absolute `chrome-extension://<id>/<path>` URL for the given asset.
 *
 * @example
 * import _logo from "../assets/logo.svg";
 * const logo = toExtUrl(_logo);
 * // build: "chrome-extension://abc123/assets/logo-HASH.svg"
 * // dev:   "chrome-extension://abc123/src/assets/logo.svg"
 */
export function toExtUrl(path: string): string {
  // In dev mode, CRXJS resolves imported assets to absolute `http://localhost:PORT/...`
  // URLs. Extract just the pathname so chrome.runtime.getURL produces a valid URL.
  const normalized = /^https?:\/\/localhost(:\d+)?\//.test(path)
    ? new URL(path).pathname
    : path;
  return chrome.runtime.getURL(normalized.replace(/^\//, ""));
}
