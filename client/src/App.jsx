import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/Layout';
import { BookOpen } from 'lucide-react';

function PrivateRoute({ children, role }) {
    const { signed, loading, user } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

    if (!signed) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }

    return <Layout>{children}</Layout>;
}

function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-2xl text-gray-900">ConcursoPlanner</span>
                </div>
                <div className="space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Entrar</Link>
                    <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                        Começar Agora
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
                <div className="text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Sua aprovação começa com</span>
                        <span className="block text-indigo-600">organização inteligente</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Cronogramas automáticos baseados na sua disponibilidade real.
                        Estude o que importa, quando puder, e acompanhe seu progresso rumo à posse.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="rounded-md shadow">
                            <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all hover:scale-105">
                                Criar Cronograma Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
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

                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
