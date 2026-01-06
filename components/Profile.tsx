import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { Copy } from 'lucide-react';

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
    <button onClick={handleCopy} title="Copy public profile link" className="px-3 py-1 rounded bg-slate-800 text-slate-200 text-sm flex items-center gap-2">
      <Copy className="w-4 h-4" />
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
};

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = { ...user, name, linkedin, leetcode, github, interests } as User;
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
    <section className="max-w-2xl mx-auto bg-slate-900 p-6 rounded-lg border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <div className="flex items-center gap-2">
          <a
            href={`${window.location.origin}/user/${user.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-indigo-300 underline hidden md:inline-block"
          >
            Open public
          </a>
          <ShareButton userId={user.id} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400">Name</label>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
          ) : (
            <p className="mt-1 text-slate-200">{user.name || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400">Email</label>
          <p className="mt-1 text-slate-200">{user.email || 'Not provided'}</p>
        </div>

        <div>
          <label className="block text-sm text-slate-400">Member since</label>
          <p className="mt-1 text-slate-200">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</p>
        </div>

        <div>
          <label className="block text-sm text-slate-400">LinkedIn</label>
          {editing ? (
            <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" placeholder="https://www.linkedin.com/in/yourname" />
          ) : (
            <p className="mt-1 text-slate-200">{user.linkedin ? <a className="text-indigo-300 underline" href={user.linkedin} target="_blank" rel="noreferrer">{user.linkedin}</a> : '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400">LeetCode</label>
          {editing ? (
            <input value={leetcode} onChange={(e) => setLeetcode(e.target.value)} className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" placeholder="https://leetcode.com/yourname" />
          ) : (
            <p className="mt-1 text-slate-200">{user.leetcode ? <a className="text-indigo-300 underline" href={user.leetcode} target="_blank" rel="noreferrer">{user.leetcode}</a> : '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-400">GitHub</label>
          {editing ? (
            <input value={github} onChange={(e) => setGithub(e.target.value)} className="mt-1 block w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" placeholder="https://github.com/yourname" />
          ) : (
            <p className="mt-1 text-slate-200">{user.github ? <a className="text-indigo-300 underline" href={user.github} target="_blank" rel="noreferrer">{user.github}</a> : '—'}</p>
          )}
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <div>
          <label className="block text-sm text-slate-400">Interests</label>
          {editing ? (
            <div className="mt-2">
              <div className="flex gap-2 flex-wrap">
                {interests.map((it, idx) => (
                  <div key={idx} className="bg-slate-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>{it}</span>
                    <button onClick={() => setInterests(prev => prev.filter(p => p !== it))} className="text-slate-400">✕</button>
                  </div>
                ))}
                <input
                  value={interestInput}
                  onChange={(e) => { setInterestInput(e.target.value); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const v = interestInput.trim();
                      if (v && !interests.includes(v)) setInterests(prev => [...prev, v]);
                      setInterestInput('');
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                  placeholder="Add interest and press Enter"
                />
              </div>

                    <div className="mt-2 flex gap-2 flex-wrap">
                {POPULAR_ROLES.map(r => (
                  <button key={r} onClick={() => { if(!interests.includes(r)) setInterests(prev => [...prev, r]); }} className="bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-300">{r}</button>
                ))}

                {interestSuggestions
                  .filter(s => {
                    if (!interestInput) return true;
                    const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const a = norm(s);
                    const b = norm(interestInput);
                    // allow substring match or small edit distance
                    if (a.includes(b) || b.includes(a)) return true;
                    // fallback to Levenshtein distance <=2
                    const lev = (x: string, y: string) => {
                      const m = x.length, n = y.length;
                      const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
                      for (let i=0;i<=m;i++) dp[i][0]=i;
                      for (let j=0;j<=n;j++) dp[0][j]=j;
                      for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) dp[i][j] = x[i-1]===y[j-1] ? dp[i-1][j-1] : Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+1);
                      return dp[m][n];
                    };
                    return lev(a,b) <= 2;
                  })
                  .slice(0,6)
                  .map(s => (
                    <button key={s} onClick={() => { if(!interests.includes(s)) setInterests(prev => [...prev, s]); }} className="bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-300">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-1 text-slate-200">{user.interests && user.interests.length > 0 ? user.interests.join(', ') : '—'}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="bg-indigo-600 px-4 py-2 rounded">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setName(user.name || ''); setLinkedin(user.linkedin || ''); setLeetcode(user.leetcode || ''); setGithub(user.github || ''); setInterests(user.interests || []); }} className="px-4 py-2 rounded border">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-indigo-600 px-4 py-2 rounded">Edit Profile</button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
