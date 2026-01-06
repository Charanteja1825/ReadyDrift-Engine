
import React, { useState, useEffect } from 'react';
import { User, ExamResult, DailyLog } from '../types';
import { db } from '../services/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { BarChart2, Calendar, Target, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface DriftAnalyzerProps {
  user: User;
}

const DriftAnalyzer: React.FC<DriftAnalyzerProps> = ({ user }) => {
  const [studyHours, setStudyHours] = useState('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    const l = await db.getLogs(user.id);
    const e = await db.getExamResults(user.id);
    setLogs(l);
    setExams(e);
  };

  const handleLogStudy = async (e: React.FormEvent) => {
    e.preventDefault();

    const hoursNum = parseFloat(studyHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setInputError('Please enter a positive number of hours');
      return;
    }

    setInputError(null);

    // compute today's total if we add this entry
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === today);
    const newTotal = (todayLog?.hours || 0) + hoursNum;

    if (newTotal > 24) {
      // Do not persist to DB if total exceeds realistic 24-hour day
      setWarning('Warning: total study hours for today would exceed 24 hours. Entry not saved.');
      return;
    }

    // clear warning and proceed
    setWarning(null);

    setLoading(true);
    try {
      await db.saveDailyLog(user.id, hoursNum);
      setStudyHours('');
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    const examOnDate = exams.find(e => e.createdAt.startsWith(dateStr));
    return {
      date: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      hours: log ? log.hours : 0,
      score: examOnDate ? examOnDate.score : null,
      aiUsage: examOnDate ? examOnDate.aiUsagePercent : 0
    };
  });

  const lastExam = exams.length > 0 ? exams[exams.length - 1] : null;
  const prevExam = exams.length > 1 ? exams[exams.length - 2] : null;
  const drift = lastExam && prevExam ? lastExam.score - prevExam.score : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 text-center">Drift Analyzer</h1>
        <p className="text-slate-400 mb-10 text-center">Track how your preparation evolves and detect performance drift.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Study Tracker */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
             <div className="flex items-center gap-3 mb-6 text-indigo-400">
               <Calendar className="w-6 h-6" />
               <h2 className="text-xl font-bold">Log Study Hours</h2>
             </div>
             <form onSubmit={handleLogStudy} className="space-y-4">
               <div>
                 <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Hours Today</label>
                 <input
                   type="number"
                   step="0.5"
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                   placeholder="e.g. 4.5"
                   value={studyHours}
                   onChange={(e) => { setStudyHours(e.target.value); setInputError(null); }}
                   required
                 />
+                {inputError && <p className="text-red-400 text-sm mt-2">{inputError}</p>}
+                {warning && <p className="text-amber-400 text-sm mt-2" role="alert" aria-live="polite">{warning}</p>}
               </div>
               <button
                 disabled={loading}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
               >
                 Update Progress
               </button>
             </form>
          </div>

          {/* Aggregation Insights */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-center">
            <h3 className="text-slate-400 font-bold uppercase text-xs mb-6 tracking-widest">Performance Signal</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                 <p className="text-slate-500 text-sm mb-1">Drift Ratio</p>
                 <div className="flex items-baseline gap-2">
                   <span className={`text-4xl font-black ${drift >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                     {drift >= 0 ? `+${drift}` : drift}%
                   </span>
                   {drift >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                 </div>
                 <p className="text-xs text-slate-500 mt-2">Comparison vs last attempt</p>
              </div>
              <div>
                 <p className="text-slate-500 text-sm mb-1">AI Dependence</p>
                 <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-amber-500">
                     {lastExam ? lastExam.aiUsagePercent : 0}%
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">Self-sufficiency indicator</p>
              </div>
            </div>
            {drift < 0 && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-red-500" />
                 <p className="text-xs text-red-400">Drift alert: Your score has decreased. Review your weak topics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Visualizations */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold text-slate-100 mb-8 flex items-center gap-2">
               <BarChart2 className="w-6 h-6 text-indigo-500" />
               Preparation Velocity
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} name="Study Hours" />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} name="Exam Score %" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold text-slate-100 mb-8 flex items-center gap-2">
               <Target className="w-6 h-6 text-amber-500" />
               AI Usage Correlation
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="aiUsage" fill="#f59e0b" radius={[4, 4, 0, 0]} name="AI Dependency %" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriftAnalyzer;
