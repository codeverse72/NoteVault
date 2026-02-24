require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, seedInitialData } = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage for Multer (PDFs)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

// --- Auth Endpoints ---
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, username, avatarGradient } = req.body;
    try {
        const id = 'user_' + Date.now();
        const hash = bcrypt.hashSync(password, 10);
        const createdAt = Date.now();

        db.prepare(`
      INSERT INTO users (id, name, username, email, password_hash, bio, avatar_gradient, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, username, email, hash, 'New member! 🎉', avatarGradient, createdAt);

        const token = jwt.sign({ id, email, name }, JWT_SECRET);
        res.json({ success: true, token, user: { id, name, username, email, avatarGradient } });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Email or username already exists' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, username: user.username, email: user.email, bio: user.bio, avatarGradient: user.avatar_gradient }
    });
});

// --- Notes Endpoints ---
app.get('/api/notes', (req, res) => {
    const { subject, classLevel, topic, search, sort, userId } = req.query;
    let query = 'SELECT n.*, u.name as authorName, u.avatar_gradient as authorGradient, u.username as authorUsername FROM notes n JOIN users u ON n.user_id = u.id WHERE 1=1';
    const params = [];

    if (subject) { query += ' AND n.subject = ?'; params.push(subject); }
    if (classLevel) { query += ' AND n.class_level = ?'; params.push(classLevel); }
    if (topic) { query += ' AND n.topic = ?'; params.push(topic); }
    if (userId) { query += ' AND n.user_id = ?'; params.push(userId); }
    if (search) {
        query += ' AND (n.title LIKE ? OR n.content LIKE ? OR n.topic LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    if (sort === 'likes') query += ' ORDER BY (SELECT COUNT(*) FROM likes WHERE note_id = n.id) DESC';
    else if (sort === 'views') query += ' ORDER BY n.views DESC';
    else query += ' ORDER BY n.created_at DESC';

    const notes = db.prepare(query).all(params);

    // Attach like status and counts
    const results = notes.map(note => {
        const likes = db.prepare('SELECT user_id FROM likes WHERE note_id = ?').all(note.id).map(l => l.user_id);
        return {
            ...note,
            classLevel: note.class_level, // mapping back for frontend
            createdAt: note.created_at,
            pdfPath: note.pdf_path,
            pdfName: note.pdf_name,
            likes: likes.length,
            likedBy: likes
        };
    });

    res.json(results);
});

app.get('/api/notes/:id', (req, res) => {
    db.prepare('UPDATE notes SET views = views + 1 WHERE id = ?').run(req.params.id);
    const note = db.prepare('SELECT n.*, u.name as authorName, u.avatar_gradient as authorGradient, u.username as authorUsername FROM notes n JOIN users u ON n.user_id = u.id WHERE n.id = ?').get(req.params.id);

    if (!note) return res.status(404).json({ error: 'Note not found' });

    const likes = db.prepare('SELECT user_id FROM likes WHERE note_id = ?').all(note.id).map(l => l.user_id);
    res.json({
        ...note,
        classLevel: note.class_level,
        createdAt: note.created_at,
        pdfPath: note.pdf_path,
        pdfName: note.pdf_name,
        likes: likes.length,
        likedBy: likes
    });
});

app.post('/api/notes', authenticateToken, upload.single('pdf'), (req, res) => {
    const { subject, classLevel, topic, title, content } = req.body;
    const id = 'note_' + Date.now();
    const userId = req.user.id;
    const createdAt = Date.now();
    const pdfPath = req.file ? `/uploads/${req.file.filename}` : null;
    const pdfName = req.file ? req.file.originalname : null;

    db.prepare(`
    INSERT INTO notes (id, user_id, subject, class_level, topic, title, content, pdf_path, pdf_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, subject, classLevel, topic, title, content, pdfPath, pdfName, createdAt);

    res.json({ success: true, id });
});

app.post('/api/notes/:id/like', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;

    const existing = db.prepare('SELECT * FROM likes WHERE user_id = ? AND note_id = ?').get(userId, noteId);
    if (existing) {
        db.prepare('DELETE FROM likes WHERE user_id = ? AND note_id = ?').run(userId, noteId);
    } else {
        db.prepare('INSERT INTO likes (user_id, note_id) VALUES (?, ?)').run(userId, noteId);
    }

    const likes = db.prepare('SELECT COUNT(*) as count FROM likes WHERE note_id = ?').get(noteId).count;
    res.json({ success: true, likes });
});

// --- User/Profile Endpoints ---
app.get('/api/users/:id', (req, res) => {
    const user = db.prepare('SELECT id, name, username, email, bio, avatar_gradient as avatarGradient FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const followers = db.prepare('SELECT follower_id FROM follows WHERE following_id = ?').all(user.id).map(f => f.follower_id);
    const following = db.prepare('SELECT following_id FROM follows WHERE follower_id = ?').all(user.id).map(f => f.following_id);
    const earnedBadges = db.prepare('SELECT badge_id FROM badges WHERE user_id = ?').all(user.id).map(b => b.badge_id);

    res.json({ ...user, followers, following, badges: earnedBadges });
});

app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;
    if (followerId === followingId) return res.status(400).json({ error: 'Cannot follow yourself' });

    const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, followingId);
    if (existing) {
        db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
    } else {
        db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, followingId);
    }

    res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
    const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalSubjects = db.prepare('SELECT COUNT(DISTINCT subject) as count FROM notes').get().count;
    const totalLikes = db.prepare('SELECT COUNT(*) as count FROM likes').get().count;

    res.json({ totalNotes, totalUsers, totalSubjects, totalLikes });
});

// Initial Seeding from client data (hardcoded simplified version for now)
const sampleUsers = [
    { id: 'user_1', name: 'Demo User', username: '@demo', email: 'demo@notevault.com', bio: 'Passionate learner!', avatar_gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', followers: [], following: [], badges: ['first_note'] }
];
const sampleNotes = [
    { id: 'note_1', userId: 'user_1', subject: 'math', classLevel: '11', topic: 'Calculus', title: 'Introduction to Limits', content: 'Understanding limits is key...', views: 42, createdAt: Date.now(), likedBy: [] }
];

seedInitialData(sampleUsers, sampleNotes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
