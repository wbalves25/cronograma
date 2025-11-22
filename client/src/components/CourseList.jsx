import React, { useEffect, useState } from 'react';
import api from '../api';
import { Book, Edit, Trash2, Clock, Layers, AlertCircle } from 'lucide-react';

export default function CourseList({ onEdit, refreshTrigger }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/admin/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este curso?')) {
            try {
                await api.delete(`/admin/courses/${id}`);
                fetchCourses();
            } catch (error) {
                alert('Erro ao excluir curso');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Carregando cursos...</div>;
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Book className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhum curso cadastrado ainda.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {courses.map((course) => (
                <div key={course.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>

                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                    <Book className="h-3 w-3 mr-1" />
                                    {course.subjects.length} Matérias
                                </span>
                                <span className="flex items-center">
                                    <Layers className="h-3 w-3 mr-1" />
                                    {course.subjects.reduce((acc, s) => acc + s.topics.length, 0)} Tópicos
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => onEdit(course)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(course.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
