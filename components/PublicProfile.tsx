import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, ExamResult, SkillGapReport } from '../types';
import { CheckCircle, ShieldCheck, BookOpen, Award, Clock, Zap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PublicProfileProps {
  userId: string;
  currentUserId?: string;
  onBack?: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ userId, currentUserId, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [reports, setReports] = useState<SkillGapReport[]>([]);

  const [stats, setStats] = useState({ totalExams: 0, avgScore: 0, studyHoursThisWeek: 0, streak: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    load();
  }, [userId]);

  // Load whether current user has favorited this profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentUserId) return;
      try {
        const me = await db.getUserById(currentUserId);
        if (!mounted) return;
        setIsFavorited(!!(me && Array.isArray(me.favorites) && me.favorites.includes(userId)));
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [currentUserId, userId]);

  const load = async () => {
    const u = await db.getUserById(userId);
    setUser(u);

    const s = await db.getDashboardStats(userId);
    setStats(s);

    const logs = await db.getLogs(userId);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: log ? log.hours : 0
      };
    });
    setChartData(last7Days);

    const e = await db.getExamResults(userId);
    setExams(e.slice().reverse().slice(0,5));
    // skill reports not implemented for now, keep placeholder
    try {
      const r = await db.getSkillReports(userId);
      setReports(r.slice().reverse().slice(0,3));
    } catch (err) {
      // ignore
    }
  };

  if (!user) return <div className="text-slate-400">Loading profile...</div>;

  const cards = [
    { title: 'Total Exams', value: stats.totalExams, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Average Score', value: `${stats.avgScore}%`, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Study Hours (Week)', value: stats.studyHoursThisWeek, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Prep Streak', value: `${stats.streak} Days`, icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <div>
          <div className="text-2xl font-bold text-slate-100">{user.name}</div>
          <div className="text-slate-400 text-sm">{user.interests?.join(' • ')}</div>
          <div className="mt-2 flex items-center gap-3">
            {user.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-indigo-300 underline text-sm">LinkedIn</a>}
            {user.leetcode && <a href={user.leetcode} target="_blank" rel="noreferrer" className="text-indigo-300 underline text-sm">LeetCode</a>}
            {user.github && <a href={user.github} target="_blank" rel="noreferrer" className="text-indigo-300 underline text-sm">GitHub</a>}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {currentUserId && currentUserId !== user.id && (
            <button
              onClick={async () => {
                if (!currentUserId) return;
                setTogglingFav(true);
                try {
                  const updated = await db.toggleFavorite(currentUserId, user.id);
                  setIsFavorited(Array.isArray(updated.favorites) && updated.favorites.includes(user.id));
                } catch (e) {
                  console.error('Fav toggle failed', e);
                } finally {
                  setTogglingFav(false);
                }
              }}
              disabled={togglingFav}
              className={`px-3 py-1 rounded-full text-sm ${isFavorited ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-200'}`}
            >
              {isFavorited ? 'Favorited' : 'Add Favorite'}
            </button>
          )}

          <a href={`${window.location.origin}/user/${user.id}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-300 underline">Open public</a>
          <button onClick={onBack} className="px-4 py-2 rounded bg-slate-800 text-slate-200">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon as any;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${card.bg} p-2 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-slate-400 text-sm">{card.title}</div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Learning Activity
            </h2>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHoursPublic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHoursPublic)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-100 mb-4 text-center">AI Readiness Score</h2>
          <div className="relative flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-[10px] border-slate-800 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-black text-indigo-500">{stats.avgScore}</span>
                <p className="text-slate-400 text-sm mt-1">Average</p>
              </div>
            </div>
            <svg className="absolute w-40 h-40 transform -rotate-90">
              <circle 
                cx="80" cy="80" r="70" 
                fill="transparent" 
                stroke="#6366f1" 
                strokeWidth="10" 
                strokeDasharray={`${(stats.avgScore / 100) * 439} 439`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-slate-400 text-sm mt-6 text-center italic">
            {reports.length > 0 ? (reports[0].analysis.missingSkills.slice(0,6).join(', ') ) : 'No summary available'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Exams</h3>
          {exams.length === 0 ? (
            <p className="text-slate-400">No public exam history</p>
          ) : (
            <ul className="space-y-3">
              {exams.map(e => (
                <li key={e.id} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100">{e.examType}</div>
                    <div className="text-sm text-slate-400">{new Date(e.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xl font-black">{e.score}%</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <p className="text-slate-400">{reports.length > 0 ? reports[0].analysis.missingSkills.join(', ') : 'No summary available'}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
