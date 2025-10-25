const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== RATE LIMITER (Proteksi DDoS ringan) =====
const limiter = rateLimit({
  windowMs: 60 * 1000, // batas waktu: 1 menit
  max: 10,             // maksimal 10 permintaan per menit per IP
  message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti.'
});
app.use(limiter); // aktifkan rate limiter ke semua endpoint
// ==============================================

const memoryHog = [];

function createLargeData() {
  return 'x'.repeat(1024 * 1024);
}

app.get('/', (req, res) => {
  try {
    const largeData = createLargeData();
    memoryHog.push(largeData);

    const memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
    res.send(`Data diterima! Total memori terpakai: ${memoryUsageMB.toFixed(2)} MB`);
  } catch (err) {
    res.status(500).send('Server kehabisan memori!');
  }
});

app.get('/status', (req, res) => {
  const items = memoryHog.length;
  const approxMB = (items * 1).toFixed(2);
  const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  res.json({ items, approxMB, memoryUsageMB });
});

app.post('/clear', (req, res) => {
  memoryHog.length = 0;
  global.gc && global.gc();
  const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  res.send(`Memory cleared. Heap used: ${memoryUsageMB} MB`);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
