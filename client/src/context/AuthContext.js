// client\src\context\AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'));

    // Функция для входа
    const login = () => {
        setIsLogged(true);
    };

    // Функция для выхода
    const logout = () => {
        localStorage.removeItem('token');
        setIsLogged(false);
    };

    return (
        <AuthContext.Provider value={{ isLogged, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};