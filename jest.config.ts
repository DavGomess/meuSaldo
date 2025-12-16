import type { Config } from "@jest/types";

const jestConfig: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    maxWorkers: 1,
    testMatch: ["**/__tests__/**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', 
    },
    testTimeout: 30000,
};

export default jestConfig;