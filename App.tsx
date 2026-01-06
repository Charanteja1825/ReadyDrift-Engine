
import React, { useState, useEffect } from 'react';
import { User } from './types';
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
import { Menu } from 'lucide-react';
import { db } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPublicUserId, setSelectedPublicUserId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cr_current_user');
    if (savedUser) {
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
      }
    } catch (e) {
      // ignore (server-side or test environment)
    }
  }, []);

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
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('cr_current_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} notice={selectedPublicUserId ? 'Please sign in to view public profiles' : undefined} />;
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
      case 'public-profile':
        return selectedPublicUserId ? <PublicProfile userId={selectedPublicUserId} currentUserId={user.id} onBack={() => setCurrentTab('connections')} /> : <Dashboard user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar 
        currentTab={currentTab} 
        setTab={setCurrentTab} 
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen md:pl-64">
        {/* Mobile header with hamburger */}
        <div className="md:hidden p-3 border-b border-slate-800 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="p-2">
            <Menu className="w-6 h-6 text-slate-200" />
          </button>
          <span className="font-semibold">CareerReady</span>
        </div>

        <div className="p-6 md:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
