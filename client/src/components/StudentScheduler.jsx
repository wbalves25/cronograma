import React, { useState, useEffect } from 'react';
import api from '../api';
import { format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, AlertTriangle, Play, Pause, RotateCcw, Calendar } from 'lucide-react';

export default function StudentScheduler({ userId }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pomodoro State
    const [timer, setTimer] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'

    useEffect(() => {
        loadTasks();
    }, [userId]);

    useEffect(() => {
        let interval = null;
        if (isActive && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0) {
            setIsActive(false);
            alert(mode === 'focus' ? 'Hora do intervalo!' : 'Voltar ao foco!');
            setMode(mode === 'focus' ? 'break' : 'focus');
            setTimer(mode === 'focus' ? 5 * 60 : 25 * 60);
        }
        return () => clearInterval(interval);
    }, [isActive, timer, mode]);

    const loadTasks = async () => {
        try {
            const response = await api.get(`/student/tasks/${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (taskId) => {
        try {
            await api.post('/student/complete-task', { taskId });
            loadTasks();
        } catch (error) {
            alert('Erro ao concluir tarefa');
        }
    };

    const handleRecalculate = async () => {
        try {
            setLoading(true);
            await api.post('/student/recalculate', { userId });
            loadTasks();
        } catch (error) {
            alert('Erro ao recalcular');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimer(25 * 60);
        setMode('focus');
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        const date = task.scheduledDate ? format(new Date(task.scheduledDate), 'yyyy-MM-dd') : 'Unscheduled';
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});

    const hasLateTasks = tasks.some(t =>
        t.status === 'pending' &&
        t.scheduledDate &&
        isBefore(new Date(t.scheduledDate), startOfDay(new Date()))
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Schedule Column */}
            <div className="lg:col-span-2 space-y-6">
                {hasLateTasks && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center text-amber-800">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <span className="font-medium">Você tem tarefas atrasadas!</span>
                        </div>
                        <button
                            onClick={handleRecalculate}
                            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                        >
                            Recalcular Cronograma
                        </button>
                    </div>
                )}

                {Object.entries(groupedTasks).sort().map(([date, dayTasks]) => (
                    <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                            <h3 className="font-semibold text-gray-700 capitalize">
                                {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {dayTasks.map((task) => (
                                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`h-3 w-3 rounded-full`}
                                            style={{ backgroundColor: task.topic.subject.color }}
                                        />
                                        <div>
                                            <p className={`font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                {task.topic.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{task.topic.subject.name} • {task.topic.estimatedMinutes} min</p>
                                        </div>
                                    </div>

                                    {task.status === 'pending' ? (
                                        <button
                                            onClick={() => handleComplete(task.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-green-600"
                                            title="Marcar como concluído"
                                        >
                                            <CheckCircle className="h-6 w-6" />
                                        </button>
                                    ) : (
                                        <span className="text-green-600 flex items-center text-sm font-medium">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Concluído
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <p className="text-gray-500">Nenhuma tarefa agendada.</p>
                    </div>
                )}
            </div>

            {/* Sidebar Column (Pomodoro) */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                            Pomodoro
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${mode === 'focus' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                            {mode === 'focus' ? 'Foco' : 'Pausa'}
                        </span>
                    </div>

                    <div className="text-center mb-8">
                        <div className="text-5xl font-mono font-bold text-gray-900 tracking-wider">
                            {formatTime(timer)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={toggleTimer}
                            className={`flex items-center justify-center py-3 px-4 rounded-lg font-medium text-white transition-colors ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            {isActive ? 'Pausar' : 'Iniciar'}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Resetar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
