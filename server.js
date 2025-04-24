const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, password, email],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ 
                id: this.lastID,
                username,
                email
            });
        }
    );
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            res.json({
                id: user.id,
                username: user.username,
                email: user.email
            });
        }
    );
});

app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        'SELECT id, username, email FROM users WHERE id = ?',
        [id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
    );
});

app.put('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    
    db.run(
        'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
        [username, email, password, id],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ 
                id,
                username,
                email
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});