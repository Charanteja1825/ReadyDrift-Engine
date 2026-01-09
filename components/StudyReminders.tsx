import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, TestTube, Edit2 } from 'lucide-react';
import { StudyReminder } from '../types';

interface StudyRemindersProps {
    userId: string;
}

const StudyReminders: React.FC<StudyRemindersProps> = ({ userId }) => {
    const [reminders, setReminders] = useState<StudyReminder[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [notificationStatus, setNotificationStatus] = useState<string>('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [date, setDate] = useState('');
    const [isRecurring, setIsRecurring] = useState(true);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        requestNotificationPermission();
        loadReminders();
    }, [userId]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                setNotificationStatus(`Permission: ${permission}`);
            } else {
                setNotificationStatus(`Permission: ${Notification.permission}`);
            }
        } else {
            setNotificationStatus('Notifications not supported');
        }
    };

    const loadReminders = () => {
        const stored = localStorage.getItem(`reminders_${userId}`);
        if (stored) setReminders(JSON.parse(stored));
    };

    const saveReminders = (newReminders: StudyReminder[]) => {
        localStorage.setItem(`reminders_${userId}`, JSON.stringify(newReminders));
        setReminders(newReminders);
    };

    const testNotification = () => {
        if (!('Notification' in window)) {
            alert('❌ Your browser does not support notifications!');
            return;
        }

        if (Notification.permission === 'denied') {
            alert('❌ Notifications are BLOCKED!\n\nTo enable:\n1. Click the lock/info icon in address bar\n2. Change notifications to "Allow"\n3. Refresh the page');
            return;
        }

        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showTestNotif();
                } else {
                    alert('❌ You denied notifications. Please enable them.');
                }
            });
            return;
        }

        if (Notification.permission === 'granted') {
            showTestNotif();
        }
    };

    const showTestNotif = () => {
        const notification = new Notification('🔔 Test - Study Reminder', {
            body: 'SUCCESS! You will see reminders like this even when using other apps.',
            icon: '/favicon.ico',
            requireInteraction: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        alert('✅ Check your screen! A notification should appear in Windows notification center (bottom-right).');
    };

    const addReminder = () => {
        if (!title.trim()) return;
        if (!isRecurring && !date) {
            alert('Please select a date');
            return;
        }

        const reminderData = {
            title,
            time,
            days: isRecurring ? selectedDays : [],
            date: !isRecurring ? date : undefined,
            enabled: true
        };

        if (editingId) {
            // Update existing reminder
            saveReminders(reminders.map(r =>
                r.id === editingId
                    ? { ...r, ...reminderData, days: isRecurring ? selectedDays : [] }
                    : r
            ));
            setEditingId(null);
        } else {
            // Add new reminder
            const newReminder: StudyReminder = {
                id: Date.now().toString(),
                userId,
                createdAt: new Date().toISOString(),
                ...reminderData
            };
            saveReminders([...reminders, newReminder]);
        }

        setTitle('');
        setTime('09:00');
        setSelectedDays([1, 2, 3, 4, 5]);
        setDate('');
        setIsRecurring(true);
        setShowForm(false);
    };

    const editReminder = (reminder: StudyReminder) => {
        setTitle(reminder.title);
        setTime(reminder.time);
        if (reminder.date) {
            setIsRecurring(false);
            setDate(reminder.date);
            setSelectedDays([1, 2, 3, 4, 5]);
        } else {
            setIsRecurring(true);
            setSelectedDays(reminder.days);
            setDate('');
        }
        setEditingId(reminder.id);
        setShowForm(true);
    };

    const toggleReminder = (id: string) => {
        saveReminders(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const deleteReminder = (id: string) => {
        saveReminders(reminders.filter(r => r.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <Bell className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Study Reminders</h2>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button onClick={testNotification} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base">
                            <TestTube className="w-5 h-5" />
                            Test
                        </button>
                        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
                            <Plus className="w-5 h-5" />
                            Add
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700 border border-blue-200">
                    <p className="font-medium">✅ Global reminders are active! You'll get alerts even when viewing other sections.</p>
                    <p className="text-xs mt-1">{notificationStatus}</p>
                </div>

                {showForm && (
                    <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Study DSA" className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-3" />

                        <div className="flex bg-white rounded-lg p-1 border border-gray-300 mb-3 w-full sm:w-fit">
                            <button onClick={() => setIsRecurring(true)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isRecurring ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-gray-50'}`}>Weekly</button>
                            <button onClick={() => setIsRecurring(false)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!isRecurring ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-gray-50'}`}>One-time Date</button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mb-3">
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
                            {!isRecurring && (
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300" min={new Date().toISOString().split('T')[0]} />
                            )}
                        </div>

                        {isRecurring && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {days.map((day, idx) => (
                                    <button key={idx} onClick={() => setSelectedDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])} className={`px-3 py-2 rounded-lg font-medium text-sm flex-1 sm:flex-none ${selectedDays.includes(idx) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-slate-600'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button onClick={addReminder} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                            {editingId ? 'Update Reminder' : 'Save Reminder'}
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    {reminders.map(reminder => (
                        <div key={reminder.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 gap-4">
                            <div className="flex-1 w-full sm:w-auto">
                                <h3 className="font-bold text-slate-900">{reminder.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <Clock className="w-4 h-4" />
                                    {reminder.time} •
                                    {reminder.date ? (
                                        <span className="font-medium text-blue-600 ml-1">
                                            {new Date(reminder.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                    ) : (
                                        <span> {reminder.days.map(d => days[d]).join(', ')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button onClick={() => editReminder(reminder)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => toggleReminder(reminder.id)} className={`px-4 py-2 rounded-lg font-medium flex-1 sm:flex-none text-center ${reminder.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {reminder.enabled ? 'ON' : 'OFF'}
                                </button>
                                <button onClick={() => deleteReminder(reminder.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {reminders.length === 0 && !showForm && (
                        <p className="text-center text-slate-500 py-8">No reminders set. Click "Add" to create one!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyReminders;
