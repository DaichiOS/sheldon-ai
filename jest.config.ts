const nextJest = require("next/jest");

// Create a custom Next.js configuration
const createJestConfig = nextJest({
  // The path to your Next.js app (where your next.config.js is)
  dir: "./",
});

// Add any custom config you want
const customJestConfig = {
  // Test environment for React components
  // Use jsdom for browser-like environment
  testEnvironment: "jest-environment-jsdom",

  // Where Jest should look for test files
  testMatch: ["**/__tests__/**/*.test.(js|jsx|ts|tsx)"],

  // Modules to mock (useful for CSS, images, etc.)
  moduleNameMapper: {
    // This sets up path aliases.
    // If your code imports from @/components/Button, Jest will look for src/components/Button instead.
    // This matches the path aliases often defined in tsconfig.json
    "^@/(.*)$": "<rootDir>/src/$1",

    // This mocks CSS imports.
    // When your components import CSS files,
    // Jest will use the 'identity-obj-proxy' package which returns an empty object instead of trying to process the actual CSS.
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Files to run before tests
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // By default, Jest ignores node_modules from transformation
  // We need to transform next-auth and other ESM modules
  transformIgnorePatterns: [
    // Allow transformation of next-auth and other ESM packages
    "/node_modules/(?!(next-auth|@auth/core)/)",
  ],

  // Use babel-jest for all files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  // Coverage reporting
  collectCoverage: true,
  coverageDirectory: "coverage",
};

// This exports the complete Jest configuration by passing your custom config to the createJestConfig function,
// which merges it with Next.js-specific settings
module.exports = createJestConfig(customJestConfig);
