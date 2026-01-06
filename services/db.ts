
// import { User, SkillGapReport, ExamResult, InterviewSession, DailyLog } from '../types';

// /**
//  * MOCK DATABASE IMPLEMENTATION
//  * In a real Replit environment, these would be fetch calls to a Node/Express backend.
//  * We use localStorage to persist per-user state for the demo.
//  */

// const STORAGE_KEYS = {
//   USERS: 'cr_users',
//   SKILL_REPORTS: 'cr_skill_reports',
//   EXAM_RESULTS: 'cr_exam_results',
//   INTERVIEWS: 'cr_interviews',
//   LOGS: 'cr_logs',
//   SESSION: 'cr_current_user'
// };

// const get = <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
// const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// export const db = {
//   // Auth
//   async signup(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
//     const users = get<User>(STORAGE_KEYS.USERS);
//     const newUser: User = {
//       ...user,
//       id: Math.random().toString(36).substr(2, 9),
//       createdAt: new Date().toISOString()
//     };
//     users.push(newUser);
//     save(STORAGE_KEYS.USERS, users);
//     return newUser;
//   },

//   async signin(email: string): Promise<User | null> {
//     const users = get<User>(STORAGE_KEYS.USERS);
//     return users.find(u => u.email === email) || null;
//   },

//   // Skill Reports
//   async saveSkillReport(report: Omit<SkillGapReport, 'id' | 'createdAt'>): Promise<SkillGapReport> {
//     const reports = get<SkillGapReport>(STORAGE_KEYS.SKILL_REPORTS);
//     const newReport = { ...report, id: Date.now().toString(), createdAt: new Date().toISOString() };
//     reports.push(newReport);
//     save(STORAGE_KEYS.SKILL_REPORTS, reports);
//     return newReport;
//   },

//   async getSkillReports(userId: string): Promise<SkillGapReport[]> {
//     return get<SkillGapReport>(STORAGE_KEYS.SKILL_REPORTS).filter(r => r.userId === userId);
//   },

//   // Exams
//   async saveExamResult(result: Omit<ExamResult, 'id' | 'createdAt'>): Promise<ExamResult> {
//     const results = get<ExamResult>(STORAGE_KEYS.EXAM_RESULTS);
//     const newResult = { ...result, id: Date.now().toString(), createdAt: new Date().toISOString() };
//     results.push(newResult);
//     save(STORAGE_KEYS.EXAM_RESULTS, results);
//     return newResult;
//   },

//   async getExamResults(userId: string): Promise<ExamResult[]> {
//     return get<ExamResult>(STORAGE_KEYS.EXAM_RESULTS).filter(r => r.userId === userId);
//   },

//   // Interviews
//   async saveInterview(session: Omit<InterviewSession, 'id' | 'createdAt'>): Promise<InterviewSession> {
//     const sessions = get<InterviewSession>(STORAGE_KEYS.INTERVIEWS);
//     const newSession = { ...session, id: Date.now().toString(), createdAt: new Date().toISOString() };
//     sessions.push(newSession);
//     save(STORAGE_KEYS.INTERVIEWS, sessions);
//     return newSession;
//   },

//   async getInterviews(userId: string): Promise<InterviewSession[]> {
//     return get<InterviewSession>(STORAGE_KEYS.INTERVIEWS).filter(s => s.userId === userId);
//   },

//   // Daily Logs
//   async saveDailyLog(userId: string, hours: number): Promise<DailyLog> {
//     const logs = get<DailyLog>(STORAGE_KEYS.LOGS);
//     const newLog = { userId, hours, date: new Date().toISOString().split('T')[0], id: Date.now().toString() };
//     // Update if exists for today
//     const index = logs.findIndex(l => l.userId === userId && l.date === newLog.date);
//     if (index !== -1) {
//       logs[index].hours += hours;
//     } else {
//       logs.push(newLog);
//     }
//     save(STORAGE_KEYS.LOGS, logs);
//     return newLog;
//   },

//   async getLogs(userId: string): Promise<DailyLog[]> {
//     return get<DailyLog>(STORAGE_KEYS.LOGS).filter(l => l.userId === userId);
//   },

