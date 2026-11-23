# MCP Servers

MCP (Model Context Protocol) servers give AI coding agents extra tools, such as a real browser
or up-to-date library docs. This project defines its servers **once**, in `mcp-servers.json`,
and generates each agent's own config file from it.

## How it works

```text
mcp-servers.json            (committed — source of truth)
mcp-servers.local.json      (optional, git-ignored — personal overrides)
        │
        ▼  pnpm mcp:sync
.mcp.json  .cursor/mcp.json  .vscode/mcp.json  .gemini/settings.json  .codex/config.toml  opencode.json
                         (all generated and git-ignored)
```

The sync runs automatically:

- on `pnpm install` / `pnpm setup` (the `prepare` script)
- after `git checkout` and `git merge` / `git pull` (husky `post-checkout` and `post-merge` hooks)
- on commit, when `mcp-servers.json` is staged (lint-staged)

To run it by hand:

```bash
pnpm mcp:sync                     # regenerate every agent's config
pnpm mcp:sync --agents claude,codex   # only some agents
pnpm mcp:sync --check             # exit 1 if any generated file is stale
```

## Generated files

| Agent             | File                    | Key managed by the sync |
| ----------------- | ----------------------- | ----------------------- |
| Claude Code       | `.mcp.json`             | `mcpServers`            |
| Cursor            | `.cursor/mcp.json`      | `mcpServers`            |
| VS Code / Copilot | `.vscode/mcp.json`      | `servers`               |
| Gemini CLI        | `.gemini/settings.json` | `mcpServers`            |
| Codex             | `.codex/config.toml`    | `mcp_servers`           |
| OpenCode          | `opencode.json`         | `mcp`                   |

The sync replaces only the key in the last column, so other settings you add to these files (for
example a Gemini theme) are kept. Do not edit the MCP section of a generated file; your change
is overwritten on the next sync. Edit `mcp-servers.json` or `mcp-servers.local.json` instead.

Codex loads `.codex/config.toml` only for trusted projects. Mark this project as trusted when
Codex asks.

## Servers

| Server                | Default | Requirements                                                   |
| --------------------- | ------- | -------------------------------------------------------------- |
| `chrome-devtools`     | on      | Chrome installed                                               |
| `playwright`          | on      | None                                                           |
| `context7`            | on      | None (rate-limited without an API key, see below)              |
| `storybook`           | on      | `pnpm storybook` running (served by `@storybook/addon-mcp`)    |
| `sequential-thinking` | on      | None                                                           |
| `git`                 | on      | `uv` (installed by `mise install`)                             |
| `fetch`               | on      | `uv` (installed by `mise install`)                             |
| `github`              | on      | `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable, see below |
| `figma`               | off     | Figma account; sign in through your agent's OAuth flow         |
| `browsermcp`          | off     | [Browser MCP](https://browsermcp.io) Chrome extension          |
| `snyk`                | off     | [Snyk CLI](https://docs.snyk.io/snyk-cli) on `PATH`, see below |

`chrome-devtools` is the most useful one for extension work. It can open your extension's pages
and read their console and network activity.

`fetch` reads a given URL as Markdown. There is no web search server: Claude Code, Codex, Gemini
CLI and Copilot have built-in web search.

### Headless browsers

`chrome-devtools` and `playwright` open a visible browser window by default, which makes it easy
to watch what the agent does to your extension. To run them headless (for example on CI or a
remote machine), override their `args` in `mcp-servers.local.json`:

```json
{
  "servers": {
    "chrome-devtools": {
      "args": ["-y", "chrome-devtools-mcp@latest", "--headless"]
    },
    "playwright": { "args": ["-y", "@playwright/mcp@latest", "--headless"] }
  }
}
```

To drive the Chrome you already have open, with your sign-ins, use `browsermcp`, or start
`chrome-devtools` with `--browser-url` or `playwright` with `--extension`.

### GitHub

The `github` server is GitHub's hosted MCP server (`https://api.githubcopilot.com/mcp/`). It reads
and manages issues, pull requests, Actions runs and code. Every agent sends your token from the
`GITHUB_PERSONAL_ACCESS_TOKEN` environment variable, so set that up once:

