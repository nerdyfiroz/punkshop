import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = parsedUrl.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
          const routeName = pathname.split('/')[0] || '';

          // Match routes: auth, videos, stream, download, storage, media, status
          const validRoutes = ['auth', 'videos', 'stream', 'download', 'storage', 'media', 'status', 'db'];
          if (!validRoutes.includes(routeName)) {
            return next();
          }

          // Polyfill res.status and res.json for Vercel Serverless Function compatibility
          res.status = function (code: number) {
            res.statusCode = code;
            return res;
          };

          res.json = function (data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          res.redirect = function (statusOrUrl: number | string, optUrl?: string) {
            const status = typeof statusOrUrl === 'number' ? statusOrUrl : 302;
            const target = typeof statusOrUrl === 'string' ? statusOrUrl : optUrl || '/';
            res.statusCode = status;
            res.setHeader('Location', target);
            res.end();
            return res;
          };

          req.query = Object.fromEntries(parsedUrl.searchParams.entries());

          // Parse JSON body if present
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            if (bodyStr.trim()) {
              try {
                req.body = JSON.parse(bodyStr);
              } catch {
                req.body = bodyStr;
              }
            } else {
              req.body = {};
            }
          }

          // Dynamically load the TypeScript API handler
          const modulePath = path.resolve(__dirname, `api/${routeName}.ts`);
          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod.default || mod;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(500).json({ error: `Handler for /api/${routeName} not found` });
          }
        } catch (error: any) {
          console.error('API Dev Server Error:', error);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      // Never expose ADMIN_PASSWORD in client bundle
      'import.meta.env.ADMIN_USERNAME': JSON.stringify(env.ADMIN_USERNAME || env.VITE_ADMIN_USERNAME || 'admin'),
      'import.meta.env.R2_BUCKET': JSON.stringify(env.R2_BUCKET || env.VITE_R2_BUCKET || 'punkshop'),
    },
    envPrefix: ['VITE_'],
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
