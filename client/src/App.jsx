import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <nav className="bg-white shadow-sm p-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <Link to="/" className="text-xl font-bold text-indigo-600">ConcursoPlanner</Link>
                        <div className="space-x-4">
                            <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin</Link>
                            <Link to="/student" className="text-gray-600 hover:text-indigo-600">Student</Link>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto p-4">
                    <Routes>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/student" element={<StudentDashboard />} />
                        <Route path="/" element={
                            <div className="text-center mt-20">
                                <h1 className="text-4xl font-bold mb-4">Bem-vindo ao ConcursoPlanner</h1>
                                <p className="text-gray-600 mb-8">Selecione seu perfil acima para começar.</p>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
