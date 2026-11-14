// @vitest-environment jsdom
import { it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { createElement } from "react";
import { AppProvider, useApp } from "../src/core/state";
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
it("reports a storage failure without losing the current scenario draft", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw Error("quota");
  });
  function Probe() {
    const { prefs, patch, storageError } = useApp();
    return createElement(
      "button",
      { onClick: () => patch({ rainDelta: 20 }) },
      `${prefs.rainDelta}:${storageError}`,
    );
  }
  render(createElement(AppProvider, null, createElement(Probe)));
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("20:true");
});
