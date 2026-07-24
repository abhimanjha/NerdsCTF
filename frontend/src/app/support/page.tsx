'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { HelpCircle, Mail, MessageSquare, AlertTriangle, Send, Loader2, CheckCircle, Ticket } from 'lucide-react';

export default function Support() {
    const { user } = useAuth();
    
    // Feedback form state (Public)
    const [fbName, setFbName] = useState('');
    const [fbEmail, setFbEmail] = useState('');
    const [fbType, setFbType] = useState('FEEDBACK');
    const [fbText, setFbText] = useState('');
    const [fbFeedback, setFbFeedback] = useState('');
    const [fbLoading, setFbLoading] = useState(false);

    // Support ticket states (Authenticated)
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [ticketPriority, setTicketPriority] = useState('LOW');
    const [tickets, setTickets] = useState<any[]>([]);
    const [ticketFeedback, setTicketFeedback] = useState('');
    const [ticketLoading, setTicketLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);

    // Auto-populate feedback email if logged in
    useEffect(() => {
        if (user) {
            setFbName(user.username);
            setFbEmail(user.email);
            fetchMyTickets();
        }
    }, [user]);

    const fetchMyTickets = async () => {
        if (!user) return;
        setListLoading(true);
        try {
            const response = await api.get('/tickets/my');
            if (response.data?.success) {
                setTickets(response.data.tickets || []);
            }
        } catch (error) {
            console.error("Error loading tickets", error);
        } finally {
            setListLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFbFeedback('');
        setFbLoading(true);

        try {
            const response = await api.post('/tickets/feedback', {
                name: fbName,
                email: fbEmail,
                messageType: fbType,
                feedbackText: fbText
            });

            if (response.data?.success) {
                setFbFeedback('Feedback submitted successfully! Thank you.');
                setFbText('');
            }
        } catch (error: any) {
            setFbFeedback(error.response?.data?.error || 'Failed to submit feedback.');
        } finally {
            setFbLoading(false);
        }
    };

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTicketFeedback('');
        setTicketLoading(true);

        try {
            const response = await api.post('/tickets/create', {
                title: ticketTitle,
                description: ticketDesc,
                priority: ticketPriority
            });

            if (response.data?.success) {
                setTicketFeedback('Support ticket opened successfully.');
                setTicketTitle('');
                setTicketDesc('');
                fetchMyTickets();
            }
        } catch (error: any) {
            setTicketFeedback(error.response?.data?.error || 'Failed to create support ticket.');
        } finally {
            setTicketLoading(false);
        }
    };

    return (
        <div className="flex-grow max-w-5xl mx-auto w-full py-10 px-6 font-mono text-sm text-gray-300">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-7 w-7 text-cyan-400" /> Customer Support Center
                </h1>
                <p className="text-xs text-gray-400 mt-2">Submit bug reports, feature requests, or request direct admin support tickets.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Public feedback / Bug reporter */}
                <div className="glass-panel border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-md font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare className="h-4.5 w-4.5 text-cyan-400" /> Submit Suggestions / Bug Reports
                        </h2>

                        {fbFeedback && (
                            <div className="flex gap-2.5 items-center bg-[#0d211a] border border-green-900/50 text-green-400 p-4 rounded-lg text-xs mb-5">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                <div>{fbFeedback}</div>
                            </div>
                        )}

                        <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={fbName}
                                    onChange={(e) => setFbName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={fbEmail}
                                    onChange={(e) => setFbEmail(e.target.value)}
                                    placeholder="operator@nexus.io"
                                    className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Message Type</label>
                                <select 
                                    value={fbType}
                                    onChange={(e) => setFbType(e.target.value)}
                                    className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                >
                                    <option value="FEEDBACK">General Feedback</option>
                                    <option value="BUG_REPORT">Report platform bug</option>
                                    <option value="FEATURE_REQUEST">Feature Request</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Detailed Text</label>
                                <textarea 
                                    required 
                                    rows={4}
                                    value={fbText}
                                    onChange={(e) => setFbText(e.target.value)}
                                    placeholder="Explain your finding or request..."
                                    className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={fbLoading}
                                className="cyber-btn-cyan w-full py-2.5 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                            >
                                {fbLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Submit Message</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Support Ticket Section */}
                <div className="flex flex-col gap-6">
                    {user ? (
                        <>
                            {/* Create Ticket */}
                            <div className="glass-panel border border-gray-800 rounded-xl p-6">
                                <h2 className="text-md font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                                    <Ticket className="h-4.5 w-4.5 text-purple-400" /> Open Support Ticket
                                </h2>

                                {ticketFeedback && (
                                    <div className="flex gap-2.5 items-center bg-[#0d211a] border border-green-900/50 text-green-400 p-4 rounded-lg text-xs mb-5">
                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                        <div>{ticketFeedback}</div>
                                    </div>
                                )}

                                <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Ticket Title</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={ticketTitle}
                                            onChange={(e) => setTicketTitle(e.target.value)}
                                            placeholder="Brief issue title"
                                            className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Priority</label>
                                        <select 
                                            value={ticketPriority}
                                            onChange={(e) => setTicketPriority(e.target.value)}
                                            className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                        >
                                            <option value="LOW">Low Priority</option>
                                            <option value="MEDIUM">Medium Priority</option>
                                            <option value="HIGH">High Priority</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-widest">Problem Description</label>
                                        <textarea 
                                            required 
                                            rows={3}
                                            value={ticketDesc}
                                            onChange={(e) => setTicketDesc(e.target.value)}
                                            placeholder="Give steps to reproduce error or request support details..."
                                            className="w-full bg-[#0d1221] border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={ticketLoading}
                                        className="cyber-btn-cyan w-full py-2.5 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                                    >
                                        {ticketLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Initialize Support Ticket'}
                                    </button>
                                </form>
                            </div>

                            {/* Active Tickets List */}
                            <div className="glass-panel border border-gray-800 rounded-xl p-6">
                                <h2 className="text-md font-bold text-white mb-4 uppercase tracking-wider">Your Active Tickets ({tickets.length})</h2>
                                {listLoading ? (
                                    <div className="py-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-500" /></div>
                                ) : tickets.length > 0 ? (
                                    <div className="flex flex-col gap-3.5 max-h-48 overflow-y-auto pr-2">
                                        {tickets.map(t => (
                                            <div key={t.id} className="border border-gray-800/80 bg-gray-950/20 p-3 rounded-lg flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="font-bold text-gray-200">{t.title}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Priority: {t.priority}</div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                                    t.status === 'OPEN' ? 'text-yellow-400 border-yellow-900 bg-yellow-950/20' :
                                                    t.status === 'RESOLVED' ? 'text-emerald-400 border-emerald-900 bg-emerald-950/20' :
                                                    'text-gray-500 border-gray-900'
                                                }`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-xs text-gray-500">No support tickets opened.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="glass-panel border border-red-900/20 bg-red-950/5 p-6 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0" />
                            <div className="text-xs text-gray-400 leading-relaxed">
                                Sign-in is required to register support tickets, assign priorities, and communicate directly with platform administrators.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
