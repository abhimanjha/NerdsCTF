'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Terminal, Shield, Trophy, BookOpen, ChevronRight, Zap, Target, ArrowRight } from 'lucide-react';

export default function Home() {
    const { user } = useAuth();

    const features = [
        {
            icon: Shield,
            title: "Security Sandbox Labs",
            desc: "Learn real-world security vulnerabilities like Cookie tampering, Source inspection, HTTP method abuse, and API bypassing in isolated sandboxes."
        },
        {
            icon: BookOpen,
            title: "Cyber Academy",
            desc: "Follow structural learning paths covering Networking, Linux, OWASP Top 10 vulnerabilities, cryptography basics, and Privilege Escalation."
        },
        {
            icon: Trophy,
            title: "Competitive Leaderboard",
            desc: "Climb ranks by solving challenges, maintaining streaks, and competing globally. Gain points to unlock profile badges."
        }
    ];

    const statistics = [
        { label: "Active Users", value: "2,450+" },
        { label: "Practice Labs", value: "5 Core Labs" },
        { label: "Academy Lessons", value: "15+ Modules" },
        { label: "Rankings Checked", value: "Realtime" }
    ];

    const roadmapSteps = [
        { phase: "Phase 1", title: "Fundamentals", desc: "Cookies, HTML sources, basic encoding ciphers, and networking." },
        { phase: "Phase 2", title: "Web & API Security", desc: "API parameter tampering, IDOR, and custom request manipulation." },
        { phase: "Phase 3", title: "Privilege Escalation", desc: "Host privilege abuses, system capabilities, and administrative takeovers." }
    ];

    return (
        <div className="flex-1 flex flex-col font-mono text-gray-300">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center border-b border-gray-900 overflow-hidden py-20 px-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]"></div>
                <div className="max-w-4xl text-center z-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
                        <Zap className="h-3.5 w-3.5" />
                        NERD CTF v1.0 PLATFORM LAUNCHED
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Master Cybersecurity Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 cyber-glow-cyan">Hands-On Labs</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-mono">
                        Train on realistic Capture The Flag challenges. Stop reading slides, spin up interactive security target sandboxes, exploit vulnerabilities, and capture flags.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                        {user ? (
                            <Link href="/dashboard" className="cyber-btn-cyan w-full text-center py-4 rounded-lg font-bold flex items-center justify-center gap-2">
                                Go to Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/register" className="cyber-btn-cyan w-full text-center py-4 rounded-lg font-bold flex items-center justify-center gap-2">
                                    Start Training Now <ChevronRight className="h-4 w-4" />
                                </Link>
                                <Link href="/login" className="w-full text-center border border-gray-800 bg-gray-950/50 hover:bg-gray-900 text-white py-4 rounded-lg font-bold transition">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Statistics Row */}
            <section className="border-b border-gray-900 bg-[#06080e]/80 py-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {statistics.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono mb-2">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features section */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-white mb-4">Core Training Pillars</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Everything you need to go from a cybersecurity novice to an industry professional.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <div key={i} className="glass-panel glass-panel-hover p-8 rounded-xl border border-gray-800 transition duration-300">
                                <div className="w-12 h-12 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 rounded-lg flex items-center justify-center mb-6">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Academy & Roadmap section */}
            <section className="border-t border-b border-gray-900 bg-[#06080e]/40 py-24 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-1.5 border border-purple-500/30 bg-purple-950/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                            <BookOpen className="h-3.5 w-3.5" /> Learning path
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6">Structured Training Roadmap</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            We don't believe in random lists of hacking tools. nerdCTF follows a highly structured pedagogy starting with fundamental browser workings, moving to complex OWASP Top 10 vulnerabilities, and ending with API authorization checks.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                            Explore the academy <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-6">
                        {roadmapSteps.map((step, i) => (
                            <div key={i} className="flex gap-4 p-5 glass-panel rounded-lg border border-gray-800/50">
                                <div className="text-sm font-bold text-purple-400 uppercase tracking-widest mt-1">
                                    {step.phase}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                                    <p className="text-sm text-gray-400">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials or terminal command CTA */}
            <section className="py-24 px-6 text-center max-w-4xl mx-auto">
                <div className="glass-panel p-10 rounded-2xl border border-cyan-800/25 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Terminal className="h-40 w-40 text-cyan-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Ready to execute?</h2>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8 text-sm md:text-base">
                        Unlock access to active containers, save your challenge state, and earn credentials that look great on resumes.
                    </p>
                    <Link href="/register" className="cyber-btn-cyan px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2">
                        Initialize Account <Target className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-900 bg-[#05070c] py-12 px-6 text-center">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm text-gray-500">
                        &copy; 2026 nerdCTF Platform. Developed for premium security learning.
                    </div>
                    <div className="flex gap-6 text-xs text-gray-400 font-mono">
                        <Link href="/support" className="hover:text-cyan-400">Customer Support</Link>
                        <Link href="/support" className="hover:text-cyan-400">Report Bug</Link>
                        <Link href="/support" className="hover:text-cyan-400">Terms of Use</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