1. **Create a fine-grained personal access token for MCP only** at
   [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new):
   - **Expiration:** set one; 30–90 days is recommended (see [Token policy](#token-policy)).
   - **Repository access:** only the repositories the agent works on.
   - **Permissions:** **Contents**, **Issues**, **Pull requests** and **Actions** — read-only,
     or read and write if the agent should make changes. **Metadata: read** is added
     automatically.

   Do not reuse the token from `gh auth token`. It covers every repository you can access and
   does not expire.

2. **Export it** — pick one:
   - **Shell profile** (`~/.zshrc`, `~/.bashrc`), available in every project:

     ```bash
     export GITHUB_PERSONAL_ACCESS_TOKEN="github_pat_..."
     ```

   - **This project only**, through mise. Create `mise.local.toml` (git-ignored) next to
     `mise.toml`:

     ```toml
     [env]
     GITHUB_PERSONAL_ACCESS_TOKEN = "github_pat_..."
     ```

     mise sets the variable whenever your shell is in this directory (requires
     [`mise activate`](https://mise.jdx.dev/getting-started.html#activate-mise) in your shell).

3. **Restart your agent** from a new terminal, so it inherits the variable. Desktop apps
   (Cursor, VS Code, Claude Desktop) launched from the Dock may not see your shell environment.
   Launch them from the terminal (`cursor .`, `code .`), or set the variable for GUI apps.

4. **Check it.** GitHub reports the token's expiry in a response header:

   ```bash
   curl -sI -H "Authorization: Bearer $GITHUB_PERSONAL_ACCESS_TOKEN" https://api.github.com/user \
     | grep -iE '^HTTP|github-authentication-token-expiration'
   ```

   Expect `HTTP/2 200` and an expiration date. In Claude Code, `claude mcp list` should also
   show `github` as connected.

The sync writes only the variable name into each generated file, never the token itself. Codex
reads it through `bearer_token_env_var`; the other agents expand `${...}` in the
`Authorization` header.

Without the variable, the `github` server fails to connect, and the other servers keep working.
If you do not want it, disable it in `mcp-servers.local.json`:

```json
{ "servers": { "github": { "enabled": false } } }
```

To keep the agent read-only, or to limit the tools it gets, add GitHub's optional headers in
`mcp-servers.local.json`:

```json
{
  "servers": {
    "github": {
      "headers": {
        "Authorization": "Bearer ${env:GITHUB_PERSONAL_ACCESS_TOKEN}",
        "X-MCP-Readonly": "true",
        "X-MCP-Toolsets": "repos,issues,pull_requests,actions"
      }
    }
  }
}
```

The local file replaces the whole `headers` object, so keep the `Authorization` line.

### Snyk

The `snyk` server scans dependencies and source code for vulnerabilities. To use it:

1. Install the Snyk CLI (1.1307.4 or later), e.g. `brew install snyk-cli` or `npm i -g snyk`.
2. Run `snyk auth` once. It signs in with OAuth, and the CLI refreshes the short-lived access
   token itself. Prefer this over a long-lived `SNYK_TOKEN`. If you must use `SNYK_TOKEN`
   (for example a service account token), give it an expiry and follow the
   [Token policy](#token-policy). The agent must inherit that variable; desktop apps may not see
   your shell environment.
3. Enable it in `mcp-servers.local.json` and run `pnpm mcp:sync`.

There is no Puppeteer server. The reference `@modelcontextprotocol/server-puppeteer` was archived
in May 2025, and `chrome-devtools` (built on Puppeteer) and `playwright` cover the same ground.

### Desktop control (not included)

Servers that control your whole computer are not part of `mcp-servers.json`. They have broad
access to your machine and depend on the OS, and the browser servers above already cover
browser work. If you want one, add it to your agent's global config or to
`mcp-servers.local.json`. On macOS, for example:

- [Peekaboo](https://github.com/steipete/Peekaboo) — screenshots and GUI automation
- [macos-automator-mcp](https://github.com/steipete/macos-automator-mcp) — AppleScript / JXA

## Token policy

Every server that needs a credential gets its own token, scoped to this work and with an expiry.

| Server     | Credential                  | Expiry                                                 |
| ---------- | --------------------------- | ------------------------------------------------------ |
| `github`   | Fine-grained PAT            | Set at creation; 30–90 days recommended                |
| `context7` | API key (optional)          | Rotate every 90 days; revoke old keys                  |
| `snyk`     | `snyk auth` (OAuth)         | Refreshed by the CLI; `snyk auth` again when it lapses |
| `figma`    | OAuth, stored by your agent | Managed by the agent; sign in again when asked         |

Rules:

1. **One token per purpose.** Create tokens for MCP only, never reuse a personal or CI token.
   When one leaks, you revoke it without breaking anything else.
2. **Always set an expiry.** Prefer the provider's expiry setting. If a provider has none,
   write the rotation date in your password manager and rotate it yourself.
3. **Least privilege.** Only the repositories, organizations and permissions the agent needs.
   Use read-only where you can (for GitHub, also see `X-MCP-Readonly` above).
4. **Rotate before expiry.** Create the new token, update the environment variable, restart the
   agent, then revoke the old one.
5. **Revoke immediately** if a token appears in a log, a commit, a chat transcript or an agent's
   output.

Tokens passed as environment variables are visible to the agent: it can run `printenv`. The
limits above keep the damage small if an agent leaks one. To hide a token from the agent
entirely, keep it outside the agent's process, for example in a sandbox or a proxy that holds
the token.

## Personal overrides

Create `mcp-servers.local.json` to change servers for yourself only. It is deep-merged onto
`mcp-servers.json` per server:

```json
{
  "servers": {
    "snyk": { "enabled": true },
    "storybook": { "enabled": false },
    "context7": {
      "headers": { "CONTEXT7_API_KEY": "${env:CONTEXT7_API_KEY}" }
    }
  }
}
```

Then run `pnpm mcp:sync`.

## Adding a server

Add an entry to `mcp-servers.json`. Each server is either a local command (stdio) or a remote URL
(Streamable HTTP). Give it exactly one of `command` or `url`.

```jsonc
{
  "servers": {
    "my-local": {
      "description": "What it does",
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": { "API_KEY": "${env:API_KEY}" }
    },
    "my-remote": {
      "description": "What it does",
      "enabled": false,
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer ${env:MY_TOKEN}" }
    }
  }
}
```

- Never put secrets in the file. Reference environment variables as `${env:NAME}`; the sync
  converts this to each agent's syntax (`${NAME}`, `{env:NAME}`, Codex's `bearer_token_env_var`,
  and so on).
- Set `"enabled": false` for servers that need a token, an account or extra software, so they do
  not fail at startup for everyone.

The conversion logic lives in `scripts/mcp/targets.ts`. To support another agent, add a target
there and a test in `scripts/mcp/targets.test.ts`.
