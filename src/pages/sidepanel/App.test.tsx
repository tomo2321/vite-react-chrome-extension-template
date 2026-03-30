import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Sidepanel App", () => {
  it("renders the Home route by default", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /side panel/i }),
    ).toBeInTheDocument();
  });

  it("increments the counter on Home", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /count is 0/i }));
    expect(
      screen.getByRole("button", { name: /count is 1/i }),
    ).toBeInTheDocument();
  });

  it("navigates to Detail when clicking Go to Detail", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /go to detail/i }));
    expect(
      screen.getByRole("heading", { name: /detail/i }),
    ).toBeInTheDocument();
  });

  it("navigates back to Home from Detail", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /go to detail/i }));
    await user.click(screen.getByRole("button", { name: /back to home/i }));
    expect(
      screen.getByRole("heading", { name: /side panel/i }),
    ).toBeInTheDocument();
  });
});
