import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { defineConfig, type Plugin } from 'vite';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function hamokshaViteEntryPlugin(isBuild: boolean): Plugin {
  let capturedCss = '';
  let capturedJs = '';

  return {
    name: 'hamoksha-vite-entry',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const cleaned = html
          .replace(/<!-- START_STANDALONE_STYLE -->[\s\S]*?<!-- END_STANDALONE_STYLE -->/g, '')
          .replace(/<!-- START_STANDALONE_BUNDLE -->[\s\S]*?<!-- END_STANDALONE_BUNDLE -->/g, '');
        if (cleaned.includes('/src/main.tsx')) {
          return cleaned;
        }
        return cleaned.replace(
          '</body>',
          `  <script type="module" src="/src/main.tsx"></script>\n  </body>`
        );
      },
    },
    generateBundle(_options, bundle) {
      if (!isBuild) return;
      const cssParts: string[] = [];
      const jsParts: string[] = [];

      for (const item of Object.values(bundle)) {
        if (item.type === 'asset' && item.fileName.endsWith('.css')) {
          cssParts.push(typeof item.source === 'string' ? item.source : Buffer.from(item.source).toString('utf-8'));
        } else if (item.type === 'chunk' && item.isEntry) {
          jsParts.push(item.code);
        }
      }

      if (cssParts.length > 0) capturedCss = cssParts.join('\n');
      if (jsParts.length > 0) capturedJs = jsParts.join('\n');
    },
    closeBundle() {
      if (!isBuild) return;
      const tempPayloadPath = path.join(currentDir, 'dist', '.standalone-capture.json');
      fs.mkdirSync(path.dirname(tempPayloadPath), { recursive: true });
      fs.writeFileSync(
        tempPayloadPath,
        JSON.stringify({ css: capturedCss, js: capturedJs }),
        'utf-8'
      );
      try {
        execFileSync(process.execPath, [path.resolve(currentDir, 'scripts/build-standalone.mjs')], {
          cwd: currentDir,
          stdio: 'inherit',
        });
      } finally {
        if (fs.existsSync(tempPayloadPath)) {
          fs.unlinkSync(tempPayloadPath);
        }
      }
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    base: './',
    plugins: [hamokshaViteEntryPlugin(command === 'build'), react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        '@': path.resolve(currentDir, '.'),
      },
    },
    build: {
      assetsInlineLimit: 100000000,
      cssCodeSplit: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
