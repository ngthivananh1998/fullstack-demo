'use client';

import { useState, useEffect } from 'react';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const res = await fetch(`${API}/todos`);
      const data = await res.json();
      setTodos(data);
    } catch {
      setError('Cannot connect to backend. Make sure backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: input }),
    });
    if (res.ok) {
      const todo = await res.json();
      setTodos([todo, ...todos]);
      setInput('');
    }
  }

  async function toggleTodo(todo: Todo) {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
    }
  }

  async function deleteTodo(id: number) {
    const res = await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTodos(todos.filter(t => t.id !== id));
    }
  }

  const completed = todos.filter(t => t.completed).length;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo App</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Next.js + Node.js + SQLite &nbsp;·&nbsp; {completed}/{todos.length} completed
        </p>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Add a new task..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tasks yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <span
                  className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
