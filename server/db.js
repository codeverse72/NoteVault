const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    avatar_gradient TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    pdf_path TEXT,
    pdf_name TEXT,
    views INTEGER DEFAULT 0,
    created_at INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    user_id TEXT,
    note_id TEXT,
    PRIMARY KEY(user_id, note_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(note_id) REFERENCES notes(id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT,
    following_id TEXT,
    PRIMARY KEY(follower_id, following_id),
    FOREIGN KEY(follower_id) REFERENCES users(id),
    FOREIGN KEY(following_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    user_id TEXT,
    badge_id TEXT,
    earned_at INTEGER,
    PRIMARY KEY(user_id, badge_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

/**
 * Seed initial data if tables are empty
 */
function seedInitialData(sampleUsers, sampleNotes) {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const insertUser = db.prepare(`
      INSERT INTO users (id, name, username, email, password_hash, bio, avatar_gradient, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const insertNote = db.prepare(`
      INSERT INTO notes (id, user_id, subject, class_level, topic, title, content, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const insertLike = db.prepare(`
        INSERT INTO likes (user_id, note_id) VALUES (?, ?)
    `);

        const insertFollow = db.prepare(`
        INSERT INTO follows (follower_id, following_id) VALUES (?, ?)
    `);

        const insertBadge = db.prepare(`
        INSERT INTO badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)
    `);

        db.transaction(() => {
            // Seed Users
            sampleUsers.forEach(u => {
                // u.passwordHash is from the demo simpleHash, we should ideally re-hash with bcrypt here
                // but for seeding we can just use a fixed hash or re-hash
                const hash = bcrypt.hashSync('demo123', 10);
                insertUser.run(u.id, u.name, u.username, u.email, hash, u.bio, u.avatar_gradient, Date.now());

                // Seed Badges
                u.badges.forEach(bId => {
                    insertBadge.run(u.id, bId, Date.now());
                });
            });

            // Seed Notes
            sampleNotes.forEach(n => {
                insertNote.run(n.id, n.userId, n.subject, n.classLevel, n.topic, n.title, n.content, n.views, n.createdAt);

                // Seed Likes
                n.likedBy.forEach(uId => {
                    insertLike.run(uId, n.id);
                });
            });

            // Seed Follows
            sampleUsers.forEach(u => {
                u.following.forEach(targetId => {
                    insertFollow.run(u.id, targetId);
                });
            });
        })();
        console.log('Database seeded successfully!');
    }
}

module.exports = { db, seedInitialData };
