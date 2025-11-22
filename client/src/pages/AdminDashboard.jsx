import React from 'react';
import AdminCourseEditor from '../components/AdminCourseEditor';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Painel do Administrador</h1>
            <AdminCourseEditor />
        </div>
    );
}
