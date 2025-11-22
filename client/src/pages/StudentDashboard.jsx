import React, { useState } from 'react';
import StudentScheduler from '../components/StudentScheduler';
import AvailabilitySlider from '../components/AvailabilitySlider';

export default function StudentDashboard() {
    const [userId, setUserId] = useState(1); // Hardcoded for demo
    const [hasAvailability, setHasAvailability] = useState(false);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Área do Aluno</h1>
            {!hasAvailability ? (
                <AvailabilitySlider userId={userId} onSave={() => setHasAvailability(true)} />
            ) : (
                <StudentScheduler userId={userId} />
            )}
        </div>
    );
}
