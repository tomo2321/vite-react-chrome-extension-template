/**
 * MCP target generators
 *
 * Converts the agent-neutral server definitions in `mcp-servers.json` into the
 * config shape each coding agent expects. Every function here is pure so the
 * conversions can be unit-tested without touching the filesystem.
 */

// ---------------------------------------------------------------------------
// Source format
// ---------------------------------------------------------------------------

export interface McpServer {
  description?: string;
  /** Defaults to true. Disabled servers are omitted from every target. */
  enabled?: boolean;
  // stdio transport
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  // Streamable HTTP transport
  url?: string;
  headers?: Record<string, string>;
}

export interface McpSource {
  servers: Record<string, McpServer>;
}

export type Servers = Record<string, McpServer>;

/** Matches `${env:VAR}` placeholders in the source file. */
const ENV_PLACEHOLDER = /\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g;

/** Rewrites `${env:VAR}` into an agent's own placeholder syntax. */
export function convertEnv(value: string, format: (name: string) => string) {
  return value.replace(ENV_PLACEHOLDER, (_, name: string) => format(name));
}

function mapValues(
  record: Record<string, string> | undefined,
  format: (name: string) => string,
): Record<string, string> | undefined {
  if (!record) return undefined;
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => [k, convertEnv(v, format)]),
  );
}

/** Drops `undefined` fields so generated JSON stays minimal. */
function compact<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

export function isRemote(server: McpServer): boolean {
  return server.url !== undefined;
}

/** Deep-merges a local override file onto the committed source. */
export function mergeSources(base: McpSource, local?: Partial<McpSource>) {
  const servers: Servers = { ...base.servers };
  for (const [name, override] of Object.entries(local?.servers ?? {})) {
    servers[name] = { ...servers[name], ...override };
  }
  return { servers };
}

export function enabledServers(servers: Servers): Servers {
  return Object.fromEntries(
    Object.entries(servers).filter(([, s]) => s.enabled !== false),
  );
}

function validate(name: string, server: McpServer) {
  if (!server.command === !server.url) {
    throw new Error(
      `MCP server "${name}" must define exactly one of "command" or "url"`,
    );
  }
}

function mapServers<T>(
  servers: Servers,
  convert: (server: McpServer) => T,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(enabledServers(servers)).map(([name, server]) => {
      validate(name, server);
      return [name, convert(server)];
    }),
  );
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

export type AgentId =
  | "claude"
  | "cursor"
  | "vscode"
  | "gemini"
  | "codex"
  | "opencode";

export interface Target {
  /** Path relative to the repository root. */
  file: string;
  format: "json" | "toml";
  /** The key this generator owns; all other keys in the file are preserved. */
  key: string;
  build: (servers: Servers) => Record<string, unknown>;
}

const dollarBrace = (name: string) => `\${${name}}`;
const envColon = (name: string) => `\${env:${name}}`;

/** Claude Code — `.mcp.json` */
export function toClaude(servers: Servers) {
  return mapServers(servers, (s) =>
    isRemote(s)
      ? compact({
          type: "http",
          url: s.url,
          headers: mapValues(s.headers, dollarBrace),
        })
      : compact({
          command: s.command,
          args: s.args,
          env: mapValues(s.env, dollarBrace),
        }),
  );
}

/** Cursor — `.cursor/mcp.json` */
export function toCursor(servers: Servers) {
  return mapServers(servers, (s) =>
    isRemote(s)
      ? compact({ url: s.url, headers: mapValues(s.headers, envColon) })
      : compact({
          command: s.command,
          args: s.args,
          env: mapValues(s.env, envColon),
        }),
  );
}

/** VS Code / GitHub Copilot — `.vscode/mcp.json` */
export function toVscode(servers: Servers) {
  return mapServers(servers, (s) =>
    isRemote(s)
      ? compact({
          type: "http",
          url: s.url,
          headers: mapValues(s.headers, envColon),
        })
      : compact({
          type: "stdio",
          command: s.command,
          args: s.args,
          env: mapValues(s.env, envColon),
        }),
  );
}

