import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            api.defaults.headers.Authorization = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, token } = response.data;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(user);
    };

    const register = async (name, email, password) => {
        await api.post('/auth/register', { name, email, password });
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        api.defaults.headers.Authorization = undefined;
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
