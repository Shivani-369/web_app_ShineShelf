const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms.db');
const db = new Database(dbPath);

const users = db.prepare('SELECT id, username, email FROM users').all();
console.log('Users:', users);
