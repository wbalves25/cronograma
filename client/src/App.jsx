import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function PrivateRoute({ children, role }) {
    const { signed, loading, user } = useAuth();

    if (loading) return <div>Carregando...</div>;

    if (!signed) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
}

function Navigation() {
    const { signed, logout, user } = useAuth();

    return (
        <nav className="bg-white shadow-sm p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">ConcursoPlanner</Link>
                <div className="space-x-4 flex items-center">
                    {signed ? (
                        <>
                            <span className="text-gray-600">Olá, {user.name}</span>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin</Link>
                            )}
                            <Link to="/student" className="text-gray-600 hover:text-indigo-600">Estudar</Link>
                            <button onClick={logout} className="text-red-600 hover:text-red-800">Sair</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600">Entrar</Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Cadastrar</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                    <Navigation />
                    <main className="max-w-7xl mx-auto p-4">
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            <Route path="/admin" element={
                                <PrivateRoute role="admin">
                                    <AdminDashboard />
                                </PrivateRoute>
                            } />

                            <Route path="/student" element={
                                <PrivateRoute>
                                    <StudentDashboard />
                                </PrivateRoute>
                            } />

                            <Route path="/" element={
                                <div className="text-center mt-20">
                                    <h1 className="text-4xl font-bold mb-4">Bem-vindo ao ConcursoPlanner</h1>
                                    <p className="text-gray-600 mb-8">Organize seus estudos e passe no concurso dos sonhos.</p>
                                    <Link to="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-indigo-700">
                                        Começar Agora
                                    </Link>
                                </div>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
