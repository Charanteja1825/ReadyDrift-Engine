
import React from 'react';
import { LayoutDashboard, Target, BookOpen, Mic2, BarChart2, LogOut, GraduationCap, User, X, Star, Bell, MessageCircle } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, onLogout, isOpen = false, onClose }) => {
  // Main features group
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mock-exams', label: 'Mock Exams', icon: BookOpen },
    { id: 'mock-interviews', label: 'Mock Interviews', icon: Mic2 },
    { id: 'drift-analyzer', label: 'Drift Analyzer', icon: BarChart2 },
    { id: 'skill-gap', label: 'Skill Gap', icon: Target },
  ];

  // User section group
  const userMenuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Connections', icon: Star },
    { id: 'reminders', label: 'Study Reminders', icon: Bell },
    { id: 'ai-chat', label: 'AI Study Assistant', icon: MessageCircle },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-blue-50 h-screen fixed left-0 top-0 text-slate-900 flex-col border-r border-gray-300">
        <div className="p-6 border-b border-gray-300 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SkillForge</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {/* Main Features Group */}
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-gray-200 hover:text-slate-900'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="py-3">
            <div className="border-t border-gray-300"></div>
          </div>

          {/* User Section Group */}
          {userMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-gray-200 hover:text-slate-900'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar (overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative w-64 bg-blue-50 h-full text-slate-900 flex flex-col border-r border-gray-300">
            <div className="p-4 flex items-center justify-between border-b border-gray-300">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">SkillForge</span>
              </div>
              <button onClick={onClose} aria-label="Close sidebar" className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
              {/* Main Features Group */}
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); onClose && onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-gray-200 hover:text-slate-900'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Divider */}
              <div className="py-3">
                <div className="border-t border-gray-300"></div>
              </div>

              {/* User Section Group */}
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); onClose && onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-gray-200 hover:text-slate-900'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 mt-auto">
              <button
                onClick={() => { onLogout(); onClose && onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
