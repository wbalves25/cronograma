import React, { useState } from 'react';
import AdminCourseEditor from '../components/AdminCourseEditor';
import CourseImporter from '../components/CourseImporter';
import CourseList from '../components/CourseList';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [importedCourse, setImportedCourse] = useState(null);
    const [refreshList, setRefreshList] = useState(0);

    const handleImport = (data) => {
        setImportedCourse(data);
    };

    const handleEdit = (course) => {
        setImportedCourse(course);
        // Scroll to top to see editor
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCourseSaved = () => {
        setRefreshList(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <header className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                    <p className="text-gray-500 mt-1">Gerencie cursos e editais.</p>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Editor de Cursos</h2>
                    <p className="text-sm text-gray-500">Crie novos cursos ou edite os existentes.</p>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <AdminCourseEditor
                                initialData={importedCourse}
                                onSaveSuccess={handleCourseSaved}
                            />
                        </div>
                        <div>
                            <CourseImporter onImport={handleImport} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Cursos Cadastrados</h2>
                    <p className="text-sm text-gray-500">Gerencie seus cursos ativos.</p>
                </div>
                <div className="p-6">
                    <CourseList onEdit={handleEdit} refreshTrigger={refreshList} />
                </div>
            </div>
        </div>
    );
}
