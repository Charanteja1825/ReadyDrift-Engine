
import React, { useState, useRef, useEffect } from 'react';
import { User, InterviewSession } from '../types';
import { generateInterviewFeedback } from '../services/ai';
import { db } from '../services/db';
import { Video, VideoOff, Mic, MicOff, Play, Pause, CheckCircle, Loader2, Award, Zap, Smile } from 'lucide-react';

interface MockInterviewsProps {
  user: User;
}

const MockInterviews: React.FC<MockInterviewsProps> = ({ user }) => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const timerRef = useRef<number | null>(null);

  // Device checks / preview
  const [deviceStatus, setDeviceStatus] = useState({ cameraAvailable: false, micAvailable: false, permissionError: false });
  const [testingPreview, setTestingPreview] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  // Track whether tracks are enabled
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Effect to handle attaching the stream to the video element once it is rendered
  useEffect(() => {
    if (isActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isActive, stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startInterview = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      setStream(s);
      setIsActive(true);
      setSession(null);
      setPaused(false);
      setElapsed(0);
      setCameraOn(true);
      setMicOn(true);
      startTimer();
    } catch (err) {
      console.error("Media error:", err);
      alert("Please allow camera and microphone access to start your mock interview.");
    }
  };

  const endInterview = async () => {
    setLoading(true);
    stopTimer();
    
    // Stop the camera/mic tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    try {
      const aiFeedback = await generateInterviewFeedback();
      const toSave = {
        userId: user.id,
        ...aiFeedback,
        duration: elapsed
      } as any;
      const newSession = await db.saveInterview(toSave);
      setSession(newSession);
      setIsActive(false);
      // refresh recent sessions
      loadRecentSessions();
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- helper: fetch recent interviews (last 5) ---
  const loadRecentSessions = async () => {
    try {
      const all = await db.getInterviews(user.id);
      // sort by createdAt desc
      const sorted = (all || []).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentSessions(sorted.slice(0,5));
    } catch (err) {
      console.error('Failed to load interviews', err);
    }
  };

  // --- device checks & previews ---
  const checkDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDeviceStatus({
        cameraAvailable: devices.some(d => d.kind === 'videoinput'),
        micAvailable: devices.some(d => d.kind === 'audioinput'),
        permissionError: false
      });
    } catch (err) {
      console.error('Device check failed', err);
      setDeviceStatus(prev => ({ ...prev, permissionError: true }));
    }
  };

  const previewCamera = async () => {
    try {
      setTestingPreview(true);
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setPreviewStream(s);
      if (previewVideoRef.current) previewVideoRef.current.srcObject = s;
    } catch (err) {
      console.error('Preview failed', err);
      alert('Camera preview failed. Make sure permissions are allowed.');
      setTestingPreview(false);
    }
  };

  const stopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(t => t.stop());
      setPreviewStream(null);
    }
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
    setTestingPreview(false);
  };

  const testMic = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ok = s.getAudioTracks().length > 0;
      s.getTracks().forEach(t => t.stop());
      alert(ok ? 'Microphone detected and working' : 'No microphone found');
      setDeviceStatus(prev => ({ ...prev, micAvailable: ok }));
    } catch (err) {
      console.error('Mic test failed', err);
      alert('Microphone not available or permission denied');
      setDeviceStatus(prev => ({ ...prev, micAvailable: false, permissionError: true }));
    }
  };

  // toggle mic/video during live session (do not stop stream)
  const toggleMic = () => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach(t => t.enabled = !t.enabled);
    const now = !(audioTracks.length > 0 && audioTracks[0].enabled === false);
    setMicOn(now);
  };

  const toggleVideo = () => {
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    videoTracks.forEach(t => t.enabled = !t.enabled);
    const now = !(videoTracks.length > 0 && videoTracks[0].enabled === false);
    setCameraOn(now);
  };

  const pauseInterview = () => {
    if (!stream) return;
    stream.getTracks().forEach(t => t.enabled = false);
    setPaused(true);
    setCameraOn(false);
    setMicOn(false);
    stopTimer();
  };

  const resumeInterview = () => {
    if (!stream) return;
    stream.getTracks().forEach(t => t.enabled = true);
    setPaused(false);
    setCameraOn(true);
    setMicOn(true);
    startTimer();
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000) as unknown as number;
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current as number);
      timerRef.current = null;
    }
  };

  // Ensure device status and recent sessions are loaded on mount
  useEffect(() => {
    checkDevices();
    loadRecentSessions();

    return () => {
      stopTimer();
      if (previewStream) {
        previewStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">AI Behavioral Interview</h1>
        <p className="text-slate-400 mb-8">Simulate real-world interview scenarios and get emotional intelligence analysis.</p>

        {!isActive && !session && (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-6">
            <div className="bg-indigo-600/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-12 h-12 text-indigo-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Prepare your workspace</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Ensure you are in a well-lit room with a stable internet connection. 
                The AI will analyze your facial expressions, confidence markers, and clarity.
              </p>

              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  {deviceStatus.cameraAvailable ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-500" />}
                  <span className="text-sm text-slate-400">Camera {deviceStatus.cameraAvailable ? 'Ready' : 'Not found'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {deviceStatus.micAvailable ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-500" />}
                  <span className="text-sm text-slate-400">Microphone {deviceStatus.micAvailable ? 'Ready' : 'Not found'}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button onClick={checkDevices} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-100">Check Devices</button>
                <button onClick={previewCamera} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-100">Preview Camera</button>
                <button onClick={testMic} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-100">Test Microphone</button>
              </div>

              {testingPreview && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <video ref={previewVideoRef} autoPlay playsInline muted className="w-64 h-40 object-cover rounded-lg border border-slate-700" />
                  <div>
                    <button onClick={stopPreview} className="px-3 py-2 rounded-xl bg-rose-600 text-white">Stop Preview</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={startInterview}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-12 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" /> Start Interview Session
            </button>
          </div>
        )}

        {isActive && (
          <div className="space-y-6">
            <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              {/* This video element will now correctly show the user once the stream is attached via useEffect */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1] bg-slate-900"
              />
              
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="bg-red-600 w-3 h-3 rounded-full animate-pulse" />
                <span className="text-white text-sm font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  LIVE ANALYSIS ACTIVE
                </span>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center gap-1 px-4 border-r border-slate-700/50">
                  <Smile className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Emotion</span>
                  <span className="text-xs font-bold text-white uppercase">Analyzing...</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-4 border-r border-slate-700/50">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Confidence</span>
                  <span className="text-xs font-bold text-white">Detecting</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {/* Video toggle */}
                  <button onClick={toggleVideo} className={`p-3 rounded-xl ${cameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700/30 text-slate-400' } transition-colors`}>
                    {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  {/* Mic toggle */}
                  <button onClick={toggleMic} className={`p-3 rounded-xl ${micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-700/30 text-slate-400' } transition-colors`}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  {/* Pause / Resume */}
                  {!paused ? (
                    <button onClick={pauseInterview} className="px-3 py-2 rounded-xl bg-yellow-500 text-black font-bold">Pause</button>
                  ) : (
                    <button onClick={resumeInterview} className="px-3 py-2 rounded-xl bg-emerald-500 text-white font-bold flex items-center gap-2"><Play className="w-4 h-4" /> Resume</button>
                  )}

                  <div className="px-3 text-sm text-slate-300">Elapsed: {Math.floor(elapsed / 60)}:{`${(elapsed % 60).toString().padStart(2,'0')}`}</div>

                  <button 
                    onClick={endInterview}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <VideoOff className="w-5 h-5" />}
                    Finish Session
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl text-center">
              <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-4">Prompt #1</h3>
              <p className="text-xl text-slate-100 font-medium italic">
                "Describe a situation where you had to work with a difficult team member. How did you handle it and what was the outcome?"
              </p>
            </div>
          </div>
        )}

        {session && (
          <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8 pb-12">

            {/* Recent performance (last 5) */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-widest">Recent (last 5)</h3>
              <div className="flex gap-3 overflow-x-auto">
                {recentSessions.length === 0 && <span className="text-slate-500 text-sm">No history yet</span>}
                {recentSessions.map((rs) => (
                  <button key={rs.id} onClick={() => setSession(rs)} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-left text-sm hover:bg-slate-800">
                    <div className="text-slate-300 font-bold">{new Date(rs.createdAt).toLocaleDateString()}</div>
                    <div className="text-slate-400 text-xs">Confidence: <span className="font-bold text-emerald-300">{rs.confidenceScore}%</span></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Confidence Score', value: session.confidenceScore, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { label: 'Stress Level', value: session.stressLevel, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Communication Clarity', value: session.clarityScore, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                  <div className="flex items-center gap-3 mb-4 text-slate-400 font-bold uppercase text-xs">
                    <div className={`${m.bg} p-2 rounded-lg`}>
                      <m.icon className={`w-4 h-4 ${m.color}`} />
                    </div>
                    {m.label}
                  </div>
                  <div className="text-4xl font-black text-slate-100">{m.value}%</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                 <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                   <Award className="w-5 h-5 text-emerald-500" /> Key Strengths
                 </h2>
                 <ul className="space-y-4">
                   {session.feedback.strengths.map((s, i) => (
                     <li key={i} className="flex gap-3 text-slate-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                       {s}
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                 <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                   <Zap className="w-5 h-5 text-amber-500" /> Growth Areas
                 </h2>
                 <ul className="space-y-4">
                   {session.feedback.weaknesses.map((w, i) => (
                     <li key={i} className="flex gap-3 text-slate-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                       {w}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-1 rounded-3xl shadow-2xl">
              <div className="bg-indigo-600 p-8 rounded-[22px]">
                <h2 className="text-xl font-bold text-white mb-6">Expert Interview Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {session.feedback.tips.map((tip, i) => (
                    <div key={i} className="bg-white/10 p-5 rounded-2xl border border-white/20 text-white/90 text-sm leading-relaxed backdrop-blur-sm">
                      {tip}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setSession(null)}
                  className="mt-8 text-indigo-600 font-bold bg-white hover:bg-slate-100 px-8 py-3 rounded-xl transition-all shadow-xl"
                >
                  Retake Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviews;
