/**
 * Determine API base URL:
 * - If REACT_APP_API_BASE is set, use it (e.g., http://localhost:3001/api for local dev).
 * - Otherwise default to relative "/api" so production/preview can be same-origin
 *   with the backend behind a reverse proxy or path-based routing.
 */
const API_BASE = (process.env.REACT_APP_API_BASE || '/api').replace(/\/+$/, '');

const LOG_LEVEL = (process.env.REACT_APP_LOG_LEVEL || 'info').toLowerCase();
const FEATURE_FLAGS = (() => {
  try {
    const raw = process.env.REACT_APP_FEATURE_FLAGS;
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    // fallback: comma separated flags "a,b,c"
    const raw = (process.env.REACT_APP_FEATURE_FLAGS || '').trim();
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
  }
})();

function log(level, ...args) {
  const levels = ['error', 'warn', 'info', 'debug'];
  const currentIdx = levels.indexOf(LOG_LEVEL);
  const levelIdx = levels.indexOf(level);
  if (levelIdx <= currentIdx) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](...args);
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };
  log('debug', '[api] request', fetchOptions.method, url, fetchOptions.body || '');
  const res = await fetch(url, fetchOptions);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.data = data;
    log('error', '[api] error', err);
    throw err;
  }
  log('debug', '[api] response', data);
  return data;
}

// PUBLIC_INTERFACE
export async function listTodos() {
  /** Returns an array of todos from GET /todos */
  return request('/todos', { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function createTodo(todo) {
  /** Creates a todo via POST /todos, expects { title, completed? } */
  return request('/todos', { method: 'POST', body: todo });
}

// PUBLIC_INTERFACE
export async function updateTodo(id, updates) {
  /** Updates a todo via PUT /todos/{id} */
  return request(`/todos/${encodeURIComponent(id)}`, { method: 'PUT', body: updates });
}

// PUBLIC_INTERFACE
export async function deleteTodo(id) {
  /** Deletes a todo via DELETE /todos/{id} */
  return request(`/todos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export const _internal = { API_BASE, FEATURE_FLAGS, LOG_LEVEL };
