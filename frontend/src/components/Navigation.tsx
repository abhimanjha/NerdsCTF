'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ShieldAlert, LogOut, LayoutDashboard, Flag, BookOpen, Trophy, Shield, HelpCircle } from 'lucide-react';

export default function Navigation() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navLinks = user ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/labs', label: 'Labs', icon: Flag },
        { href: '/academy', label: 'Academy', icon: BookOpen },
        { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { href: '/support', label: 'Support', icon: HelpCircle },
    ] : [
        { href: '/', label: 'Home', icon: ShieldAlert },
    ];

    if (user && user.role === 'ADMIN') {
        navLinks.push({ href: '/admin', label: 'Admin', icon: Shield });
    }

    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <>
        <nav className="fixed top-0 left-0 right-0 h-16 z-50 glass-panel border-b border-gray-800 flex items-center justify-between px-6 md:px-12">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-cyan-400" />
                <Link href={user ? "/dashboard" : "/"} className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-80 transition-all duration-300">
                    nerd<span className="cyber-glow-cyan text-cyan-400">CTF</span>
                </Link>
                <span className="text-[10px] bg-cyan-950/80 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-semibold">V1</span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 font-mono">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link 
                            key={link.href} 
                            href={link.href}
                            className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
                                isActive(link.href) 
                                    ? 'text-cyan-400 font-semibold border-b border-cyan-500 pb-1' 
                                    : 'text-gray-400 hover:text-cyan-400 pb-1'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Right section: Profile / Auth buttons */}
            <div className="hidden md:flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4 font-mono">
                        <div className="flex items-center gap-2 border border-gray-800 px-3 py-1 rounded bg-[#0f172a]/60">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-[10px] text-white uppercase font-bold">
                                {user.username[0]}
                            </div>
                            <span className="text-xs text-gray-300 font-semibold">{user.username}</span>
                            <span className="text-[10px] text-purple-400 border border-purple-800/50 bg-purple-950/20 px-1 py-0.2 rounded uppercase">
                                {user.role}
                            </span>
                        </div>
                        <button 
                            onClick={logout}
                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 px-3 py-1.5 rounded transition-all"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 font-mono text-sm">
                        <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="cyber-btn-cyan text-xs font-semibold px-4 py-2 rounded-md uppercase">
                            Register
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-gray-300 hover:text-white"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Drawer menu */}
            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-[#0c1221] border-b border-gray-800 py-6 px-8 flex flex-col gap-6 md:hidden font-mono z-40">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link 
                                    key={link.href} 
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-2.5 text-base ${
                                        isActive(link.href) ? 'text-cyan-400 font-bold' : 'text-gray-400'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                    
                    <hr className="border-gray-800" />
                    
                    <div>
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-sm text-white uppercase font-bold">
                                        {user.username[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-200">{user.username}</div>
                                        <div className="text-xs text-purple-400 uppercase">{user.role}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 bg-red-950/30 border border-red-900/40 text-red-400 py-2.5 rounded transition"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link 
                                    href="/login" 
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center border border-gray-700 py-2.5 rounded text-gray-300 hover:text-white"
                                >
                                    Login
                                </Link>
                                <Link 
                                    href="/register" 
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center cyber-btn-cyan py-2.5 rounded uppercase font-semibold"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
        <div className="h-16"></div>
        </>
    );
}
