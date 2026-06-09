import React from 'react';

/**
 * TaskList Component
 *
 * Displays a list of tasks, allowing users to mark them as complete or delete them.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.tasks - An array of task objects. Each task object should have at least `id`, `text`, and `completed` properties.
 * @param {function(string, boolean): void} props.onToggleComplete - Callback function to toggle the completion status of a task.
 *                                                                   Receives the task ID and the new completion status.
 * @param {function(string): void} props.onDeleteTask - Callback function to delete a task.
 *                                                      Receives the task ID.
 */
const TaskList = ({ tasks, onToggleComplete, onDeleteTask }) => {
  return (
    <div className="task-list-container">
      {tasks.length === 0 ? (
        <p className="no-tasks-message">No tasks yet! Add a new one above to get started.</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <span className="task-text">{task.text}</span>
              <div className="task-actions">
                <button
                  className="toggle-complete-button"
                  onClick={() => onToggleComplete(task.id, !task.completed)}
                  aria-label={task.completed ? `Mark "${task.text}" as incomplete` : `Mark "${task.text}" as complete`}
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  className="delete-button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`Delete task: "${task.text}"`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;