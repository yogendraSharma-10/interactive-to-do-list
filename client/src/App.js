import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

/**
 * Defines the base URL for the To-Do API.
 * It's crucial to use environment variables for API URLs in production
 * to allow easy configuration across different environments (dev, staging, prod).
 * This also supports a microservice architecture where each service might have
 * its own distinct endpoint.
 *
 * Fallback to 'http://localhost:5000/api' for local development if the environment
 * variable is not set.
 */
const API_BASE_URL = process.env.REACT_APP_TODO_API_URL || 'http://localhost:5000/api';

/**
 * The main application component for the Interactive To-Do List.
 * Manages the state of tasks, handles API interactions for CRUD operations,
 * and orchestrates the display of TaskForm and TaskList components.
 */
function App() {
  // State to hold the list of tasks fetched from the backend.
  const [tasks, setTasks] = useState([]);
  // State to manage the loading status during API calls.
  const [loading, setLoading] = useState(true);
  // State to store any error messages encountered during API calls.
  const [error, setError] = useState(null);

  /**
   * Fetches all tasks from the backend API.
   * This function is called on component mount to populate the initial task list.
   * It handles loading states and potential errors during the fetch operation.
   */
  const fetchTasks = async () => {
    setLoading(true); // Indicate that data fetching is in progress
    setError(null);   // Clear any previous errors
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        // If the response is not OK (e.g., 404, 500), throw an error.
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data); // Update the tasks state with fetched data
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Failed to load tasks. Please try again later."); // Set user-friendly error message
    } finally {
      setLoading(false); // End loading regardless of success or failure
    }
  };

  // useEffect hook to call fetchTasks once when the component mounts.
  // The empty dependency array `[]` ensures it runs only on the initial render.
  useEffect(() => {
    fetchTasks();
  }, []);

  /**
   * Handles adding a new task.
   * Sends a POST request to the backend with the new task's title.
   * On success, updates the local tasks state with the newly created task.
   * @param {string} title - The title of the new task to be added.
   */
  const handleAddTask = async (title) => {
    setError(null); // Clear any previous errors before a new operation
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }), // Send the title in the request body
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTask = await response.json();
      // Add the new task to the existing list of tasks
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (err) {
      console.error("Failed to add task:", err);
      setError("Failed to add task. Please check your input and try again.");
    }
  };

  /**
   * Handles toggling the completion status of a task.
   * Sends a PUT request to the backend to update the task's `completed` status.
   * On success, updates the local tasks state to reflect the change.
   * Includes optimistic UI update and a rollback mechanism for better user experience.
   * @param {string} id - The unique identifier of the task to toggle.
   */
  const handleToggleComplete = async (id) => {
    setError(null);
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return; // Should not happen if ID is valid

    // Create an updated task object with the toggled 'completed' status
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    // Optimistically update the UI first for a snappier feel
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? updatedTask : task))
    );

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask), // Send the updated task object
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // If the backend confirms, no further action needed as UI is already updated.
      // If backend returns the updated task, we could use that: const confirmedTask = await response.json();
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
      setError("Failed to update task status. Please try again.");
      // Revert the optimistic UI update if the API call fails
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? taskToUpdate : task))
      );
    }
  };

  /**
   * Handles deleting a task.
   * Sends a DELETE request to the backend for the specified task ID.
   * On success, removes the task from the local tasks state.
   * @param {string} id - The unique identifier of the task to delete.
   */
  const handleDeleteTask = async (id) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Filter out the deleted task from the local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Interactive To-Do List</h1>
        {/*
          Cross-project context:
          In a microservice ecosystem, users might navigate between different applications.
          These links demonstrate how other services could be referenced,
          using environment variables for their respective URLs.
        */}
        <p className="cross-project-link">
