/**
 * Local test proxy for testing subfolder deployment.
 *
 * This script creates a proxy server that simulates a reverse proxy
 * deploying the app at a subfolder (e.g., /help/).
 *
 * Usage:
 *   1. Start the Next.js dev server: pnpm dev
 *   2. In another terminal, run: node scripts/test-proxy.mjs
 *   3. Visit http://localhost:4000/help/
 *
 * You can customize the base path: node scripts/test-proxy.mjs /docs
 */

import http from 'node:http';

const BASE_PATH = process.argv[2] || '/help';
const TARGET_PORT = 3000;
const PROXY_PORT = 4000;

const server = http.createServer((clientReq, clientRes) => {
    let url = clientReq.url || '/';

    // Check if the request starts with the base path
    if (!url.startsWith(BASE_PATH) && !url.startsWith('/_next') && url !== '/favicon.ico') {
        clientRes.writeHead(404, { 'Content-Type': 'text/html' });
        clientRes.end(`
            <h1>404 - Not Found</h1>
            <p>This proxy serves content at <a href="${BASE_PATH}/">${BASE_PATH}/</a></p>
        `);
        return;
    }

    // Strip the base path before forwarding (but keep /_next as-is)
    if (url.startsWith(BASE_PATH)) {
        url = url.slice(BASE_PATH.length) || '/';
    }

    const options = {
        hostname: 'localhost',
        port: TARGET_PORT,
        path: url,
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            'x-base-path': BASE_PATH,
        },
    };

    const proxyReq = http.request(options, (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(clientRes, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
        clientRes.end(`Proxy error: ${err.message}\n\nMake sure the Next.js dev server is running on port ${TARGET_PORT}`);
    });

    clientReq.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('  Test Proxy for Subfolder Deployment');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  Base path:    ${BASE_PATH}`);
    console.log(`  Proxy URL:    http://localhost:${PROXY_PORT}${BASE_PATH}/`);
    console.log(`  Target:       http://localhost:${TARGET_PORT}/`);
    console.log('');
    console.log('  The proxy will:');
    console.log(`    1. Strip "${BASE_PATH}" from incoming requests`);
    console.log(`    2. Add "X-Base-Path: ${BASE_PATH}" header`);
    console.log(`    3. Forward to the Next.js dev server`);
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('='.repeat(60));
    console.log('');
});
