import React from 'react';
import PropTypes from 'prop-types';
import TodoItem from './TodoItem';

// PUBLIC_INTERFACE
export default function TodoList({ todos, onToggle, onDelete, onEdit }) {
  /** Renders the list of todos with actions. */
  if (!todos.length) {
    return <div className="empty-state">No todos yet. Add your first task!</div>;
  }
  return (
    <ul className="todo-list">
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
