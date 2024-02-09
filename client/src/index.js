import React from 'react';
import ReactDOM from 'react-dom/client'; // Using createRoot for React 18+
import './index.css'; // Global styles, if any, otherwise App.css handles most
import App from './App';
import reportWebVitals from './reportWebVitals'; // For performance monitoring

/**
 * The main entry point for the React client application.
 * This file initializes the React application and mounts the root component (`App`)
 * into the DOM element with the ID 'root' in `public/index.html`.
 */

// Get the root DOM element where the React app will be mounted.
const container = document.getElementById('root');

// Create a React root using ReactDOM.createRoot for React 18+.
// This enables concurrent features and improved performance.
const root = ReactDOM.createRoot(container);

// Render the main App component into the root.
// React.StrictMode is used to highlight potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();