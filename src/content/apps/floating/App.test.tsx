import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Floating App", () => {
  it("renders the widget initially", () => {
    render(<App />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText(/floating app/i)).toBeInTheDocument();
  });

  it("increments the counter on click", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /count is 0/i }));
    expect(
      screen.getByRole("button", { name: /count is 1/i }),
    ).toBeInTheDocument();
  });

  it("hides the widget when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTitle("Close"));
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("adds isDragging class on mousedown on header", () => {
    render(<App />);
    const header = screen.getByRole("toolbar");
    fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });
    expect(header.closest(".widget")).toHaveClass("dragging");
  });

  it("removes isDragging class on mouseup", () => {
    render(<App />);
    const header = screen.getByRole("toolbar");
    fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(window);
    expect(header.closest(".widget")).not.toHaveClass("dragging");
  });

  it("updates position on mousemove while dragging", () => {
    render(<App />);
    const header = screen.getByRole("toolbar");
    fireEvent.mouseDown(header, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(window, { clientX: 200, clientY: 150 });
    const widget = header.closest(".widget") as HTMLElement;
    // Position should have updated (CSS custom props)
    expect(widget.style.getPropertyValue("--x")).not.toBe("");
  });

  it("does not move on mousemove when not dragging", () => {
    render(<App />);
    const header = screen.getByRole("toolbar");
    const widget = header.closest(".widget") as HTMLElement;
    const before = widget.style.getPropertyValue("--x");
    fireEvent.mouseMove(window, { clientX: 999, clientY: 999 });
    expect(widget.style.getPropertyValue("--x")).toBe(before);
  });
});
