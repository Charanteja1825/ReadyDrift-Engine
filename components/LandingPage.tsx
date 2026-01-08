
import React, { useState, useEffect } from 'react';
import {
    ArrowRight,
    CheckCircle,
    Target,
    TrendingUp,
    Users,
    Video,
    Brain,
    Zap,
    ChevronRight,
    Shield,
    Star,
    Globe,
    Sparkles,
    Award
} from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
    onSignup: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Video className="w-6 h-6 text-white" />,
            color: "bg-blue-500",
            title: "AI Interviews",
            desc: "Practice with our AI interviewer that adapts to your responses and provides instant, detailed feedback on confidence and clarity."
        },
        {
            icon: <Target className="w-6 h-6 text-white" />,
            color: "bg-indigo-500",
            title: "Skill Gap Analysis",
            desc: "Identify exactly what you're missing for your dream role. Get a personalized roadmap to bridge the gap efficiently."
        },
        {
            icon: <Brain className="w-6 h-6 text-white" />,
            color: "bg-purple-500",
            title: "Smart Study Assistant",
            desc: "Get 24/7 answers to your study questions from our advanced AI tutor, customized to your learning style."
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-white" />,
            color: "bg-emerald-500",
            title: "Drift Analysis",
            desc: "Track your progress over time with advanced analytics that ensure you stay on course towards your career goals."
        }
    ];

    const stats = [
        { number: "1k+", label: "Practice Sessions" },
        { number: "95%", label: "User Satisfaction" },
        { number: "150+", label: "Career Tracks" },
        { number: "24/7", label: "AI Available" }
    ];

    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "Software Engineer at Google",
            content: "The AI mock interviews were a game changer. I went from stumbling through answers to confident storytelling in just two weeks.",
            avatar: "SJ"
        },
        {
            name: "Michael Chen",
            role: "Product Manager at Stripe",
            content: "CareerReady identified skill gaps I didn't even know I had. The roadmap it generated was the specific reason I got the job.",
            avatar: "MC"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/favicon.png" alt="SkillForge Logo" className="w-10 h-10" />
                        <span className="text-xl font-bold tracking-tight text-slate-900">SkillForge</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onLogin} className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Log in
                        </button>
                        <button onClick={onSignup} className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white btn-primary hover:scale-105 transition-transform">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 animate-pulse-subtle"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3 animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        <div className="w-full md:w-1/2 text-center md:text-left animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wide mb-6">
                                <Sparkles className="w-3 h-3" />
                                <span>AI-Powered Career Success</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                                Master Your <br />
                                <span className="text-gradient">Career Journey.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                                Bridge the gap between your skills and your dream job with customized AI preparation, smart insights, and real-time interview practice.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                <button onClick={onLogin} className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white btn-primary flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-blue-500/25 shadow-xl">
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-10 flex items-center justify-center md:justify-start gap-8 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                                <span className="text-slate-400 font-bold text-xl">GDGOC</span>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 relative animate-float">
                            <div className="relative z-10 bg-white p-2 rounded-2xl shadow-2xl border border-slate-100">
                                <div className="bg-white rounded-2xl relative group p-5 flex flex-col gap-5 shadow-2xl border border-slate-200/60">
                                    {/* Dashboard Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome back, Cherry! 👋</h3>
                                            <p className="text-slate-500 text-xs">Here's your preparation overview for today.</p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {/* Total Exams */}
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 rounded-xl bg-blue-50 text-blue-500"><Brain size={16} /></div>
                                                <span className="text-[10px] font-semibold text-slate-600">Total Exams</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900 ml-1">12</div>
                                        </div>

                                        {/* Average Score */}
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-100 transition-colors">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500"><Award size={16} /></div>
                                                <span className="text-[10px] font-semibold text-slate-600">Avg Score</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900 ml-1">88%</div>
                                        </div>

                                        {/* Study Hours */}
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-100 transition-colors">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 rounded-xl bg-amber-50 text-amber-500"><TrendingUp size={16} /></div>
                                                <span className="text-[10px] font-semibold text-slate-600">Study Hours</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900 ml-1">42</div>
                                        </div>

                                        {/* Prep Streak */}
                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500"><Zap size={16} /></div>
                                                <span className="text-[10px] font-semibold text-slate-600">Prep Streak</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900 ml-1">14 <span className="text-sm text-slate-400 font-normal">Days</span></div>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="flex flex-col sm:flex-row gap-4 flex-1 min-h-0">
                                        {/* Chart Section */}
                                        <div className="flex-[2] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 relative overflow-hidden flex flex-col">
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className="text-blue-600" size={16} />
                                                <span className="text-sm font-bold text-slate-900">Learning Activity</span>
                                            </div>
                                            <div className="flex-1 relative flex items-end px-2 pb-2">
                                                <svg className="w-full h-24 text-blue-500" preserveAspectRatio="none" viewBox="0 0 100 40">
                                                    <defs>
                                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M0 40 L0 35 Q10 35 20 38 Q30 38 40 25 Q50 15 60 20 Q70 25 80 10 Q90 5 100 0 L100 40 Z" fill="url(#gradient)" />
                                                    <path d="M0 35 Q10 35 20 38 Q30 38 40 25 Q50 15 60 20 Q70 25 80 10 Q90 5 100 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                {/* X-Axis labels mockup */}
                                                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-slate-400 mt-2">
                                                    <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Readiness Score */}
                                        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center justify-center">
                                            <div className="text-xs font-bold text-slate-900 mb-4">AI Readiness Score</div>
                                            <div className="relative w-24 h-24 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                                    <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="40" strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold text-blue-600">88</span>
                                                    <span className="text-[10px] text-slate-400">Average</span>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-slate-400 text-center mt-3 leading-tight italic">
                                                "Consistent practice is the key to mastering skills."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Decorative background for image */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] opacity-20 blur-xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{stat.number}</div>
                                <div className="text-sm md:text-base text-slate-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to <span className="text-blue-600">succeed</span></h2>
                        <p className="text-lg text-slate-600">We don't just give you content; we give you a complete intelligent ecosystem to manage your career preparation.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                                <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">{feature.desc}</p>
                                <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 group-hover:translate-x-1 transition-transform">
                                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Built for your <br /> ambitious goals</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">1</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Assess Your Skills</h4>
                                        <p className="text-slate-600">Take our comprehensive assessment to pinpoint your strengths and identify key areas for improvement.</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-slate-200 ml-4 -my-4"></div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">2</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Generate Your Roadmap</h4>
                                        <p className="text-slate-600">Get a custom-tailored study plan that adapts to your schedule and learning pace.</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-slate-200 ml-4 -my-4"></div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold border border-purple-200">3</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Practice & Perfect</h4>
                                        <p className="text-slate-600">Use our AI tools to practice interviews and exams until you achieve mastery.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 relative mt-12 md:mt-0 md:pl-8">
                            <div className="relative z-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl text-white">
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="text-xs text-slate-400 font-mono ml-auto">analysis_result.json</div>
                                </div>
                                <div className="font-mono text-sm space-y-2 opacity-80">
                                    <p><span className="text-purple-400">const</span> <span className="text-blue-400">candidate</span> = <span className="text-yellow-300">{"{"}</span></p>
                                    <p className="pl-4">status: <span className="text-green-400">"Ready_to_Hire"</span>,</p>
                                    <p className="pl-4">skills: [<span className="text-green-400">"React"</span>, <span className="text-green-400">"System_Design"</span>],</p>
                                    <p className="pl-4">interview_score: <span className="text-blue-400">98.5</span></p>
                                    <p><span className="text-yellow-300">{"}"}</span>;</p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
                                    <div className="text-xs text-slate-400">AI Analysis Complete</div>
                                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold transition-colors">View Report</button>
                                </div>
                            </div>
                            <div className="absolute -inset-4 bg-gradient-to-bl from-blue-600 to-indigo-600 rounded-[2rem] opacity-20 blur-xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>



            {/* CTA Section */}



        </div>
    );
};

export default LandingPage;
