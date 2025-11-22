import React, { useState } from 'react';
import api from '../api';
import { Plus, Trash2, Save, Book, Layers, FileText } from 'lucide-react';

export default function AdminCourseEditor({ initialData, onSaveSuccess }) {
    const [course, setCourse] = useState({
        title: '',
        description: '',
        subjects: []
    });

    React.useEffect(() => {
        if (initialData) {
            setCourse(initialData);
        }
    }, [initialData]);

    // ... (rest of the component)

    const handleSave = async () => {
        try {
            if (!course.title) return alert('O curso precisa de um título');
            await api.post('/admin/create-course', course);
            alert('Curso salvo com sucesso!');
            setCourse({ title: '', description: '', subjects: [] });
            if (onSaveSuccess) onSaveSuccess();
        } catch (error) {
            alert('Erro ao salvar curso');
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Course Details */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Curso</label>
                    <input
                        className="input-field"
                        placeholder="Ex: Polícia Federal - Agente"
                        value={course.title}
                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        className="input-field"
                        rows="3"
                        placeholder="Detalhes sobre o concurso..."
                        value={course.description}
                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    />
                </div>
            </div>

            {/* Subjects */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Book className="h-5 w-5 mr-2 text-indigo-600" />
                        Matérias
                    </h3>
                    <button
                        onClick={addSubject}
                        className="btn-secondary py-2 px-3 text-xs"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Matéria
                    </button>
                </div>

                {course.subjects.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">Nenhuma matéria adicionada ainda.</p>
                    </div>
                )}

                {course.subjects.map((subject, sIndex) => (
                    <div key={sIndex} className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative group">
                        <button
                            onClick={() => removeSubject(sIndex)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover Matéria"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                            <div className="md:col-span-6">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Matéria</label>
                                <input
                                    className="input-field bg-white"
                                    placeholder="Ex: Português"
                                    value={subject.name}
                                    onChange={(e) => updateSubject(sIndex, 'name', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cor</label>
                                <input
                                    type="color"
                                    className="h-10 w-full rounded cursor-pointer border border-gray-300 p-1 bg-white"
                                    value={subject.color}
                                    onChange={(e) => updateSubject(sIndex, 'color', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Peso (Prioridade)</label>
                                <input
                                    type="number"
                                    className="input-field bg-white"
                                    value={subject.weight}
                                    onChange={(e) => updateSubject(sIndex, 'weight', parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Topics */}
                        <div className="pl-4 border-l-2 border-indigo-200 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                    <Layers className="h-4 w-4 mr-2 text-indigo-400" />
                                    Tópicos
                                </h4>
                                <button
                                    onClick={() => addTopic(sIndex)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Novo Tópico
                                </button>
                            </div>

                            {subject.topics.map((topic, tIndex) => (
                                <div key={tIndex} className="flex items-center space-x-3">
                                    <div className="flex-grow">
                                        <input
                                            className="input-field py-1.5 text-sm"
                                            placeholder="Nome do Tópico"
                                            value={topic.name}
                                            onChange={(e) => updateTopic(sIndex, tIndex, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-28 relative">
                                        <input
                                            type="number"
                                            className="input-field py-1.5 text-sm pr-8"
                                            placeholder="Min"
                                            value={topic.estimatedMinutes}
                                            onChange={(e) => updateTopic(sIndex, tIndex, 'estimatedMinutes', parseInt(e.target.value))}
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                                            min
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeTopic(sIndex, tIndex)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleSave}
                    className="btn-primary px-8 py-3 text-base shadow-lg shadow-indigo-200"
                >
                    <Save className="h-5 w-5 mr-2" />
                    Salvar Curso Completo
                </button>
            </div>
        </div>
    );
}
