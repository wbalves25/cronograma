import React from 'react';
import AdminCourseEditor from '../components/AdminCourseEditor';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <header className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                    <p className="text-gray-500 mt-1">Gerencie cursos e editais.</p>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Criar Novo Curso</h2>
                    <p className="text-sm text-gray-500">Cadastre o edital verticalizado.</p>
                </div>
                <div className="p-6">
                    <AdminCourseEditor />
                </div>
            </div>
        </div>
    );
}
