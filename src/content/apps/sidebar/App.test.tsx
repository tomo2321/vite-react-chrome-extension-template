import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("Sidebar App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the toggle button and sidebar when open", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /close sidebar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /sidebar/i }),
    ).toBeInTheDocument();
  });

  it("closes and reopens the sidebar via the toggle button", async () => {
    const user = userEvent.setup();
    render(<App />);
    // Close it
    await user.click(screen.getByRole("button", { name: /close sidebar/i }));
    expect(
      screen.queryByRole("heading", { name: /sidebar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open sidebar/i }),
    ).toBeInTheDocument();
    // Reopen it
    await user.click(screen.getByRole("button", { name: /open sidebar/i }));
    expect(
      screen.getByRole("heading", { name: /sidebar/i }),
    ).toBeInTheDocument();
  });

  it("renders the counter starting at 0 and increments on click", async () => {
    const user = userEvent.setup();
    render(<App />);
    const countButton = screen.getByRole("button", { name: /count is 0/i });
    expect(countButton).toBeInTheDocument();
    await user.click(countButton);
    expect(
      screen.getByRole("button", { name: /count is 1/i }),
    ).toBeInTheDocument();
  });

  it("loads initial width from localStorage when valid", () => {
    localStorage.setItem("rx-apps-sidebar-width", "400");
    render(<App />);
    const panel = screen
      .getByRole("heading", { name: /sidebar/i })
      .closest("div[style]");
    expect(panel).toHaveStyle({ width: "400px" });
  });

  it("falls back to default width when localStorage value is invalid", () => {
    localStorage.setItem("rx-apps-sidebar-width", "not-a-number");
    render(<App />);
    const panel = screen
      .getByRole("heading", { name: /sidebar/i })
      .closest("div[style]");
    expect(panel).toHaveStyle({ width: "288px" });
  });

  it("clamps width to MIN when localStorage value is too small", () => {
    localStorage.setItem("rx-apps-sidebar-width", "10");
    render(<App />);
    const panel = screen
      .getByRole("heading", { name: /sidebar/i })
      .closest("div[style]");
    expect(panel).toHaveStyle({ width: "200px" });
  });

  it("clamps width to MAX when localStorage value is too large", () => {
    localStorage.setItem("rx-apps-sidebar-width", "9999");
    render(<App />);
    const panel = screen
      .getByRole("heading", { name: /sidebar/i })
      .closest("div[style]");
    expect(panel).toHaveStyle({ width: "600px" });
  });

  it("starts resize on mousedown on the handle", () => {
    render(<App />);
    const handle = screen.getByRole("separator", { name: /drag to resize/i });
    fireEvent.mouseDown(handle);
    expect(document.documentElement.style.transition).toBe("none");
  });

  it("updates width on mousemove while resizing", () => {
    render(<App />);
    const handle = screen.getByRole("separator", { name: /drag to resize/i });
    fireEvent.mouseDown(handle);
    // Simulate drag so sidebar becomes 300px (window.innerWidth - clientX)
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
    });
    fireEvent.mouseMove(window, { clientX: 724 });
    const panel = screen
      .getByRole("heading", { name: /sidebar/i })
      .closest("div[style]");
    expect(panel).toHaveStyle({ width: "300px" });
  });

  it("persists width to localStorage on mouseup after resize", () => {
    render(<App />);
    const handle = screen.getByRole("separator", { name: /drag to resize/i });
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
    });
    fireEvent.mouseDown(handle);
    fireEvent.mouseMove(window, { clientX: 724 });
    fireEvent.mouseUp(window);
    expect(localStorage.getItem("rx-apps-sidebar-width")).toBe("300");
  });

  it("sets margin on document.documentElement when open", () => {
    render(<App />);
    expect(document.documentElement.style.marginRight).not.toBe("0px");
  });

  it("resets margin on document.documentElement when closed", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /close sidebar/i }));
    expect(document.documentElement.style.marginRight).toBe("0px");
  });
});
