import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "./App";

const meta: Meta<typeof App> = {
  title: "Pages/Sidepanel",
  component: App,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnDetailRoute: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /go to detail/i }),
    );
  },
};
