import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User, ExamResult, SkillGapReport } from '../types';
import { CheckCircle, ShieldCheck, BookOpen, Award, Clock, Zap, TrendingUp, ArrowLeft, Linkedin, Github } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// LeetCode Icon Component
const LeetCodeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
  </svg>
);

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
    setExams(e.slice().reverse().slice(0, 5));
    // skill reports not implemented for now, keep placeholder
    try {
      const r = await db.getSkillReports(userId);
      setReports(r.slice().reverse().slice(0, 3));
    } catch (err) {
      // ignore
    }
  };

  if (!user) return <div className="text-slate-600 text-center py-8">Loading profile...</div>;

  const cards = [
    { title: 'Total Exams', value: stats.totalExams, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Average Score', value: `${stats.avgScore}%`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Study Hours (Week)', value: stats.studyHoursThisWeek, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Prep Streak', value: `${stats.streak} Days`, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button for Mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors md:hidden mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        {/* Header Card - Responsive */}
        <div className="bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</div>
              <div className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-2">{user.interests?.join(' • ')}</div>

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map((skill, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-slate-600 mb-1">Interests</div>
                  <div className="flex flex-wrap gap-1">
                    {user.interests.map((interest, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full border border-emerald-200">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links with Logos */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all group"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium truncate max-w-[150px]">{user.linkedin.replace(/https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
                {user.leetcode && (
                  <a
                    href={user.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-all group"
                  >
                    <LeetCodeIcon className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-orange-700 font-medium truncate max-w-[150px]">{user.leetcode.replace(/https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-300 transition-all group"
                  >
                    <Github className="w-4 h-4 text-gray-700" />
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[150px]">{user.github.replace(/https?:\/\/(www\.)?/, '')}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-col sm:items-end">
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
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${isFavorited ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500' : 'bg-gray-200 text-slate-900 hover:bg-gray-300'
                    }`}
                >
                  {isFavorited ? '★ Favorited' : '☆ Add Favorite'}
                </button>
              )}
              <a
                href={`${window.location.origin}/user/${user.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm text-blue-600 underline text-center sm:text-right"
              >
                Open public
              </a>
              {onBack && (
                <button
                  onClick={onBack}
                  className="hidden md:block px-3 sm:px-4 py-2 rounded bg-gray-200 text-slate-900 text-xs sm:text-sm hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon as any;
            return (
              <div key={i} className="bg-white border border-gray-300 p-3 sm:p-5 rounded-2xl sm:rounded-3xl hover:border-blue-600 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`${card.bg} p-1.5 sm:p-2 rounded-lg sm:rounded-xl`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
                  </div>
                  <div className="text-slate-600 text-xs sm:text-sm line-clamp-1">{card.title}</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-slate-900 truncate">{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Activity Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-300 p-4 sm:p-8 rounded-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Learning Activity
              </h2>
            </div>
            <div className="h-64 sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHoursPublic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHoursPublic)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Readiness Score Card */}
          <div className="bg-white border border-gray-300 p-4 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">AI Readiness Score</h2>
            <div className="flex justify-center">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80" cy="80" r="70"
                    fill="transparent"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80" cy="80" r="70"
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeDasharray={`${(stats.avgScore / 100) * 439} 439`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-black text-blue-600">{stats.avgScore}</span>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Average</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm mt-4 sm:mt-6 text-center italic px-2">
              {reports.length > 0 ? (reports[0].analysis.missingSkills.slice(0, 6).join(', ')) : 'No summary available'}
            </p>
          </div>
        </div>

        {/* Recent Exams and Summary - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Exams */}
          <div className="lg:col-span-2 bg-white border border-gray-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Recent Exams</h3>
            </div>
            {exams.length === 0 ? (
              <p className="text-slate-500 text-sm">No public exam history</p>
            ) : (
              <div className="space-y-3">
                {exams.map(e => (
                  <div
                    key={e.id}
                    className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-sm sm:text-base">{e.examType}</div>
                      <div className="text-xs sm:text-sm text-slate-600 mt-1">{new Date(e.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl sm:text-3xl font-black text-blue-600">{e.score}%</div>
                      {e.score >= 80 ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : e.score >= 60 ? (
                        <ShieldCheck className="w-6 h-6 text-amber-500" />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills to Improve */}
          <div className="bg-gradient-to-br from-white to-orange-50 border border-orange-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Skills to Improve</h3>
            </div>
            {reports.length > 0 && reports[0].analysis.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reports[0].analysis.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-orange-300 text-orange-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">No summary available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
