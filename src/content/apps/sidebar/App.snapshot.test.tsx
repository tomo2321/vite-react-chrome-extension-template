import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import App from "./App";

it("renders the sidebar app snapshot", () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});
