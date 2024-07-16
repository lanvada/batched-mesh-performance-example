import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
export default defineConfig(() => {
  return {
    build: {
      target: 'esnext',
    },
    plugins: [
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: '__tla',
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
    server: {
      open: false,
      // host: 'localhost',
      host: '0.0.0.0',
      port: 3000,
    },
  };
});
