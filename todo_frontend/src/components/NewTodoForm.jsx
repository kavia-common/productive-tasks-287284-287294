import React, { useState } from 'react';
import PropTypes from 'prop-types';

// PUBLIC_INTERFACE
export default function NewTodoForm({ onAdd }) {
  /** Input form to create a new todo. */
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task');
      return;
    }
    setError('');
    await onAdd({ title: title.trim(), completed: false });
    setTitle('');
  };

  return (
    <form className="new-todo-form" onSubmit={submit}>
      <input
        className="todo-input"
        type="text"
        placeholder="What do you need to get done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="New todo title"
      />
      <button className="btn btn-primary btn-add" type="submit" aria-label="Add todo">
        Add
      </button>
      {error && <div className="error-text" role="alert">{error}</div>}
    </form>
  );
}

NewTodoForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
};
