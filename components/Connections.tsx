import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Heart, Star, Search } from 'lucide-react';

interface ConnectionsProps {
  user: User;
  onViewProfile: (id: string) => void;
  onUserUpdated: (u: User) => void;
}

const Connections: React.FC<ConnectionsProps> = ({ user, onViewProfile, onUserUpdated }) => {
  const [suggested, setSuggested] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredSuggested, setFilteredSuggested] = useState<User[]>([]);
  const [favoriteUsers, setFavoriteUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    loadSuggestions();
  }, [user.id, user.favorites]);

  useEffect(() => {
    // If search query is empty, filter suggested users; otherwise filter all users
    const source = searchQuery.trim() === '' ? suggested : allUsers;
    const filtered = source.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort: favorites first, then others
    const sorted = filtered.sort((a, b) => {
      const aIsFav = user.favorites?.includes(a.id) || false;
      const bIsFav = user.favorites?.includes(b.id) || false;

      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return 0;
    });

    setFilteredSuggested(sorted);
  }, [searchQuery, suggested, allUsers, user.favorites]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const interests = user.interests || [];
      const s = await db.getUsersByInterests(user.id, interests);
      setSuggested(s);

      // Load all users for search functionality
      const all = await db.getAllUsers(user.id);
      setAllUsers(all);

      // Load favorite users separately
      const favIds = user.favorites || [];
      const favUsers = all.filter(u => favIds.includes(u.id));
      setFavoriteUsers(favUsers);

      // Load average scores for all users (both suggested and all)
      const combinedUsers = Array.from(new Set([...s, ...all].map(u => u.id)))
        .map(id => [...s, ...all].find(u => u.id === id)!)
        .filter(Boolean);

      const stats: { [key: string]: any } = {};
      for (const usr of combinedUsers) {
        try {
          const stat = await db.getDashboardStats(usr.id);
          stats[usr.id] = stat;
        } catch (err) {
          stats[usr.id] = { avgScore: 0 };
        }
      }
      setUserStats(stats);
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
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      <div className="bg-white border border-gray-300 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-2 text-slate-900">Connections</h2>
        <p className="text-slate-600 text-sm">People with similar interests. Add to favorites or view their public profile.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-600" />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600"
        />
      </div>

      <div>
        {loading && <p className="text-slate-600">Loading suggestions...</p>}

        {/* Favorites Section */}
        {!loading && favoriteUsers.length > 0 && searchQuery.trim() === '' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
              <h3 className="text-lg font-bold text-slate-900">My Favorites</h3>
              <span className="text-sm text-slate-600">({favoriteUsers.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteUsers.map(s => (
                <div
                  key={s.id}
                  className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-6 hover:border-amber-500 transition-all duration-300 transform hover:scale-[1.05] flex flex-col shadow-md"
                >
                  {/* User Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 text-lg">{s.name}</div>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 mt-2">{s.interests?.slice(0, 4).join(', ')}</div>
                  </div>

                  {/* Average Score with Animation */}
                  <div className="flex justify-center mb-4 flex-1 flex items-center">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-500 group-hover:scale-110">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 opacity-0 group-hover:opacity-30 animate-pulse"></div>
                        <div className="text-center z-10">
                          <span className="text-3xl font-black text-white">{userStats[s.id]?.avgScore || 0}</span>
                          <p className="text-xs text-amber-100 font-semibold mt-0.5">Score</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => onViewProfile(s.id)}
                      className="w-full px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => toggleFav(s.id)}
                      className="w-full p-2 rounded-lg transition-colors flex items-center justify-center bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300"
                      aria-label="Remove Favorite"
                    >
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Favorited
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Connections */}
        {!loading && filteredSuggested.length > 0 && (
          <div>
            {searchQuery.trim() === '' && favoriteUsers.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Suggested Connections</h3>
              </div>
            )}
          </div>
        )}

        {!loading && filteredSuggested.length === 0 && suggested.length === 0 && searchQuery.trim() === '' && (
          <p className="text-slate-600">No similar users found. Add more interests to improve suggestions.</p>
        )}
        {!loading && filteredSuggested.length === 0 && suggested.length > 0 && searchQuery.trim() === '' && (
          <p className="text-slate-600">No users match your search.</p>
        )}
        {!loading && filteredSuggested.length === 0 && searchQuery.trim() !== '' && (
          <p className="text-slate-600">No users found with that name.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSuggested.map(s => (
            <div
              key={s.id}
              className="bg-white border border-gray-300 rounded-2xl p-6 hover:border-blue-600 transition-all duration-300 transform hover:scale-[1.05] flex flex-col"
            >
              {/* User Info */}
              <div className="mb-4">
                <div className="font-bold text-slate-900 text-lg mb-2">{s.name}</div>
                <div className="text-xs text-slate-600 line-clamp-2">{s.interests?.slice(0, 4).join(', ')}</div>
              </div>

              {/* Average Score with Animation */}
              <div className="flex justify-center mb-4 flex-1 flex items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/50 hover:shadow-blue-600/70 transition-all duration-500 group-hover:scale-110">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-30 animate-pulse"></div>
                    <div className="text-center z-10">
                      <span className="text-3xl font-black text-white">{userStats[s.id]?.avgScore || 0}</span>
                      <p className="text-xs text-blue-200 font-semibold mt-0.5">Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => onViewProfile(s.id)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => toggleFav(s.id)}
                  className={`w-full p-2 rounded-lg transition-colors flex items-center justify-center ${user.favorites?.includes(s.id) ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
                  aria-label="Toggle Favorite"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {user.favorites?.includes(s.id) ? 'Favorited' : 'Add Favorite'}
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
