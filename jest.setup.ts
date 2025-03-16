import { beforeEach, jest } from "@jest/globals";

// Add custom Jest matchers for testing DOM elements
import "@testing-library/jest-dom";

// Mock global objects if needed
// global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
