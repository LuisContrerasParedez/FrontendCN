import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [key, value];
      })
  );
}

function loadProjectEnv(mode) {
  const productionPath = resolve(process.cwd(), '.env');
  const localPath = resolve(process.cwd(), '.env.local');

  if (!existsSync(productionPath)) {
    throw new Error('Falta .env con la configuracion de produccion.');
  }
  if (mode !== 'production' && !existsSync(localPath)) {
    throw new Error('Falta .env.local con la configuracion de desarrollo.');
  }

  const fileEnv = mode === 'production'
    ? parseEnvFile(productionPath)
    : { ...parseEnvFile(productionPath), ...parseEnvFile(localPath) };
  const runtimeEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key, value]) => key.startsWith('VITE_') && typeof value === 'string')
  );
  return { ...fileEnv, ...runtimeEnv };
}

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
  const env = loadProjectEnv(mode);
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080';
  const apiBaseUrl = (env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  const productionApiUrl = 'https://wspagina.centranorte.com.gt/api';

  if (mode === 'production' && apiBaseUrl !== productionApiUrl) {
    throw new Error(`En produccion VITE_API_BASE_URL debe ser ${productionApiUrl}.`);
  }

  if (mode === 'production' && env.VITE_SITE_URL && !env.VITE_SITE_URL.startsWith('https://')) {
    throw new Error('En produccion VITE_SITE_URL debe utilizar HTTPS.');
  }

  if (mode !== 'production' && apiBaseUrl !== '/api') {
    throw new Error('En desarrollo .env.local debe definir VITE_API_BASE_URL=/api.');
  }

  const exposedEnv = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
  );

  return {
    // Vite normalmente carga .env.local tambien durante build. Se desactiva
    // esa carga implicita para garantizar que produccion use solo .env.
    envDir: false,
    define: exposedEnv,
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
