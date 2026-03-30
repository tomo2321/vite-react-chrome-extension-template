import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-onboarding",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal(config) {
    // Remove the CRXJS Chrome extension plugin — it is incompatible with
    // Storybook's builder and must not run outside of an extension build.
    const filtered = (config.plugins ?? []).filter((plugin) => {
      if (!plugin || typeof plugin !== "object" || Array.isArray(plugin))
        return true;
      const p = plugin as { name?: string };
      return p.name !== "crx";
    });
    return {
      ...config,
      plugins: [...filtered, tailwindcss()],
    };
  },
};

export default config;
