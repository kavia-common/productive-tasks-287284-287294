import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import { listTodos, createTodo, updateTodo, deleteTodo } from './api';
import NewTodoForm from './components/NewTodoForm';
import TodoList from './components/TodoList';

// PUBLIC_INTERFACE
function App() {
  /** Todo application with Ocean Professional theme and optimistic updates. */
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [theme] = useState('light'); // fixed light themed per design

  // initialize theme colors on root for Ocean Professional
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', '#2563EB');
    root.style.setProperty('--color-secondary', '#F59E0B');
    root.style.setProperty('--color-error', '#EF4444');
    root.style.setProperty('--color-text', '#111827');
    root.style.setProperty('--color-bg', '#f9fafb');
    root.style.setProperty('--color-surface', '#ffffff');
    root.style.setProperty('--radius', '12px');
    root.style.setProperty('--shadow', '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)');
    root.style.setProperty('--shadow-sm', '0 2px 6px rgba(0,0,0,0.05)');
    root.style.setProperty('--transition', '200ms ease');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await listTodos();
        if (!cancelled) setTodos(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErrorMsg(e.message || 'Failed to load todos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextId = useMemo(() => {
    const nums = todos
      .map((t) => Number(t.id))
      .filter((n) => !Number.isNaN(n));
    return nums.length ? Math.max(...nums) + 1 : 1;
  }, [todos]);

  const rollback = (prev) => setTodos(prev);

  const handleAdd = async (todo) => {
    const prev = todos;
    const optimistic = { ...todo, id: todo.id ?? `tmp-${Date.now()}` };
    setTodos([optimistic, ...todos]);
    try {
      const created = await createTodo(todo);
      // replace optimistic with server entity if id differs
      setTodos((current) =>
        current.map((t) => (t.id === optimistic.id ? created : t))
      );
    } catch (e) {
      setErrorMsg(e.message || 'Failed to create todo');
      rollback(prev);
    }
  };

  const handleToggle = async (id, completed) => {
    const prev = todos;
    setTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await updateTodo(id, { completed });
    } catch (e) {
      setErrorMsg(e.message || 'Failed to update todo');
      rollback(prev);
    }
  };

  const handleEdit = async (id, updates) => {
    const prev = todos;
    setTodos((current) =>
      current.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    try {
      await updateTodo(id, updates);
    } catch (e) {
      setErrorMsg(e.message || 'Failed to update todo');
      rollback(prev);
    }
  };

  const handleDelete = async (id) => {
    const prev = todos;
    setTodos((current) => current.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (e) {
      setErrorMsg(e.message || 'Failed to delete todo');
      rollback(prev);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1 className="app-title">Tasks</h1>
          <p className="app-subtitle">Stay focused and organized</p>
        </div>
      </header>

      <main className="container">
        <section className="surface card">
          <NewTodoForm onAdd={handleAdd} />
          {errorMsg && (
            <div className="alert error" role="alert">
              {errorMsg}
            </div>
          )}
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <small>Theme: {theme}</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
