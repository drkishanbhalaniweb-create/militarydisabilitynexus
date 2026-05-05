import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.js'],
    include: ['tests/unit/**/*.test.js', 'tests/api/**/*.test.js'],
    clearMocks: true,
    restoreMocks: true,
  },
});
