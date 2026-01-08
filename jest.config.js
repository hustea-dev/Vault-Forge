/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // ESM用のプリセットを使用
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // .js 拡張子を解決するためのマッピング
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // ts-jestにESMを使うことを伝える
      },
    ],
  },
  testMatch: [
    "**/tests/**/*.test.ts", // ユニットテストと統合テスト
    "**/tests/e2e/**/*.e2e.test.ts" // E2Eテスト
  ],
};
