import React, { useState } from 'react';
import api from '../api';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AvailabilitySlider({ userId, onSave }) {
    const [availability, setAvailability] = useState(
        DAYS.map((day, index) => ({ weekDay: index, hoursPerDay: 2 }))
    );

    const handleChange = (index, value) => {
        const newAvail = [...availability];
        newAvail[index].hoursPerDay = parseInt(value);
        setAvailability(newAvail);
    };

    const handleSubmit = async () => {
        try {
            await api.post('/student/availability', { userId, availabilities: availability });
            // Also trigger initial schedule generation
            await api.post('/student/generate-schedule', { userId });
            onSave();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar disponibilidade');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Defina sua disponibilidade</h2>
            <p className="text-gray-600 mb-6">Quantas horas você pode estudar em cada dia da semana?</p>

            <div className="space-y-6">
                {availability.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <span className="w-24 font-medium">{DAYS[item.weekDay]}</span>
                        <input
                            type="range"
                            min="0"
                            max="12"
                            value={item.hoursPerDay}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="w-16 text-right font-bold text-indigo-600">{item.hoursPerDay}h</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
                Gerar Cronograma
            </button>
        </div>
    );
}
