const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://frontend-omega-one-34.vercel.app',
    /\.vercel\.app$/
  ]
}));
app.use(express.json());

// Init SQLite DB
const db = new Database(path.join(__dirname, 'todos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// GET all todos
app.get('/api/todos', (req, res) => {
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  res.json(todos.map(t => ({ ...t, completed: Boolean(t.completed) })));
});

// POST create todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const result = db.prepare('INSERT INTO todos (title) VALUES (?)').run(title.trim());
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...todo, completed: Boolean(todo.completed) });
});

// PATCH toggle todo
app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id);
  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json({ ...updated, completed: Boolean(updated.completed) });
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
