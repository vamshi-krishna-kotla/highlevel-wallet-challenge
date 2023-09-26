// import required dependencies
import React from 'react';

/**
 * render() method of ReactDOM puts the Component
 * to the target element on the DOM
 * 
 * hydrate() method of ReactDOM checks if the Component template HTML
 * is already present (example as in SSR), then sets up the required
 * listeners based on the Component and children scripts
 * 
 */
import { hydrate, render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

// import application component
import App from './App.jsx';

// fetch the root container of the application
let root = document.getElementById('root');

/**
 * if there are children to the root element, it indicates that
 * the HTML has been server-side rendered (production mode)
 * and "hydrate" needs to be called
 * 
 * if there are no children, it means the app is running in development mode
 * and hence "render" needs to be called
 * 
 */
root.children[0]
    ? hydrate(<BrowserRouter><App /></BrowserRouter>, root)
    : render(<BrowserRouter><App /></BrowserRouter>, root);
