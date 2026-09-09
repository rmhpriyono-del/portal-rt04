const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Untuk dijalankan di komputer lokal (saat pakai npm start)
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });
}

// PENTING: Ekspor aplikasi agar bisa dibaca oleh Vercel
module.exports = app;