//   // Aggregated Stats
//   async getDashboardStats(userId: string) {
//     const exams = await this.getExamResults(userId);
//     const logs = await this.getLogs(userId);
    
//     const avgScore = exams.length > 0 ? exams.reduce((acc, curr) => acc + curr.score, 0) / exams.length : 0;
//     const studyHoursThisWeek = logs.reduce((acc, curr) => {
//       const logDate = new Date(curr.date);
//       const weekAgo = new Date();
//       weekAgo.setDate(weekAgo.getDate() - 7);
//       return logDate > weekAgo ? acc + curr.hours : acc;
//     }, 0);

//     // Calc streak
//     const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//     let streak = 0;
//     let today = new Date();
//     today.setHours(0,0,0,0);
    
//     for(let log of sortedLogs) {
//       const d = new Date(log.date);
//       d.setHours(0,0,0,0);
//       const diff = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
//       if(diff === streak) streak++;
//       else break;
//     }

//     return {
//       totalExams: exams.length,
//       avgScore: Math.round(avgScore),
//       studyHoursThisWeek,
//       streak
//     };
//   }
// };


import {
  collection,
  addDoc,
  getDocs,
  query,
  where
  , updateDoc
} from "firebase/firestore";

import { firestore } from "./firebase";
import { User, SkillGapReport, ExamResult, InterviewSession, DailyLog } from "../types";

