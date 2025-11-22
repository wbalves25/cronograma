import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, RefreshCw, Play, Pause } from 'lucide-react';
import api from '../api';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function StudentScheduler({ userId }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pomodoro State
    const [timer, setTimer] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [userId]);

    useEffect(() => {
        let interval = null;
        if (isActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(timer => timer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsActive(false);
            alert("Pomodoro finished!");
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/student/tasks/${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (taskId) => {
        try {
            await api.post('/student/complete-task', { taskId });
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRecalculate = async () => {
        try {
            setLoading(true);
            await api.post('/student/recalculate', { userId });
            await fetchTasks();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        if (!task.scheduledDate) return acc;
        const dateKey = format(parseISO(task.scheduledDate), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
        return acc;
    }, {});

    return (
        <div className="flex gap-6">
            {/* Main Schedule Area */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Seu Cronograma</h2>
                    <button
                        onClick={handleRecalculate}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200"
                    >
                        <RefreshCw size={16} /> Recalcular Atrasos
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Carregando...</div>
                ) : (
                    <div className="space-y-6">
                        {Object.keys(groupedTasks).sort().map(date => {
                            const dateObj = parseISO(date);
                            const isLate = isPast(dateObj) && !isToday(dateObj);

                            return (
                                <div key={date} className={`border rounded-lg overflow-hidden ${isLate ? 'border-red-200' : 'border-gray-200'}`}>
                                    <div className={`px-4 py-2 font-medium flex justify-between ${isLate ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                                        <span>{format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                                        {isLate && <span className="text-xs bg-red-200 px-2 py-1 rounded">Atrasado</span>}
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {groupedTasks[date].map(task => (
                                            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div>
                                                    <div className="font-medium text-gray-900">{task.topic.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: task.topic.subject.color }}
                                                        />
                                                        {task.topic.subject.name} • {task.topic.estimatedMinutes} min
                                                    </div>
                                                </div>

                                                {task.status === 'done' ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <CheckCircle size={20} /> Concluído
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleComplete(task.id)}
                                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                                    >
                                                        <CheckCircle size={24} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="w-80 space-y-6">
                {/* Pomodoro Widget */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4 text-indigo-900">
                        <Clock size={20} />
                        <h3 className="font-bold">Pomodoro</h3>
                    </div>
                    <div className="text-4xl font-mono text-center mb-6 font-bold text-indigo-600">
                        {formatTime(timer)}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                            {isActive ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button
                            onClick={() => { setIsActive(false); setTimer(25 * 60); }}
                            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw size={24} />
                        </button>
                    </div>
                </div>

                {/* Stats Placeholder */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-700">Progresso</h3>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-1/3"></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 text-right">33% Concluído</div>
                </div>
            </div>
        </div>
    );
}
