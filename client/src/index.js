//client\src\index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';

// Создание корневого элемента React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

// Оборачиваем приложение в React.StrictMode
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);