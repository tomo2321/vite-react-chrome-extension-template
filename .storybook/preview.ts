import type { Preview } from "@storybook/react-vite";
import "../src/shared/index.css";
import { installChromeMock } from "../src/test/chrome-mock";

installChromeMock();

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#242424" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
