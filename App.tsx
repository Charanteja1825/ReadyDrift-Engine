
import React, { useState, useEffect } from 'react';
import { User, StudyReminder } from './types';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import SkillGap from './components/SkillGap';
import MockExams from './components/MockExams';
import MockInterviews from './components/MockInterviews';
import DriftAnalyzer from './components/DriftAnalyzer';
import Connections from './components/Connections';
import PublicProfile from './components/PublicProfile';
import StudyReminders from './components/StudyReminders';
import StudyAIChat from './components/StudyAIChat';
import LandingPage from './components/LandingPage';
import { Menu, Bell, X } from 'lucide-react';
import { db } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPublicUserId, setSelectedPublicUserId] = useState<string | null>(null);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<StudyReminder | null>(null);
  const [showAuth, setShowAuth] = useState(false); // New state to toggle showing Auth vs Landing

  useEffect(() => {
    const savedUser = localStorage.getItem('cr_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // If saved user is missing email (older format), try fetching latest profile from Firestore
        if (parsed && parsed.uid && !parsed.email) {
          (async () => {
            try {
              const fresh = await db.signinByUID(parsed.uid);
              if (fresh) {
                setUser(fresh);
                localStorage.setItem('cr_current_user', JSON.stringify(fresh));
                return;
              }
            } catch (e) {
              // ignore and fall back
            }
            setUser(parsed);
          })();
        } else {
          setUser(parsed);
        }
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem('cr_current_user');
      }
    }
  }, []);

  // Support deep-linking to public profile at /user/:id (e.g. /user/abc123)
  useEffect(() => {
    try {
      const path = window.location.pathname || '';
      const m = path.match(/^\/user\/([^\/]+)/);
      if (m && m[1]) {
        setSelectedPublicUserId(m[1]);
        setCurrentTab('public-profile');
        // If deep-linking, we might want to bypass landing or show auth immediately if needed
        // For now, let's assume if they have a link, they might want to see the profile. 
        // But the original code redirects to auth if !user.
        // We will keep standard behavior: if !user, show landing (or auth).
        setShowAuth(true); // Auto-show auth if trying to access a deep link? Or maybe just let them navigate.
      }
    } catch (e) {
      // ignore (server-side or test environment)
    }
  }, []);

  // Global reminder checking - runs regardless of current tab
  useEffect(() => {
    if (!user) return;

    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const stored = localStorage.getItem(`reminders_${user.id}`);
      if (!stored) return;

      let reminders: StudyReminder[] = [];
      try {
        reminders = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse reminders", e);
        return;
      }
      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.days.includes(currentDay) && reminder.time === currentTime) {
          const lastShownKey = `last_shown_${reminder.id}`;
          const lastShown = localStorage.getItem(lastShownKey);
          const oneMinuteAgo = Date.now() - 60000;

          if (!lastShown || parseInt(lastShown) < oneMinuteAgo) {
            setCurrentReminder(reminder);
            setShowReminderPopup(true);
            localStorage.setItem(lastShownKey, Date.now().toString());

            if ('Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification('📚 Study Time!', {
                body: reminder.title,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: reminder.id,
                requireInteraction: true,
                silent: false,
                vibrate: [200, 100, 200]
              } as any);

              notification.onclick = function () {
                window.focus();
                notification.close();
              };
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('cr_current_user', JSON.stringify(newUser));
    // If the app was opened with a /user/:id deep-link, navigate to it after login
    if (selectedPublicUserId) {
      setCurrentTab('public-profile');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cr_current_user');
    setShowAuth(false); // Reset to landing page on logout
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('cr_current_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    if (showAuth) {
      return (
        <>
          <div className="fixed top-4 left-4 z-50">
            <button onClick={() => setShowAuth(false)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium bg-white/80 p-2 rounded-lg backdrop-blur-sm">
              ← Back to Home
            </button>
          </div>
          <Auth onLogin={handleLogin} notice={selectedPublicUserId ? 'Please sign in to view public profiles' : undefined} />
        </>
      );
    }
    return <LandingPage onLogin={() => setShowAuth(true)} onSignup={() => setShowAuth(true)} />;
  }

  const handleViewPublicProfile = (id: string) => {
    setSelectedPublicUserId(id);
    setCurrentTab('public-profile');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'skill-gap':
        return <SkillGap user={user} />;
      case 'mock-exams':
        return <MockExams user={user} />;
      case 'mock-interviews':
        return <MockInterviews user={user} />;
      case 'drift-analyzer':
        return <DriftAnalyzer user={user} />;
      case 'connections':
        return <Connections user={user} onViewProfile={handleViewPublicProfile} onUserUpdated={handleUpdateUser} />;
      case 'profile':
        return <Profile user={user} onUpdate={handleUpdateUser} />;
      case 'reminders':
        return <StudyReminders userId={user.id} />;
      case 'ai-chat':
        return <StudyAIChat user={user} />;
      case 'public-profile':
        return selectedPublicUserId ? <PublicProfile userId={selectedPublicUserId} currentUserId={user.id} onBack={() => setCurrentTab('connections')} /> : <Dashboard user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Global Reminder Popup */}
      {showReminderPopup && currentReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-slate-900">Study Time! 📚</h3>
              </div>
              <button onClick={() => setShowReminderPopup(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xl text-slate-700 mb-6">{currentReminder.title}</p>
            <button onClick={() => setShowReminderPopup(false)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
              Got it!
            </button>
          </div>
        </div>
      )}

      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen md:pl-64">
        {/* Mobile header with hamburger */}
        <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md p-3 border-b border-gray-300 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="p-2">
            <Menu className="w-6 h-6 text-slate-900" />
          </button>
          <span className="font-semibold text-slate-900">SkillForge</span>
        </div>

        <div className="p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
