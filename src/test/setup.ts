import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { installChromeMock } from "./chrome-mock";

installChromeMock();

// Reset mock call history and implementations between tests.
// installChromeMock() is NOT re-called here — vi.resetAllMocks() clears
// implementations on the existing vi.fn() instances, which is sufficient.
// Re-creating the chrome object would produce new function references that
// vi.mocked() calls in tests would no longer point to.
beforeEach(() => {
  vi.resetAllMocks();
});
