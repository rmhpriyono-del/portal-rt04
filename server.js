const path = require('path');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const port = process.env.PORT || 3000;
const database = new DatabaseSync(path.join(__dirname, 'portal-rt04.db'));

app.use(express.json());
app.use(express.static(__dirname));

database.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);

const announcementCount = database.prepare('SELECT COUNT(*) AS count FROM announcements').get().count;
if (announcementCount === 0) {
    const addAnnouncement = database.prepare('INSERT INTO announcements (tag, title, description, date) VALUES (?, ?, ?, ?)');
    addAnnouncement.run('Agenda', 'Kerja Bakti Minggu', 'Membersihkan area taman dan jalan lingkungan pada hari Sabtu pagi.', '12 Sep 2026');
    addAnnouncement.run('Rapat', 'Musyawarah Warga', 'Pembahasan rencana kegiatan sosial dan pengelolaan lingkungan RT/RW.', '15 Sep 2026');
    addAnnouncement.run('Penting', 'Pengumuman Kebijakan', 'Perubahan jadwal pengumpulan sampah dan program lingkungan baru.', '20 Sep 2026');
}

app.get('/api/announcements', (request, response) => {
    response.json(database.prepare('SELECT * FROM announcements ORDER BY id DESC').all());
});

app.post('/api/announcements', (request, response) => {
    const { tag, title, description, date } = request.body;
    if (![tag, title, description, date].every((value) => typeof value === 'string' && value.trim())) {
        return response.status(400).json({ error: 'Semua field pengumuman wajib diisi.' });
    }
    const result = database.prepare('INSERT INTO announcements (tag, title, description, date) VALUES (?, ?, ?, ?)').run(tag.trim(), title.trim(), description.trim(), date.trim());
    response.status(201).json(database.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/announcements/:id', (request, response) => {
    const { tag, title, description, date } = request.body;
    if (![tag, title, description, date].every((value) => typeof value === 'string' && value.trim())) {
        return response.status(400).json({ error: 'Semua field pengumuman wajib diisi.' });
    }
    const result = database.prepare('UPDATE announcements SET tag = ?, title = ?, description = ?, date = ? WHERE id = ?').run(tag.trim(), title.trim(), description.trim(), date.trim(), request.params.id);
    if (!result.changes) return response.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
    response.json(database.prepare('SELECT * FROM announcements WHERE id = ?').get(request.params.id));
});

app.delete('/api/announcements/:id', (request, response) => {
    const result = database.prepare('DELETE FROM announcements WHERE id = ?').run(request.params.id);
    if (!result.changes) return response.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
    response.status(204).send();
});

app.listen(port, () => {
    console.log(`Server Portal RT04 berhasil berjalan di http://localhost:${port}`);
});
