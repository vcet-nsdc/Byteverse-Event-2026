const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["**/tests/unit/**/*.test.ts"],
  collectCoverageFrom: ["src/lib/**/*.ts"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

module.exports = createJestConfig(config);
