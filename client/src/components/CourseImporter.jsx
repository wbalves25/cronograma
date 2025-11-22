import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../api';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader } from 'lucide-react';

export default function CourseImporter({ onSuccess }) {
    const [file, setFile] = useState(null);
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError('');

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Get array of arrays

                    let topicIndex = -1;
                    let subtopicIndex = -1;
                    let timeIndex = -1;
                    let headerFound = false;

                    const subjectsMap = {};

                    data.forEach((row, rowIndex) => {
                        // Try to find headers if not found yet
                        if (!headerFound) {
                            row.forEach((cell, index) => {
                                if (typeof cell === 'string') {
                                    const value = cell.trim().toLowerCase();
                                    if (value.includes('tópico') || value.includes('topico')) topicIndex = index;
                                    if (value.includes('subtópico') || value.includes('subtopico')) subtopicIndex = index;
                                    if (value === 'te' || value === 'tempo' || value === 'horas') timeIndex = index;
                                }
                            });

                            if (topicIndex !== -1 && subtopicIndex !== -1) {
                                headerFound = true;
                            }
                            return; // Skip the header row itself
                        }

                        // Process data rows
                        if (headerFound) {
                            const subjectName = row[topicIndex];
                            const topicName = row[subtopicIndex];
                            const hours = timeIndex !== -1 ? row[timeIndex] : 1; // Default 1h if column not found

                            if (subjectName && topicName) {
                                if (!subjectsMap[subjectName]) {
                                    subjectsMap[subjectName] = {
                                        name: subjectName,
                                        color: '#4F46E5',
                                        weight: 1,
                                        topics: []
                                    };
                                }

                                subjectsMap[subjectName].topics.push({
                                    name: topicName,
                                    estimatedMinutes: (parseFloat(hours) || 1) * 60
                                });
                            }
                        }
                    });

                    const subjects = Object.values(subjectsMap);
                    setPreview({
                        totalSubjects: subjects.length,
                        totalTopics: subjects.reduce((acc, s) => acc + s.topics.length, 0),
                        subjects: subjects
                    });

                } catch (err) {
                    console.error(err);
                    setError('Erro ao ler arquivo. Verifique se é um Excel válido.');
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    };

    const handleImport = async () => {
        if (!courseTitle) {
            setError('Por favor, digite um nome para o curso.');
            return;
        }
        if (!preview) {
            setError('Nenhum arquivo processado.');
            return;
        }

        setLoading(true);
        try {
            const courseData = {
                title: courseTitle,
                description: 'Importado via Excel',
                subjects: preview.subjects
            };

            await api.post('/admin/create-course', courseData);
            alert('Curso importado com sucesso!');
            setFile(null);
            setPreview(null);
            setCourseTitle('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError('Erro ao salvar curso no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
                Importar Excel
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curso</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Ex: Guarda Municipal - São José de Ribamar"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                    />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                            {file ? file.name : 'Clique ou arraste sua planilha aqui'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Formatos: .xlsx, .xls</p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                    </div>
                )}

                {preview && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-medium text-green-800 mb-2 flex items-center">
                            <Check className="h-4 w-4 mr-2" />
                            Arquivo Válido
                        </h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• {preview.totalSubjects} Matérias identificadas</li>
                            <li>• {preview.totalTopics} Tópicos encontrados</li>
                        </ul>
                    </div>
                )}

                <button
                    onClick={handleImport}
                    disabled={loading || !preview}
                    className={`btn-primary w-full ${loading || !preview ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <>
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Importando...
                        </>
                    ) : (
                        'Confirmar Importação'
                    )}
                </button>
            </div>
        </div>
    );
}
