import React, { useState } from 'react';

/**
 * @typedef {object} TaskFormProps
 * @property {(taskText: string) => Promise<void>} onAddTask - Callback function to add a new task.
 */

/**
 * TaskForm component for adding new tasks to the To-Do list.
 * Manages the input field state and handles form submission.
 *
 * @param {TaskFormProps} props - The properties for the component.
 * @returns {JSX.Element} The TaskForm component.
 */
function TaskForm({ onAddTask }) {
  // State to hold the current value of the new task input field
  const [newTaskText, setNewTaskText] = useState('');
  // State to manage loading status during task addition
  const [isLoading, setIsLoading] = useState(false);
  // State to manage potential errors during task addition
  const [error, setError] = useState(null);

  /**
   * Handles changes to the input field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object.
   */
  const handleInputChange = (e) => {
    setNewTaskText(e.target.value);
    // Clear any previous errors when the user starts typing again
    if (error) setError(null);
  };

  /**
   * Handles the form submission event.
   * Prevents default form behavior, validates input, and calls the onAddTask prop.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission and page reload

    const trimmedTaskText = newTaskText.trim();

    // Basic validation: ensure the task text is not empty
    if (!trimmedTaskText) {
      setError('Task description cannot be empty.');
      return;
    }

    setIsLoading(true); // Set loading state
    setError(null); // Clear previous errors

    try {
      // Call the parent component's function to add the task
      await onAddTask(trimmedTaskText);
      setNewTaskText(''); // Clear the input field after successful submission
    } catch (err) {
      console.error('Failed to add task:', err);
      // Display a user-friendly error message
      setError('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        placeholder="Add a new task..."
        value={newTaskText}
        onChange={handleInputChange}
        disabled={isLoading} // Disable input while loading
        aria-label="New task description"
      />
      <button
        type="submit"
        className="add-button"
        disabled={isLoading || !newTaskText.trim()} // Disable button if loading or input is empty
        aria-label="Add task"
      >
        {isLoading ? 'Adding...' : 'Add Task'}
      </button>
      {/* Display error message if any */}
      {error && <p className="error-message" role="alert">{error}</p>}
    </form>
  );
}

export default TaskForm;