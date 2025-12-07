import React, { useState } from 'react';
import PropTypes from 'prop-types';

// PUBLIC_INTERFACE
export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  /** Renders a single todo item with edit and delete actions. */
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!draft.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    await onEdit(todo.id, { title: draft });
    setIsEditing(false);
  };

  return (
    <li className="todo-item">
      <div className="todo-main">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={!!todo.completed}
            onChange={() => onToggle(todo.id, !todo.completed)}
            aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          <span className={`checkmark ${todo.completed ? 'checked' : ''}`} />
        </label>

        {isEditing ? (
          <input
            className="todo-input-edit"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setDraft(todo.title);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>{todo.title}</span>
        )}
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="btn btn-primary" onClick={handleSave} aria-label="Save">Save</button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setDraft(todo.title);
                setIsEditing(false);
              }}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)} aria-label="Edit">Edit</button>
            <button
              className="btn btn-danger"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete"
              title="Delete"
            >
              Delete
            </button>
          </>
        )}
      </div>
      {error && <div className="error-text" role="alert">{error}</div>}
    </li>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
