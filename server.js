// server.js
// Demo: server yang sengaja "menguras" RAM untuk pengujian (lokal saja)

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Penampung global — setiap request menambah data di sini (menyebabkan penggunaan RAM meningkat)
const memoryHog = [];

// Buat ~1 MB data per panggilan
function createLargeData() {
  return 'x'.repeat(1024 * 1024); // 1 MB string
}

// Endpoint utama: menambah 1 MB ke memoryHog setiap kali dipanggil
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

// Endpoint tambahan: lihat ukuran memoryHog (jumlah item & perkiraan MB)
app.get('/status', (req, res) => {
  const items = memoryHog.length;
  const approxMB = (items * 1).toFixed(2); // tiap item ~1 MB
  const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  res.json({ items, approxMB, memoryUsageMB });
});

// Endpoint opsional: bersihkan memoryHog (reset) — gunakan hati-hati
app.post('/clear', (req, res) => {
  memoryHog.length = 0;
  global.gc && global.gc(); // jika node dijalankan dengan --expose-gc
  const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  res.send(`Memory cleared. Heap used: ${memoryUsageMB} MB`);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log('Catatan: server ini untuk pengujian lokal. Jangan jalankan di produksi.');
});
