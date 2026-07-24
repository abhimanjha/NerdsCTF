'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { BookOpen, CheckCircle, ChevronRight, Award, Loader2 } from 'lucide-react';

export default function Academy() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [lessonContent, setLessonContent] = useState<any>(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
    const [quizFeedback, setQuizFeedback] = useState<{ [key: number]: { correct: boolean; msg: string } }>({});
    const [topicLoading, setTopicLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Load topics lists
    useEffect(() => {
        if (!user) return;
        const fetchTopics = async () => {
            try {
                const response = await api.get('/academy/topics');
                if (response.data?.success) {
                    setTopics(response.data.topics || []);
                    // Auto load first lesson if available
                    const firstTopic = response.data.topics[0];
                    if (firstTopic && firstTopic.lessons?.[0]) {
                        loadLesson(firstTopic.lessons[0].id);
                    }
                }
            } catch (error) {
                console.error("Error loading academy", error);
            } finally {
                setTopicLoading(false);
            }
        };

        fetchTopics();
    }, [user]);

    const loadLesson = async (lessonId: number) => {
        setContentLoading(true);
        setSelectedLesson(lessonId);
        setQuizFeedback({});
        setQuizAnswers({});
        try {
            const response = await api.get(`/academy/lesson/${lessonId}`);
            if (response.data?.success) {
                setLessonContent(response.data.lesson);
            }
        } catch (error) {
            console.error("Error loading lesson details", error);
        } finally {
            setContentLoading(false);
        }
    };

    const handleCompleteLesson = async () => {
        if (!lessonContent) return;
        try {
            const response = await api.post('/academy/lesson/complete', { lessonId: lessonContent.id });
            if (response.data?.success) {
                setLessonContent((prev: any) => ({ ...prev, completed: true }));
                // Update topic checks locally
                setTopics(prevTopics => prevTopics.map(t => ({
                    ...t,
                    lessons: t.lessons.map((l: any) => l.id === lessonContent.id ? { ...l, completed: true } : l)
                })));
            }
        } catch (err) {
            console.error("Error completing lesson", err);
        }
    };

    const handleQuizOption = (quizId: number, option: string) => {
        setQuizAnswers(prev => ({ ...prev, [quizId]: option }));
    };

    const handleSubmitQuiz = async (quizId: number) => {
        const answer = quizAnswers[quizId];
        if (!answer) return;

        try {
            const response = await api.post('/academy/quiz/submit', { quizId, selectedOption: answer });
            if (response.data?.success) {
                setQuizFeedback(prev => ({
                    ...prev,
                    [quizId]: {
                        correct: response.data.correct,
                        msg: response.data.message
                    }
                }));
            }
        } catch (error) {
            console.error("Quiz submission error", error);
        }
    };

    if (loading || topicLoading || !user) {
        return (
            <div className="flex-grow flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Opening Academy Library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-6xl mx-auto w-full py-8 px-6 font-mono flex flex-col md:flex-row gap-8">
            {/* Sidebar Syllabus Links */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
                <div className="glass-panel border border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BookOpen className="h-4.5 w-4.5 text-cyan-400" /> Syllabus Map
                    </h2>
                    
                    <div className="flex flex-col gap-5">
                        {topics.map((t) => (
                            <div key={t.id} className="flex flex-col gap-2">
                                <div className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">
                                    {t.title}
                                </div>
                                <div className="flex flex-col gap-1 text-xs">
                                    {t.lessons && t.lessons.map((l: any) => (
                                        <button
                                            key={l.id}
                                            onClick={() => loadLesson(l.id)}
                                            className={`flex items-center justify-between text-left p-2 rounded transition-colors ${
                                                selectedLesson === l.id 
                                                    ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-900/40' 
                                                    : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        >
                                            <span className="truncate">{l.title}</span>
                                            <ChevronRight className="h-3 w-3 opacity-60" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Lesson Content Reader */}
            <div className="flex-1 flex flex-col gap-6">
                {contentLoading ? (
                    <div className="glass-panel border border-gray-800 rounded-xl p-20 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
                    </div>
                ) : lessonContent ? (
                    <div className="flex flex-col gap-6">
                        {/* Lesson Board */}
                        <div className="glass-panel border border-gray-800 rounded-xl p-8">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                                ACADEMY MODULE // {lessonContent.topic?.title}
                            </div>
                            <h1 className="text-2xl font-extrabold text-white tracking-wide mb-6 pb-4 border-b border-gray-800/80">
                                {lessonContent.title}
                            </h1>
                            
                            {/* Standard markdown formatting wrapper styles */}
                            <div className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line mb-8">
                                {lessonContent.contentMarkdown}
                            </div>

                            {/* Complete lesson button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCompleteLesson}
                                    disabled={lessonContent.completed}
                                    className={`py-3 px-6 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                        lessonContent.completed 
                                            ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 cursor-default' 
                                            : 'cyber-btn-cyan text-white'
                                    }`}
                                >
                                    <CheckCircle className="h-4 w-4" /> 
                                    {lessonContent.completed ? 'Lesson Completed' : 'Mark Lesson Complete'}
                                </button>
                            </div>
                        </div>

                        {/* Quiz Section if present */}
                        {lessonContent.quizzes && lessonContent.quizzes.length > 0 && (
                            <div className="glass-panel border border-gray-800 rounded-xl p-6">
                                <h2 className="text-md font-bold text-white mb-5 uppercase tracking-wider flex items-center gap-2">
                                    <Award className="h-5 w-5 text-purple-400" /> Lesson Quiz Checklist
                                </h2>
                                
                                <div className="flex flex-col gap-6">
                                    {lessonContent.quizzes.map((quiz: any) => {
                                        const options = JSON.parse(quiz.optionsJson || '[]');
                                        const feedback = quizFeedback[quiz.id];
                                        return (
                                            <div key={quiz.id} className="border border-gray-800 bg-[#0d1221]/50 p-5 rounded-lg">
                                                <h4 className="text-sm text-gray-200 font-semibold mb-3 leading-relaxed">
                                                    {quiz.question}
                                                </h4>

                                                <div className="flex flex-col gap-2 text-xs mb-4">
                                                    {options.map((opt: string) => (
                                                        <label key={opt} className="flex items-center gap-2.5 p-2.5 border border-gray-850 rounded hover:bg-cyan-950/5 cursor-pointer">
                                                            <input 
                                                                type="radio" 
                                                                name={`quiz-${quiz.id}`} 
                                                                value={opt}
                                                                checked={quizAnswers[quiz.id] === opt}
                                                                onChange={() => handleQuizOption(quiz.id, opt)}
                                                                className="accent-cyan-500"
                                                            />
                                                            <span className="text-gray-300 font-medium">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => handleSubmitQuiz(quiz.id)}
                                                    className="cyber-btn-cyan text-[10px] font-bold px-4 py-2 rounded uppercase"
                                                >
                                                    Verify Choice
                                                </button>

                                                {feedback && (
                                                    <div className={`mt-3 text-xs font-bold ${feedback.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {feedback.msg}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-panel border border-gray-800 rounded-xl py-20 text-center text-gray-500 text-sm">
                        Select a lesson from syllabus list to begin study.
                    </div>
                )}
            </div>
        </div>
    );
}
