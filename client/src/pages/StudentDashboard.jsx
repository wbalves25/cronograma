import React, { useState } from 'react';
import StudentScheduler from '../components/StudentScheduler';
import AvailabilitySlider from '../components/AvailabilitySlider';

import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [hasAvailability, setHasAvailability] = useState(false);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Área do Aluno</h1>
            {!hasAvailability ? (
                <AvailabilitySlider userId={user.id} onSave={() => setHasAvailability(true)} />
            ) : (
                <StudentScheduler userId={user.id} />
            )}
        </div>
    );
}
