import React from 'react';
import ReactDOM from 'react-dom/client'; // שינוי הייבוא ל-client
import App from './App';

// הדרך החדשה לרנדר אפליקציה ב-React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);