import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as api from '../api';
import App from '../App';

jest.mock('../api');

function setupList(initial = []) {
  api.listTodos.mockResolvedValueOnce(initial);
}

describe('Todo App', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders empty state and allows adding a todo', async () => {
    setupList([]);
    const created = { id: 1, title: 'Test task', completed: false };
    api.createTodo.mockResolvedValueOnce(created);

    render(<App />);

    // initial load
    await waitFor(() => expect(api.listTodos).toHaveBeenCalled());

    expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();

    const input = screen.getByLabelText(/New todo title/i);
    const addButton = screen.getByRole('button', { name: /add todo/i });
    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    await waitFor(() => expect(api.createTodo).toHaveBeenCalledWith({ title: 'Test task', completed: false }));
    expect(await screen.findByText('Test task')).toBeInTheDocument();
  });

  test('toggle completion and edit title', async () => {
    setupList([{ id: 2, title: 'Existing', completed: false }]);
    api.updateTodo.mockResolvedValue({}); // used for both toggle and edit

    render(<App />);
    await waitFor(() => expect(api.listTodos).toHaveBeenCalled());

    const checkbox = screen.getByRole('checkbox', { name: /mark existing as complete/i });
    fireEvent.click(checkbox);
    await waitFor(() => expect(api.updateTodo).toHaveBeenCalledWith(2, { completed: true }));

    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);
    const editInput = screen.getByDisplayValue('Existing');
    fireEvent.change(editInput, { target: { value: 'Updated' } });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => expect(api.updateTodo).toHaveBeenCalledWith(2, { title: 'Updated' }));
    expect(await screen.findByText('Updated')).toBeInTheDocument();
  });

  test('delete a todo', async () => {
    setupList([{ id: 3, title: 'To delete', completed: false }]);
    api.deleteTodo.mockResolvedValue({});

    render(<App />);
    await waitFor(() => expect(api.listTodos).toHaveBeenCalled());

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(api.deleteTodo).toHaveBeenCalledWith(3));
    await waitFor(() => expect(screen.queryByText('To delete')).not.toBeInTheDocument());
  });
});
