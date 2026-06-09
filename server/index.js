const express = require('express');
const fs = require('fs').promises; // Use promise-based fs for async operations
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

// Load environment variables from .env file (if not in production)
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'; // Default client origin for development

// Path to the JSON file storing tasks
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

// --- Middleware ---
// Enable CORS for the client application
app.use(cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// --- Helper Functions for Data Persistence ---

/**
 * Reads tasks from the tasks.json file.
 * @returns {Promise<Array>} A promise that resolves to an array of tasks.
 */
async function readTasks() {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is empty/corrupt, return an empty array
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            console.warn('Tasks file not found or invalid. Initializing with empty array.');
            return [];
        }
        console.error('Error reading tasks file:', error);
        throw new Error('Failed to read tasks data.');
    }
}

/**
 * Writes tasks to the tasks.json file.
 * @param {Array} tasks - The array of tasks to write.
 * @returns {Promise<void>} A promise that resolves when the tasks are written.
 */
async function writeTasks(tasks) {
    try {
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing tasks file:', error);
        throw new Error('Failed to write tasks data.');
    }
}

// --- API Endpoints ---

/**
 * @route GET /api/tasks
 * @description Get all tasks
 * @access Public
 */
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching tasks.', error: error.message });
    }
});

/**
 * @route GET /api/tasks/:id
 * @description Get a single task by ID
 * @access Public
 */
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const tasks = await readTasks();
        const task = tasks.find(t => t.id === req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching task.', error: error.message });
    }
});

/**
 * @route POST /api/tasks
 * @description Add a new task
 * @access Public
 */
app.post('/api/tasks', async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: 'Task text is required and must be a non-empty string.' });
    }

    try {
        const tasks = await readTasks();
        const newTask = {
            id: uuidv4(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask); // 201 Created
    } catch (error) {
        res.status(500).json({ message: 'Server error adding task.', error: error.message });
    }
});

/**
 * @route PUT /api/tasks/:id
 * @description Update an existing task
 * @access Public
 */
app.put('/api/tasks/:id', async (req, res) => {
    const { text, completed } = req.body;
    const taskId = req.params.id;

    // Basic validation for update fields
    if (text !== undefined && (typeof text !== 'string' || text.trim() === '')) {
        return res.status(400).json({ message: 'Task text must be a non-empty string if provided.' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Task completed status must be a boolean if provided.' });
    }
    if (text === undefined && completed === undefined) {
        return res.status(400).json({ message: 'At least one field (text or completed) must be provided for update.' });
    }

    try {
        const tasks = await readTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const updatedTask = { ...tasks[taskIndex] };
        if (text !== undefined) {
            updatedTask.text = text.trim();
        }
        if (completed !== undefined) {
            updatedTask.completed = completed;
        }
        updatedTask.updatedAt = new Date().toISOString(); // Add an update timestamp

        tasks[taskIndex] = updatedTask;
        await writeTasks(tasks);
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating task.', error: error.message });
    }
});

/**
 * @route DELETE /api/tasks/:id
 * @description Delete a task
 * @access Public
 */
app.delete('/api/tasks/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const tasks = await readTasks();
        const initialLength = tasks.length;
        const updatedTasks = tasks.filter(t => t.id !== taskId);

        if (updatedTasks.length === initialLength) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        await writeTasks(updatedTasks);
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting task.', error: error.message });
    }
});

// --- Cross-Project Context / Microservice Mentions ---
// In a real microservice architecture, this To-Do List service might interact with:
// - A central User Service for authentication/authorization.
// - A Notification Service to send reminders for tasks.
// - A Logging/Monitoring Service for operational insights.
// - Potentially, other domain-specific services like a "Recipe Unit Converter"
//   if tasks involved cooking, or a "Personal Blog Platform" if tasks were
//   related to content creation.

// Example of a hypothetical endpoint for service discovery or health check
// In a real scenario, this might be more sophisticated, perhaps returning
// links to other services or health status.
app.get('/api/status', (req, res) => {
    const status = {
        service: 'Interactive To-Do List Backend',
        status: 'running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        // Hypothetical links to other services (not functional, just for context)
        related_services: {
            recipe_converter_api: process.env.RECIPE_CONVERTER_API_URL || 'http://localhost:8081/api/convert',
            blog_platform_api: process.env.BLOG_PLATFORM_API_URL || 'http://localhost:8082/api/posts',
            weather_dashboard_api: process.env.WEATHER_DASHBOARD_API_URL || 'http://localhost:8083/api/weather'
        },
        timestamp: new Date().toISOString()
    };
    res.json(status);
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`To-Do List Backend running on port ${PORT}`);
    console.log(`Client expected at: ${CLIENT_ORIGIN}`);
    // Ensure the data directory exists
    const dataDir = path.join(__dirname, 'data');
    fs.mkdir(dataDir, { recursive: true })
        .then(() => {
            // Ensure tasks.json exists and is valid JSON
            return fs.access(TASKS_FILE, fs.constants.F_OK)
                .catch(() => {
                    // File does not exist, create it with an empty array
                    return fs.writeFile(TASKS_FILE, '[]', 'utf8');
                });
        })
        .then(() => console.log('Data directory and tasks.json ensured.'))
        .catch(err => console.error('Failed to ensure data directory or tasks.json:', err));
});

// Export the app for testing purposes (optional)
module.exports = app;