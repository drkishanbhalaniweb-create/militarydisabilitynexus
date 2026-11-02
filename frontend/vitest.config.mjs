import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'treat-components-as-jsx',
      enforce: 'pre',
      async resolveId(source, importer) {
        if (!source || !importer) return null;
        if (
          source.includes('components') ||
          (importer.includes('components') && (source.startsWith('./') || source.startsWith('../')))
        ) {
          const resolved = await this.resolve(source, importer, { skipSelf: true });
          if (resolved && resolved.id.endsWith('.js')) {
            return `${resolved.id}.jsx`;
          }
        }
        return null;
      },
      load(id) {
        if (id.endsWith('.js.jsx')) {
          const realPath = id.slice(0, -4);
          return fs.readFileSync(realPath, 'utf8');
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.js'],
    include: ['tests/unit/**/*.test.js', 'tests/api/**/*.test.js'],
    clearMocks: true,
    restoreMocks: true,
  },
});
