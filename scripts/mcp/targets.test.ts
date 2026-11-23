// @vitest-environment node
/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: fixtures use literal ${env:VAR} placeholders */

import {
  convertEnv,
  mergeIntoExisting,
  mergeSources,
  type Servers,
  TARGETS,
  toClaude,
  toCodex,
  toCursor,
  toGemini,
  toOpencode,
  toVscode,
} from "./targets";

const servers: Servers = {
  local: {
    command: "npx",
    args: ["-y", "pkg"],
    env: { API_KEY: "${env:API_KEY}" },
  },
  remote: {
    url: "https://example.com/mcp",
    headers: {
      Authorization: "Bearer ${env:TOKEN}",
      "X-Key": "${env:X_KEY}",
    },
  },
  off: { enabled: false, command: "noop" },
};

describe("convertEnv", () => {
  it("rewrites every placeholder", () => {
    expect(convertEnv("${env:A}-${env:B}", (n) => `$${n}`)).toBe("$A-$B");
  });

  it("leaves plain strings untouched", () => {
    expect(convertEnv("plain", (n) => n)).toBe("plain");
  });
});

describe("mergeSources", () => {
  it("overrides fields of existing servers and adds new ones", () => {
    const merged = mergeSources(
      { servers: { a: { command: "a", enabled: false } } },
      { servers: { a: { enabled: true }, b: { url: "https://b" } } },
    );
    expect(merged.servers).toEqual({
      a: { command: "a", enabled: true },
      b: { url: "https://b" },
    });
  });
});

describe("targets", () => {
  it("claude", () => {
    expect(toClaude(servers)).toEqual({
      local: {
        command: "npx",
        args: ["-y", "pkg"],
        env: { API_KEY: "${API_KEY}" },
      },
      remote: {
        type: "http",
        url: "https://example.com/mcp",
        headers: { Authorization: "Bearer ${TOKEN}", "X-Key": "${X_KEY}" },
      },
    });
  });

  it("cursor", () => {
    expect(toCursor(servers)).toEqual({
      local: {
        command: "npx",
        args: ["-y", "pkg"],
        env: { API_KEY: "${env:API_KEY}" },
      },
      remote: {
        url: "https://example.com/mcp",
        headers: {
          Authorization: "Bearer ${env:TOKEN}",
          "X-Key": "${env:X_KEY}",
        },
      },
    });
  });

  it("vscode", () => {
    const out = toVscode(servers);
    expect(out.local).toMatchObject({ type: "stdio", command: "npx" });
    expect(out.remote).toMatchObject({
      type: "http",
      url: "https://example.com/mcp",
    });
  });

  it("gemini", () => {
    const out = toGemini(servers);
    expect(out.remote).toEqual({
      httpUrl: "https://example.com/mcp",
      headers: { Authorization: "Bearer ${TOKEN}", "X-Key": "${X_KEY}" },
    });
  });

  it("codex", () => {
    expect(toCodex(servers)).toEqual({
      local: { command: "npx", args: ["-y", "pkg"], env_vars: ["API_KEY"] },
      remote: {
        url: "https://example.com/mcp",
        bearer_token_env_var: "TOKEN",
        env_http_headers: { "X-Key": "X_KEY" },
      },
    });
  });

  it("opencode", () => {
    expect(toOpencode(servers)).toEqual({
      local: {
        type: "local",
        command: ["npx", "-y", "pkg"],
        environment: { API_KEY: "{env:API_KEY}" },
        enabled: true,
      },
      remote: {
        type: "remote",
        url: "https://example.com/mcp",
        headers: {
          Authorization: "Bearer {env:TOKEN}",
          "X-Key": "{env:X_KEY}",
        },
        enabled: true,
      },
    });
  });

  it("omits disabled servers everywhere", () => {
    for (const target of Object.values(TARGETS)) {
      expect(target.build(servers)).not.toHaveProperty("off");
    }
  });

  it("rejects a server with both command and url", () => {
    expect(() => toClaude({ bad: { command: "x", url: "https://x" } })).toThrow(
      /exactly one/,
    );
  });
});

describe("mergeIntoExisting", () => {
  it("keeps unrelated settings and replaces the owned key", () => {
    const merged = mergeIntoExisting(
      { theme: "dark", mcpServers: { stale: {} } },
      TARGETS.gemini,
      servers,
    );
    expect(merged.theme).toBe("dark");
    expect(merged.mcpServers).not.toHaveProperty("stale");
    expect(merged.mcpServers).toHaveProperty("local");
  });

  it("adds the schema to a new opencode.json", () => {
    const merged = mergeIntoExisting({}, TARGETS.opencode, servers);
    expect(merged.$schema).toBe("https://opencode.ai/config.json");
  });
});
