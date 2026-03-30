import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, defineProject, mergeConfig } from "vitest/config";

const baseConfig = defineConfig({
  plugins: [react()],
});

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.test.{ts,tsx}",
          "src/**/*.stories.{ts,tsx}",
          "src/test/**",
          // Entry points that only mount React roots — no logic to test
          "src/**/main.tsx",
          "src/content/apps/*/index.tsx",
          // Thin entry points whose logic is covered elsewhere or is trivial
          "src/background/index.ts",
          "src/content/example.com/index.ts",
          "src/pages/devtools/index.ts",
          "src/manifest.ts",
          "src/shared/types/**",
        ],
        reporter: [
          "text",
          "text-summary",
          "json",
          "json-summary",
          "html",
          "lcov",
        ],
        reportsDirectory: "./coverage",
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
      projects: [
        // Unit and component tests (jsdom)
        defineProject({
          plugins: [react()],
          test: {
            name: "unit",
            globals: true,
            environment: "jsdom",
            setupFiles: ["./src/test/setup.ts"],
            include: ["src/**/*.test.{ts,tsx}"],
          },
        }),
        // Storybook story tests (real browser via Playwright)
        defineProject({
          plugins: [tailwindcss(), storybookTest({ configDir: ".storybook" })],
          optimizeDeps: {
            include: [
              "react/jsx-dev-runtime",
              "react",
              "react-dom",
              "react-dom/client",
            ],
          },
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: "chromium" }],
            },
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        }),
      ],
    },
  }),
);
