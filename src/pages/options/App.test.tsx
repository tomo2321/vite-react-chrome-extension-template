import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("Options App", () => {
  beforeEach(() => {
    // Default: storage returns no persisted value
    vi.mocked(chrome.storage.local.get).mockImplementation(
      (_keys: unknown, callback?: (r: Record<string, unknown>) => void) => {
        if (typeof callback === "function") callback({});
        return Promise.resolve({});
      },
    );
  });

  it("renders the heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /options/i }),
    ).toBeInTheDocument();
  });

  it("renders the counter starting at 0 when storage is empty", async () => {
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /count is 0/i }),
      ).toBeInTheDocument();
    });
  });

  it("loads persisted count from chrome.storage on mount", async () => {
    vi.mocked(chrome.storage.local.get).mockImplementation(
      (_keys: unknown, callback?: (r: Record<string, unknown>) => void) => {
        if (typeof callback === "function") callback({ options_count: 7 });
        return Promise.resolve({ options_count: 7 });
      },
    );
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /count is 7/i }),
      ).toBeInTheDocument();
    });
  });

  it("increments count and persists it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /count is 0/i }));
    expect(
      screen.getByRole("button", { name: /count is 1/i }),
    ).toBeInTheDocument();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ options_count: 1 });
  });

  it("resets count to 0 and persists it", async () => {
    const user = userEvent.setup();
    vi.mocked(chrome.storage.local.get).mockImplementation(
      (_keys: unknown, callback?: (r: Record<string, unknown>) => void) => {
        if (typeof callback === "function") callback({ options_count: 5 });
        return Promise.resolve({ options_count: 5 });
      },
    );
    render(<App />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /count is 5/i }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(
      screen.getByRole("button", { name: /count is 0/i }),
    ).toBeInTheDocument();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ options_count: 0 });
  });
});
