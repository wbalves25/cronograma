import React, { useState } from 'react';
import StudentScheduler from '../components/StudentScheduler';
import AvailabilitySlider from '../components/AvailabilitySlider';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [hasAvailability, setHasAvailability] = useState(false);

    return (
        <div className="space-y-6">
            <header className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name} 👋</h1>
                <p className="text-gray-500 mt-1">Vamos organizar seus estudos hoje?</p>
            </header>

            {!hasAvailability ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-6">
                        <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                            <Clock className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Configure sua Disponibilidade</h2>
                            <p className="text-sm text-gray-500">Diga quantas horas você tem para estudar em cada dia.</p>
                        </div>
                    </div>
                    <AvailabilitySlider userId={user.id} onSave={() => setHasAvailability(true)} />
                </div>
            ) : (
                <StudentScheduler userId={user.id} />
            )}
        </div>
    );
}
