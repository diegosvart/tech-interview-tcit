import http from 'node:http';

const baseUrl = process.env.SANITY_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

function request(path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(baseUrl + path, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const health = await request('/api/v1/health');
    if (health.status !== 200) {
      console.error(`[SANITY] Health failed: ${health.status} ${health.body}`);
      process.exit(1);
    }
    console.log(`[SANITY] Health OK: ${health.body}`);

    const notFound = await request('/api/v1/__not_found__');
    if (notFound.status !== 404) {
      console.error(`[SANITY] 404 failed: ${notFound.status} ${notFound.body}`);
      process.exit(2);
    }
    console.log(`[SANITY] 404 OK: ${notFound.status}`);

    process.exit(0);
  } catch (err) {
    console.error('[SANITY] Error:', err);
    process.exit(99);
  }
})();