export const db = {
  // ---------- USERS ----------
  async signup(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(firestore, "users"), newUser);
    return newUser;
  },

  async signin(email: string): Promise<User | null> {
    const q = query(
      collection(firestore, "users"),
      where("email", "==", email)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as User);
  },

  // ---------- SKILL GAP ----------
  async saveSkillReport(
    report: Omit<SkillGapReport, "id" | "createdAt">
  ): Promise<SkillGapReport> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, "skillReports"), {
      ...report,
      createdAt
    });

    return { ...report, id: docRef.id, createdAt };
  },

  async getSkillReports(userId: string): Promise<SkillGapReport[]> {
    const q = query(
      collection(firestore, "skillReports"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SkillGapReport[];
  },

  // ---------- EXAMS ----------
  async saveExamResult(
    result: Omit<ExamResult, "id" | "createdAt">
  ): Promise<ExamResult> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, "examResults"), {
      ...result,
      createdAt
    });

    return { ...result, id: docRef.id, createdAt };
  },

  async getExamResults(userId: string): Promise<ExamResult[]> {
    const q = query(
      collection(firestore, "examResults"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExamResult[];
  },

  // ---------- INTERVIEWS ----------
  async saveInterview(
    session: Omit<InterviewSession, "id" | "createdAt">
  ): Promise<InterviewSession> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, "interviews"), {
      ...session,
      createdAt
    });

    return { ...session, id: docRef.id, createdAt };
  },

  async getInterviews(userId: string): Promise<InterviewSession[]> {
    const q = query(
      collection(firestore, "interviews"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as InterviewSession[];
  },

  // ---------- USER HELPERS ----------
  async getUserById(id: string): Promise<User | null> {
    const q = query(
      collection(firestore, "users"),
      where("id", "==", id)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as User);
  },

  async getUsersByInterests(userId: string, interests: string[], limit = 10): Promise<User[]> {
    if (!interests || interests.length === 0) return [];
    // Use array-contains-any to find users that share any of the interests
    const q = query(
      collection(firestore, "users"),
      where("interests", "array-contains-any", interests)
    );
    const snap = await getDocs(q);
    const users = snap.docs.map(doc => doc.data() as User).filter(u => u.id !== userId);
    return users.slice(0, limit);
  },

  async getAllInterests(): Promise<string[]> {
    const snap = await getDocs(collection(firestore, "users"));
    const all: string[] = [];
    snap.docs.forEach(d => {
      const u = d.data() as User;
      if (u.interests && Array.isArray(u.interests)) {
        all.push(...u.interests);
      }
    });
    // return unique interests
    return Array.from(new Set(all)).slice(0, 200);
  },

  async toggleFavorite(userId: string, targetId: string): Promise<User | null> {
    // Find user doc by id
    const q = query(collection(firestore, "users"), where("id", "==", userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docRef = snap.docs[0].ref;
    const user = snap.docs[0].data() as User;
    const favs = Array.isArray(user.favorites) ? user.favorites.slice() : [];
    const idx = favs.indexOf(targetId);
    if (idx === -1) favs.push(targetId); else favs.splice(idx, 1);
    await updateDoc(docRef, { favorites: favs });
    const updatedSnap = await getDocs(query(collection(firestore, "users"), where("id", "==", userId)));
    return updatedSnap.docs[0].data() as User;
  },

  // ---------- DAILY LOGS ----------
  async saveDailyLog(userId: string, hours: number): Promise<DailyLog> {
    const today = new Date().toISOString().split("T")[0];

    // Check if there's an existing log for the user for today
    const q = query(
      collection(firestore, "dailyLogs"),
      where("userId", "==", userId),
      where("date", "==", today)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Update the first matching doc by adding hours
      const doc = snap.docs[0];
      const existing = doc.data() as DailyLog;
      const newHours = (existing.hours || 0) + hours;
      await updateDoc(doc.ref, { hours: newHours });
      return { ...existing, hours: newHours } as DailyLog;
    }

    // Create a new log for today
    const log: DailyLog = {
      id: crypto.randomUUID(),
      userId,
      hours,
      date: today
    };

    await addDoc(collection(firestore, "dailyLogs"), log);
    return log;
  },

  async getLogs(userId: string): Promise<DailyLog[]> {
    const q = query(
      collection(firestore, "dailyLogs"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    return snap.docs.map(doc => doc.data()) as DailyLog[];
  },

  async signinByUID(uid: string): Promise<User | null> {
  const q = query(
    collection(firestore, "users"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as User);
}
,

  async updateUser(user: Partial<User> & { uid?: string; id?: string }): Promise<User> {
    // Try to find existing user by uid or id
    let q;
    if (user.uid) {
      q = query(collection(firestore, "users"), where("uid", "==", user.uid));
    } else if (user.id) {
      q = query(collection(firestore, "users"), where("id", "==", user.id));
    }

    if (q) {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docRef = snap.docs[0].ref;
        // Only update allowed fields
        const dataToUpdate: any = {};
        if (user.name !== undefined) dataToUpdate.name = user.name;
        if (user.email !== undefined) dataToUpdate.email = user.email;
        if (user.uid !== undefined) dataToUpdate.uid = user.uid;
        if (user.linkedin !== undefined) dataToUpdate.linkedin = user.linkedin;
        if (user.leetcode !== undefined) dataToUpdate.leetcode = user.leetcode;
        if (user.github !== undefined) dataToUpdate.github = user.github;
        if (user.interests !== undefined) dataToUpdate.interests = user.interests;
        if (user.favorites !== undefined) dataToUpdate.favorites = user.favorites;

        await updateDoc(docRef, dataToUpdate);
        const updated = (await getDocs(query(collection(firestore, "users"), where("uid", "==", user.uid))))
          .docs[0].data() as User;
        return updated;
      }
    }

    // If not found, create a new user doc
    const newUser: User = {
      id: crypto.randomUUID(),
      uid: user.uid || '',
      name: user.name || 'User',
      email: user.email || '',
      linkedin: user.linkedin || '',
      leetcode: user.leetcode || '',
      github: user.github || '',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(firestore, "users"), newUser);
    return newUser;
  },

  // ---------- DASHBOARD (same logic) ----------
  async getDashboardStats(userId: string) {
    const exams = await this.getExamResults(userId);
    const logs = await this.getLogs(userId);

    const avgScore =
      exams.length > 0
        ? exams.reduce((a, c) => a + c.score, 0) / exams.length
        : 0;

    const studyHoursThisWeek = logs.reduce((acc, log) => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate > weekAgo ? acc + log.hours : acc;
    }, 0);

    const sortedLogs = logs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const d = new Date(log.date);
      d.setHours(0, 0, 0, 0);
      const diff = (today.getTime() - d.getTime()) / 86400000;
      if (diff === streak) streak++;
      else break;
    }

    return {
      totalExams: exams.length,
      avgScore: Math.round(avgScore),
      studyHoursThisWeek,
      streak
    };
  }
};
