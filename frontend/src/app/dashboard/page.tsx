'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Trophy, Award, Calendar, MapPin, CheckCircle, Activity, Loader2, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalScore: 0,
        solvedCount: 0,
        totalLabs: 0,
        rank: 0,
        badges: [] as any[],
        categoryProgress: [] as any[]
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            try {
                // Fetch challenges to calculate scores & count solved
                const chalRes = await api.get('/challenges');
                const challenges = chalRes.data.challenges || [];
                const solved = challenges.filter((c: any) => c.solved);
                const score = solved.reduce((sum: number, c: any) => sum + c.points, 0);

                // Group by category for charts
                const categoryMap: { [key: string]: { solved: number; total: number } } = {};
                challenges.forEach((c: any) => {
                    if (!categoryMap[c.category]) {
                        categoryMap[c.category] = { solved: 0, total: 0 };
                    }
                    categoryMap[c.category].total += 1;
                    if (c.solved) {
                        categoryMap[c.category].solved += 1;
                    }
                });

                const chartData = Object.keys(categoryMap).map(cat => ({
                    name: cat,
                    value: categoryMap[cat].solved,
                    total: categoryMap[cat].total
                }));

                // Fetch leaderboard to calculate rank
                const leadRes = await api.get('/leaderboard');
                const leaderboard = leadRes.data.leaderboard || [];
                const myRankIndex = leaderboard.findIndex((item: any) => item.username === user.username);
                const currentRank = myRankIndex !== -1 ? myRankIndex + 1 : leaderboard.length + 1;

                // Load badges & progress
                // Let's hardcode some seed mock user badges based on solves for premium look, or fetch from DB if needed.
                const mockBadges = [
                    { id: 1, name: 'First Blood', desc: 'Solved your first challenge successfully', icon: '🩸', unlocked: solved.length > 0 },
                    { id: 2, name: 'Elite Hacker', desc: 'Reach 500 total points', icon: '🚀', unlocked: score >= 500 },
                    { id: 3, name: 'Academy Scholar', desc: 'Complete all fundamental lessons', icon: '🎓', unlocked: solved.length > 2 }
                ];

                // Load logs
                // We'll query simple client logs.
                const logRes = await api.get('/challenges'); // fallback or mock logs
                const mockLogs = solved.map((s: any, idx: number) => ({
                    id: idx,
                    action: 'CHALLENGE_SOLVED',
                    details: `Successfully completed challenge: ${s.title}`,
                    createdAt: new Date().toLocaleDateString()
                }));

                setStats({
                    totalScore: score,
                    solvedCount: solved.length,
                    totalLabs: challenges.length,
                    rank: currentRank,
                    badges: mockBadges.filter(b => b.unlocked),
                    categoryProgress: chartData.filter(d => d.value > 0)
                });
                setRecentLogs(mockLogs);
            } catch (err) {
                console.error("Dashboard data load error", err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading || dataLoading || !user) {
        return (
            <div className="flex-grow flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Accessing Profile Node...</p>
                </div>
            </div>
        );
    }

    const COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="flex-1 max-w-6xl mx-auto w-full py-10 px-6 font-mono">
            {/* Header Profile Card */}
            <div className="glass-panel border border-gray-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Trophy className="h-40 w-40 text-cyan-500" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 z-10">
                    <div className="w-20 h-20 rounded-full border-2 border-cyan-400 bg-cyan-950/30 flex items-center justify-center text-4xl shadow-lg">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="Avatar"/> : user.username[0].toUpperCase()}
                    </div>
                    
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2.5">
                            <h1 className="text-2xl font-extrabold text-white tracking-wide">{user.username}</h1>
                            <span className="text-[10px] text-purple-400 border border-purple-800/50 bg-purple-950/20 px-2 py-0.5 rounded uppercase font-bold">
                                {user.role}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 mt-4">
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.country || 'Global'}</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> 
                                Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center z-10 w-full md:w-auto mt-6 md:mt-0">
                    <div className="border border-gray-800/80 bg-gray-950/20 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-cyan-400 cyber-glow-cyan">{stats.totalScore}</div>
                        <div className="text-[10px] text-gray-500 uppercase mt-1 tracking-wider">POINTS</div>
                    </div>
                    <div className="border border-gray-800/80 bg-gray-950/20 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-purple-400 cyber-glow-purple">#{stats.rank}</div>
                        <div className="text-[10px] text-gray-500 uppercase mt-1 tracking-wider">RANK</div>
                    </div>
                    <div className="border border-gray-800/80 bg-gray-950/20 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-400">{stats.solvedCount}/{stats.totalLabs}</div>
                        <div className="text-[10px] text-gray-500 uppercase mt-1 tracking-wider">SOLVED</div>
                    </div>
                </div>
            </div>

            {/* Dashboard details grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left col: Charts & Badges */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Charts Card */}
                    <div className="glass-panel border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-cyan-400" /> Solved Categories
                        </h2>
                        
                        {stats.categoryProgress.length > 0 ? (
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="w-48 h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.categoryProgress}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {stats.categoryProgress.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${value} solved`, name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 flex flex-col gap-3">
                                    {stats.categoryProgress.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                <span className="text-gray-300 font-semibold">{item.name}</span>
                                            </div>
                                            <div className="text-gray-500">
                                                {item.value} / {item.total} labs
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500 text-sm">
                                No solved labs yet. Head over to <a href="/labs" className="text-cyan-400 hover:underline">Labs</a> to begin.
                            </div>
                        )}
                    </div>

                    {/* Badges Card */}
                    <div className="glass-panel border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-400" /> Unlocked Badges ({stats.badges.length})
                        </h2>

                        {stats.badges.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {stats.badges.map((badge) => (
                                    <div key={badge.id} className="border border-gray-800/80 bg-gray-950/30 p-4 rounded-xl flex items-center gap-3">
                                        <div className="text-3xl">{badge.icon}</div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-200">{badge.name}</div>
                                            <div className="text-[9px] text-gray-500 mt-0.5 leading-tight">{badge.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                Solve labs to earn profile achievement badges.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right col: Activities feed */}
                <div className="glass-panel border border-gray-800 rounded-2xl p-6 h-fit">
                    <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-400" /> Recent Solves
                    </h2>

                    {recentLogs.length > 0 ? (
                        <div className="flex flex-col gap-5">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="border-l-2 border-cyan-500 pl-4 py-1 text-xs">
                                    <div className="text-gray-300 font-semibold">{log.details}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{log.createdAt}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-500 text-sm">
                            No recent logs. Exploit labs to generate flags.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
