import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Heart, Star } from 'lucide-react';

interface ConnectionsProps {
  user: User;
  onViewProfile: (id: string) => void;
  onUserUpdated: (u: User) => void;
}

const Connections: React.FC<ConnectionsProps> = ({ user, onViewProfile, onUserUpdated }) => {
  const [suggested, setSuggested] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [user.id]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const interests = user.interests || [];
      const s = await db.getUsersByInterests(user.id, interests);
      setSuggested(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async (targetId: string) => {
    try {
      const updated = await db.toggleFavorite(user.id, targetId);
      if (updated) onUserUpdated(updated);
      // reload suggestions to update UI
      loadSuggestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-2">Connections</h2>
        <p className="text-slate-400 text-sm">People with similar interests. Add to favorites or view their public profile.</p>
      </div>

      <div>
        {loading && <p className="text-slate-400">Loading suggestions...</p>}
        {!loading && suggested.length === 0 && (
          <p className="text-slate-400">No similar users found. Add more interests to improve suggestions.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggested.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-100">{s.name}</div>
                <div className="text-sm text-slate-400">{s.interests?.slice(0,4).join(', ')}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onViewProfile(s.id)} className="text-indigo-400 underline text-sm">View</button>
                <button onClick={() => toggleFav(s.id)} className={`p-2 rounded-full ${user.favorites?.includes(s.id) ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'}`} aria-label="Toggle Favorite">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
