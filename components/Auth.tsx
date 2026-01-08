
import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import { GraduationCap, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { Chrome } from "lucide-react";

import {
  signupWithEmail,
  signinWithEmail,
  signinWithGoogle
} from '../services/firebase-auth';


interface AuthProps {
  onLogin: (user: User) => void;
  notice?: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, notice }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   try {
  //     if (isLogin) {
  //       const user = await db.signin(formData.email);
  //       if (user) {
  //         onLogin(user);
  //       } else {

  //         setError('User not found. Please signup.');
  //       }
  //     } else {
  //       const newUser = await db.signup({
  //         name: formData.name,
  //         email: formData.email
  //       });
  //       onLogin(newUser);
  //     }
  //   } catch (err) {
  //       console.error("LOGIN ERROR:", err);
  //     setError('An error occurred. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // 🔐 Firebase Auth login
        const fbUser = await signinWithEmail(
          formData.email,
          formData.password
        );

        // 🔁 Fetch user profile from Firestore
        let user = await db.signinByUID(fbUser.uid);

        if (!user) throw new Error("User profile not found");

        onLogin(user);
      } else {
        // 🔐 Firebase Auth signup
        const fbUser = await signupWithEmail(
          formData.email,
          formData.password
        );

        // 🗄️ Save profile in Firestore
        const newUser = await db.signup({
          uid: fbUser.uid,              // ✅ REQUIRED
          name: formData.name,
          email: fbUser.email!
        });


        onLogin(newUser);
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements matching landing page */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 animate-pulse-subtle pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3 animate-pulse-subtle pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/50 shadow-xl relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <img src="/favicon.png" alt="SkillForge" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SkillForge</h1>
          <p className="text-slate-600 text-center">Accelerate your career journey with AI insights</p>
        </div>

        {/** Optional notice (e.g., login required to view a profile) */}
        {notice && <div className="mb-4 text-sm text-slate-700 bg-blue-50 p-3 rounded border border-blue-200">{notice}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:translate-y-[-2px]"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}

          </button>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError("");

                try {
                  const fbUser = await signinWithGoogle();

                  let user = await db.signinByUID(fbUser.uid);
                  if (user) {
                    // Merge Firebase profile fields so the UI shows them immediately
                    const merged = {
                      ...user,
                      email: user.email || fbUser.email || '',
                      name: user.name || fbUser.displayName || user.name
                    } as any;

                    // If merged added/changed fields, persist them
                    const needsUpdate = (merged.email && merged.email !== user.email) || (fbUser.displayName && merged.name !== user.name);
                    if (needsUpdate) {
                      const updated = await db.updateUser({ uid: fbUser.uid, email: merged.email || undefined, name: merged.name || undefined });
                      user = updated;
                    } else {
                      user = merged;
                    }
                  } else {
                    // No Firestore user found — create one from Firebase profile
                    user = await db.signup({
                      uid: fbUser.uid,
                      name: fbUser.displayName || "User",
                      email: fbUser.email || ''
                    });
                  }

                  // Ensure we return a user with email/name populated to the app immediately
                  onLogin(user);
                } catch (err) {
                  setError("Google sign-in failed");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full mt-4 flex items-center justify-center gap-3
             bg-white text-slate-900 font-medium
             py-3 rounded-xl border border-gray-300
             hover:bg-gray-50 transition shadow-sm"
            >
              {/* Google Logo */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.68 1.23 9.18 3.25l6.84-6.84C35.94 2.1 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.06 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.45c-.54 2.88-2.18 5.32-4.6 6.95l7.1 5.5c4.15-3.83 6.55-9.48 6.55-16.7z" />
                <path fill="#FBBC05" d="M10.54 28.41c-.48-1.45-.76-2.99-.76-4.6s.28-3.15.76-4.6l-7.98-6.19C.92 16.23 0 19.98 0 24s.92 7.77 2.56 10.98l7.98-6.57z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.1-5.5c-1.97 1.32-4.5 2.1-8.8 2.1-6.26 0-11.57-3.56-13.46-8.41l-7.98 6.57C6.51 42.62 14.62 48 24 48z" />
              </svg>

              <span>Continue with Google</span>
            </button>

          </div>


        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
