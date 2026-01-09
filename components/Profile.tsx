import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { auth } from '../services/firebase';
import { Copy, Linkedin, Github } from 'lucide-react';

const ShareButton: React.FC<{ userId: string }> = ({ userId }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/user/${userId}`;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <button onClick={handleCopy} title="Copy public profile link" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
      <Copy className="w-4 h-4" />
      <span>{copied ? 'Copied!' : 'Share Profile'}</span>
    </button>
  );
};

// LeetCode Icon Component
const LeetCodeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
  </svg>
);


interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [linkedin, setLinkedin] = useState(user.linkedin || '');
  const [leetcode, setLeetcode] = useState(user.leetcode || '');
  const [github, setGithub] = useState(user.github || '');
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [interestInput, setInterestInput] = useState('');
  const [interestSuggestions, setInterestSuggestions] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // Helpers: normalize and add with case-insensitive de-duplication
  const normalizeEntry = (s: string) => s.trim().replace(/\s+/g, ' ');
  const addInterest = (raw: string) => {
    const v = normalizeEntry(raw);
    if (!v) return;
    const exists = interests.some(i => i.toLowerCase() === v.toLowerCase());
    if (!exists) setInterests(prev => [...prev, v]);
  };
  const addSkill = (raw: string) => {
    const v = normalizeEntry(raw);
    if (!v) return;
    const exists = skills.some(s => s.toLowerCase() === v.toLowerCase());
    if (!exists) setSkills(prev => [...prev, v]);
  };

  const POPULAR_ROLES = ['Frontend', 'Backend', 'Fullstack', 'Data Science', 'Machine Learning', 'DevOps', 'SRE', 'QA'];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await db.getAllInterests();
        if (mounted) setInterestSuggestions(all);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    // If email missing (e.g. just signed in with Google), try to refresh profile from Firestore or fetch from Firebase Auth
    let mounted = true;
    (async () => {
      try {
        // If user already has email, skip
        if (user.email) return;

        // Try to get email from Firebase Auth
        const firebaseUser = auth.currentUser;
        if (firebaseUser && firebaseUser.email && mounted) {
          // Check if we need to persist to Firestore
          const stored = user.uid ? await db.signinByUID(user.uid) : await db.getUserById(user.id || '');

          // If stored user doesn't have email but Firebase does, update it
          if (stored && (!stored.email || stored.email !== firebaseUser.email)) {
            const updated = await db.updateUser({ uid: user.uid || firebaseUser.uid, email: firebaseUser.email });
            if (mounted) onUpdate(updated);
          }
        } else if (!firebaseUser && (user.uid || user.id)) {
          // No Firebase user, try Firestore
          const fetched = user.uid ? await db.signinByUID(user.uid) : await db.getUserById(user.id || '');
          if (mounted && fetched && fetched.email) {
            onUpdate(fetched);
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.uid]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = { ...user, name, linkedin, leetcode, github, interests, skills } as User;
      // Persist to Firestore
      const saved = await db.updateUser(updated);
      onUpdate(saved);
      setEditing(false);
    } catch (e) {
      console.error(e);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Profile</h2>
          <p className="text-sm text-slate-500">Manage your professional information</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <a
            href={`${window.location.origin}/user/${user.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline hidden md:inline-block font-medium"
          >
            View Public Profile
          </a>
          <ShareButton userId={user.id} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Name Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          ) : (
            <p className="mt-1 text-lg text-slate-900 font-medium">{user.name || '—'}</p>
          )}
        </div>

        {/* Member Since Section */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Member Since</label>
          <p className="mt-1 text-slate-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
        </div>

        {/* Social Links Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Social Profiles</h3>
          <div className="space-y-4">
            {/* LinkedIn */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 hover:border-blue-300 transition-all">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.linkedin.com/in/yourname"
                  />
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">LinkedIn</p>
                    {user.linkedin ? (
                      <a
                        className="text-blue-600 hover:text-blue-700 font-medium truncate block"
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.linkedin}
                      </a>
                    ) : (
                      <p className="text-slate-400 text-sm">Not added</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* LeetCode */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100 hover:border-orange-300 transition-all">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <LeetCodeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://leetcode.com/yourname"
                  />
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">LeetCode</p>
                    {user.leetcode ? (
                      <a
                        className="text-orange-600 hover:text-orange-700 font-medium truncate block"
                        href={user.leetcode}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.leetcode}
                      </a>
                    ) : (
                      <p className="text-slate-400 text-sm">Not added</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-gray-400 transition-all">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="https://github.com/yourname"
                  />
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">GitHub</p>
                    {user.github ? (
                      <a
                        className="text-gray-700 hover:text-gray-900 font-medium truncate block"
                        href={user.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.github}
                      </a>
                    ) : (
                      <p className="text-slate-400 text-sm">Not added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}


        {/* Skills & Interests Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          {/* Skills */}
          <div>
            <label className="block text-lg font-semibold text-slate-900 mb-3">Skills</label>
            {editing ? (
              <div className="mt-2 space-y-3">
                {/* Skills Input & Select */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      value={skillInput}
                      onChange={(e) => { setSkillInput(e.target.value); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addSkill(skillInput);
                          setSkillInput('');
                        }
                      }}
                      onBlur={() => { addSkill(skillInput); setSkillInput(''); }}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type skill..."
                    />
                    <button type="button" onClick={() => { addSkill(skillInput); setSkillInput(''); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add</button>
                  </div>
                  <select
                    onChange={(e) => { if (e.target.value) addSkill(e.target.value); e.target.value = ''; }}
                    className="bg-gray-50 border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 sm:w-48"
                  >
                    <option value="">Select Skill</option>
                    {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'Java', 'C++', 'Go', 'Rust', 'Angular', 'Vue', 'Next.js', 'Tailwind', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'Git', 'Linux', 'Kubernetes'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Added Skills Tags */}
                {skills.length > 0 && (
                  <div className="flex gap-2 flex-wrap p-4 bg-blue-50 rounded-lg border border-blue-100">
                    {skills.map((it, idx) => (
                      <div key={idx} className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm">
                        <span>{it}</span>
                        <button onClick={() => setSkills(prev => prev.filter(p => p !== it))} className="hover:text-blue-100 font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2">
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {user.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No skills added yet</p>
                )}
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-lg font-semibold text-slate-900 mb-3">Interests</label>
            {editing ? (
              <div className="mt-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex gap-2">
                    <input
                      value={interestInput}
                      onChange={(e) => { setInterestInput(e.target.value); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addInterest(interestInput);
                          setInterestInput('');
                        }
                      }}
                      onBlur={() => { addInterest(interestInput); setInterestInput(''); }}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Type interest..."
                    />
                    <button type="button" onClick={() => { addInterest(interestInput); setInterestInput(''); }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">Add</button>
                  </div>
                  <select
                    onChange={(e) => { if (e.target.value) addInterest(e.target.value); e.target.value = ''; }}
                    className="bg-gray-50 border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 sm:w-48"
                  >
                    <option value="">Select Interest</option>
                    {[...POPULAR_ROLES, 'Mobile Development', 'UI/UX Design', 'Cybersecurity', 'Blockchain', 'Cloud Computing', 'IoT', 'Game Development'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Added Interests Tags */}
                {interests.length > 0 && (
                  <div className="flex gap-2 flex-wrap p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    {interests.map((it, idx) => (
                      <div key={idx} className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm">
                        <span>{it}</span>
                        <button onClick={() => setInterests(prev => prev.filter(p => p !== it))} className="hover:text-emerald-100 font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2">
                {user.interests && user.interests.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {user.interests.map((interest, idx) => (
                      <span key={idx} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No interests added yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="bg-blue-600 px-6 py-3 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setName(user.name || ''); setLinkedin(user.linkedin || ''); setLeetcode(user.leetcode || ''); setGithub(user.github || ''); setInterests(user.interests || []); setSkills(user.skills || []); setInterestInput(''); setSkillInput(''); }} className="px-6 py-3 rounded-lg border border-gray-300 text-slate-900 font-medium hover:bg-gray-50 transition-colors text-center">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-600 px-6 py-3 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-sm text-center">Edit Profile</button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
