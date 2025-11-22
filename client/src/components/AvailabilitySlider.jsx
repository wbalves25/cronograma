import React, { useState } from 'react';
import api from '../api';
import { Save, Clock } from 'lucide-react';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AvailabilitySlider({ userId, onSave }) {
    const [hours, setHours] = useState(Array(7).fill(0));
    const [loading, setLoading] = useState(false);

    const handleChange = (index, value) => {
        const newHours = [...hours];
        newHours[index] = parseInt(value);
        setHours(newHours);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const availabilityData = hours.map((h, i) => ({
                weekDay: i,
                hoursPerDay: h
            }));

            await api.post('/student/availability', {
                userId,
                availability: availabilityData
            });

            await api.post('/student/generate-schedule', { userId });
            onSave();
        } catch (error) {
            alert('Erro ao salvar disponibilidade.');
        } finally {
            setLoading(false);
        }
    };

    const totalHours = hours.reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS.map((day, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium text-gray-700">{day}</label>
                            <span className={`text-sm font-bold ${hours[index] > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {hours[index]}h
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="1"
                            value={hours[index]}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                ))}
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between border border-indigo-100">
                <div className="flex items-center mb-4 sm:mb-0">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-indigo-600">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-indigo-600 font-medium">Total Semanal</p>
                        <p className="text-2xl font-bold text-indigo-900">{totalHours} horas</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || totalHours === 0}
                    className={`btn-primary px-8 py-3 ${loading || totalHours === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Gerando Cronograma...' : 'Salvar e Gerar Cronograma'}
                    {!loading && <Save className="ml-2 h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}
