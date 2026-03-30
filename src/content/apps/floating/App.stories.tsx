import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "./App";

const meta: Meta<typeof App> = {
  title: "Content/FloatingApp",
  component: App,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
