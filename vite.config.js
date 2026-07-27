import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFile } from 'node:fs/promises';

function siteGroundDefaultDocument() {
  return {
    name: 'siteground-default-document',
    apply: 'build',
    async closeBundle() {
      await copyFile('dist/index.html', 'dist/Default.html');
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000';

  return {
    plugins: [react(), siteGroundDefaultDocument()],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        ignored: ['**/.tools/**']
      },
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173
    }
  };
});
