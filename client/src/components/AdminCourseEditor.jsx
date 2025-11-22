import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '../api';

export default function AdminCourseEditor() {
    const [course, setCourse] = useState({
        title: '',
        description: '',
        subjects: []
    });

    const addSubject = () => {
        setCourse({
            ...course,
            subjects: [
                ...course.subjects,
                { name: '', color: '#3b82f6', weight: 1, topics: [] }
            ]
        });
    };

    const updateSubject = (index, field, value) => {
        const newSubjects = [...course.subjects];
        newSubjects[index][field] = value;
        setCourse({ ...course, subjects: newSubjects });
    };

    const addTopic = (subjectIndex) => {
        const newSubjects = [...course.subjects];
        newSubjects[subjectIndex].topics.push({
            name: '',
            estimatedMinutes: 60
        });
        setCourse({ ...course, subjects: newSubjects });
    };

    const updateTopic = (subjectIndex, topicIndex, field, value) => {
        const newSubjects = [...course.subjects];
        newSubjects[subjectIndex].topics[topicIndex][field] = value;
        setCourse({ ...course, subjects: newSubjects });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/admin/create-course', course);
            alert('Curso criado com sucesso!');
            setCourse({ title: '', description: '', subjects: [] });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar curso');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Título do Curso</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                />
            </div>

            <div className="space-y-6">
                {course.subjects.map((subject, sIndex) => (
                    <div key={sIndex} className="border p-4 rounded-md bg-gray-50">
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Nome da Matéria"
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={subject.name}
                                onChange={(e) => updateSubject(sIndex, 'name', e.target.value)}
                            />
                            <input
                                type="color"
                                className="h-9 w-9 rounded cursor-pointer"
                                value={subject.color}
                                onChange={(e) => updateSubject(sIndex, 'color', e.target.value)}
                            />
                        </div>

                        <div className="pl-4 space-y-2">
                            {subject.topics.map((topic, tIndex) => (
                                <div key={tIndex} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Nome do Tópico"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={topic.name}
                                        onChange={(e) => updateTopic(sIndex, tIndex, 'name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={topic.estimatedMinutes}
                                        onChange={(e) => updateTopic(sIndex, tIndex, 'estimatedMinutes', parseInt(e.target.value))}
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => addTopic(sIndex)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                <Plus size={16} /> Adicionar Tópico
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={addSubject}
                    className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                    <Plus size={20} /> Nova Matéria
                </button>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Save size={20} /> Salvar Curso
                </button>
            </div>
        </div>
    );
}