/** Gemini CLI — `.gemini/settings.json` */
export function toGemini(servers: Servers) {
  return mapServers(servers, (s) =>
    isRemote(s)
      ? compact({
          httpUrl: s.url,
          headers: mapValues(s.headers, dollarBrace),
        })
      : compact({
          command: s.command,
          args: s.args,
          env: mapValues(s.env, dollarBrace),
        }),
  );
}

/**
 * Codex — `.codex/config.toml`
 *
 * Codex does not interpolate placeholders. A header that is entirely
 * `Bearer ${env:VAR}` becomes `bearer_token_env_var`, a header that is
 * entirely `${env:VAR}` becomes an `env_http_headers` entry, and stdio env
 * values that reference a variable are forwarded with `env_vars`.
 */
export function toCodex(servers: Servers) {
  const single = /^\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}$/;
  const bearer = /^Bearer \$\{env:([A-Za-z_][A-Za-z0-9_]*)\}$/;

  return mapServers(servers, (s) => {
    if (isRemote(s)) {
      let bearerTokenEnvVar: string | undefined;
      const envHeaders: Record<string, string> = {};
      const staticHeaders: Record<string, string> = {};
      for (const [header, value] of Object.entries(s.headers ?? {})) {
        const b = value.match(bearer);
        const e = value.match(single);
        if (header.toLowerCase() === "authorization" && b) {
          bearerTokenEnvVar = b[1];
        } else if (e) {
          envHeaders[header] = e[1];
        } else {
          staticHeaders[header] = value;
        }
      }
      return compact({
        url: s.url,
        bearer_token_env_var: bearerTokenEnvVar,
        env_http_headers: Object.keys(envHeaders).length
          ? envHeaders
          : undefined,
        http_headers: Object.keys(staticHeaders).length
          ? staticHeaders
          : undefined,
      });
    }

    const forwarded: string[] = [];
    const literal: Record<string, string> = {};
    for (const [key, value] of Object.entries(s.env ?? {})) {
      const e = value.match(single);
      if (e && e[1] === key) forwarded.push(key);
      else literal[key] = value;
    }
    return compact({
      command: s.command,
      args: s.args,
      env: Object.keys(literal).length ? literal : undefined,
      env_vars: forwarded.length ? forwarded : undefined,
    });
  });
}

/** OpenCode — `opencode.json` */
export function toOpencode(servers: Servers) {
  const braceEnv = (name: string) => `{env:${name}}`;
  return mapServers(servers, (s) =>
    isRemote(s)
      ? compact({
          type: "remote",
          url: s.url,
          headers: mapValues(s.headers, braceEnv),
          enabled: true,
        })
      : compact({
          type: "local",
          command: [s.command as string, ...(s.args ?? [])],
          environment: mapValues(s.env, braceEnv),
          enabled: true,
        }),
  );
}

export const TARGETS: Record<AgentId, Target> = {
  claude: {
    file: ".mcp.json",
    format: "json",
    key: "mcpServers",
    build: toClaude,
  },
  cursor: {
    file: ".cursor/mcp.json",
    format: "json",
    key: "mcpServers",
    build: toCursor,
  },
  vscode: {
    file: ".vscode/mcp.json",
    format: "json",
    key: "servers",
    build: toVscode,
  },
  gemini: {
    file: ".gemini/settings.json",
    format: "json",
    key: "mcpServers",
    build: toGemini,
  },
  codex: {
    file: ".codex/config.toml",
    format: "toml",
    key: "mcp_servers",
    build: toCodex,
  },
  opencode: {
    file: "opencode.json",
    format: "json",
    key: "mcp",
    build: toOpencode,
  },
};

/** Replaces only the owned key, keeping any other settings in the file. */
export function mergeIntoExisting(
  existing: Record<string, unknown>,
  target: Target,
  servers: Servers,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...existing };
  if (target.file === "opencode.json" && !("$schema" in merged)) {
    return {
      $schema: "https://opencode.ai/config.json",
      ...merged,
      [target.key]: target.build(servers),
    };
  }
  merged[target.key] = target.build(servers);
  return merged;
}
