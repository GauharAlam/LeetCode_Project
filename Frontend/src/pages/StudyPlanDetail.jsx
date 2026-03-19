import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import {
    BookOpen, ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2,
    Clock, Trophy, Users, ChevronDown, ChevronRight, Lock, Unlock,
    Play, Pause, LogOut
} from 'lucide-react';

const StudyPlanDetail = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [expandedDays, setExpandedDays] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlanDetails();
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get(`/study-plan/${planId}`);
            setPlan(data);
            // Auto-expand current day and first day
            if (data.days?.length > 0) {
                const autoExpand = {};
                autoExpand[0] = true;
                if (data.currentDay > 0) {
                    const currentDayIndex = data.days.findIndex(d => d.dayNumber === data.currentDay);
                    if (currentDayIndex >= 0) autoExpand[currentDayIndex] = true;
                }
                setExpandedDays(autoExpand);
            }
        } catch (err) {
            console.error("Failed to fetch plan:", err);
            setError("Failed to load study plan");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            await axiosClient.post(`/study-plan/${planId}/enroll`);
            await fetchPlanDetails();
        } catch (err) {
            console.error("Enroll error:", err);
            alert(err.response?.data?.message || "Failed to enroll");
        } finally {
            setEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        if (!confirm("Are you sure you want to unenroll? Your progress will be lost.")) return;
        try {
            setEnrolling(true);
            await axiosClient.delete(`/study-plan/${planId}/enroll`);
            await fetchPlanDetails();
        } catch (err) {
            console.error("Unenroll error:", err);
            alert(err.response?.data?.message || "Failed to unenroll");
        } finally {
            setEnrolling(false);
        }
    };

    const toggleDay = (index) => {
        setExpandedDays(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return 'text-gray-400';
            case 'medium': return 'text-gray-400';
            case 'hard': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    const getDifficultyBadge = (diff) => {
        switch (diff) {
            case 'easy': return 'bg-gray-600/15 text-gray-400 border-gray-400/30';
            case 'medium': return 'bg-gray-200 text-gray-400 border-gray-400';
            case 'hard': return 'bg-gray-500/15 text-gray-400 border-gray-400/30';
            default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
        }
    };

    const isProblemSolved = (problemId) => {
        return plan?.solvedProblems?.includes(problemId?.toString());
    };

    const progressPercent = plan?.totalProblems > 0
        ? Math.round((plan.solvedCount / plan.totalProblems) * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d1117]">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="min-h-screen bg-[#0d1117]">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                    <p className="text-gray-400 text-lg">{error || "Plan not found"}</p>
                    <button
                        onClick={() => navigate('/study-plans')}
                        className="text-gray-400 hover:underline flex items-center gap-1"
                    >
                        <ArrowLeft size={16} /> Back to Study Plans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-300">
            <Navbar />

            <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/study-plans')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Study Plans</span>
                </button>

                {/* Plan Header */}
                <div className="bg-[#161b22] rounded-2xl border border-gray-800 p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800`}>
                                    <BookOpen className="text-gray-900 dark:text-white" size={28} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">{plan.name}</h1>
                                    {plan.isOfficial && (
                                        <span className="text-xs bg-gray-200 text-gray-400 px-2 py-0.5 rounded-full border border-gray-300/30">
                                            Official
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-400 mb-4 text-lg">{plan.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {plan.topics?.map((topic, idx) => (
                                    <span 
                                        key={idx} 
                                        onClick={() => navigate(`/problems?tag=${encodeURIComponent(topic)}`)}
                                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} /> {plan.duration} days
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <BookOpen size={14} /> {plan.totalProblems} problems
                                </span>
                                <span className={`flex items-center gap-1.5 capitalize ${getDifficultyColor(plan.difficulty)}`}>
                                    <Trophy size={14} /> {plan.difficulty}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} /> {plan.enrolledCount || 0} enrolled
                                </span>
                            </div>
                        </div>

                        {/* Enrollment / Progress Section */}
                        <div className="md:w-64 shrink-0">
                            {plan.isEnrolled ? (
                                <div className="bg-[#0d1117] rounded-xl p-5 border border-gray-800">
                                    {/* Progress circle */}
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="relative w-28 h-28">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="56" cy="56" r="48" stroke="#374151" strokeWidth="8" fill="none" />
                                                <circle
                                                    cx="56" cy="56" r="48"
                                                    stroke="url(#planGradient)"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${2 * Math.PI * 48}`}
                                                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - progressPercent / 100)}`}
                                                    className="transition-all duration-700 ease-out"
                                                />
                                                <defs>
                                                    <linearGradient id="planGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#9ca3af" />
                                                        <stop offset="100%" stopColor="#4b5563" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-white">{progressPercent}%</span>
                                                <span className="text-xs text-gray-500">complete</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-3">
                                        <p className="text-sm text-gray-400">
                                            <span className="text-white font-semibold">{plan.solvedCount}</span> / {plan.totalProblems} solved
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Day {plan.currentDay} of {plan.duration}
                                        </p>
                                    </div>

                                    {plan.enrollmentStatus === 'completed' ? (
                                        <div className="text-center py-2 bg-gray-600/10 rounded-lg border border-gray-400/30">
                                            <Trophy className="inline text-gray-400 mr-1" size={16} />
                                            <span className="text-gray-400 font-medium text-sm">Completed!</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleUnenroll}
                                            disabled={enrolling}
                                            className="w-full btn btn-sm bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-500/10 hover:text-gray-400 hover:border-gray-400/30 transition-all"
                                        >
                                            <LogOut size={14} />
                                            {enrolling ? 'Leaving...' : 'Leave Plan'}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="w-full btn bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none text-lg py-3 hover:bg-black dark:hover:bg-gray-200 transition-all font-semibold rounded-xl"
                                >
                                    {enrolling ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Play size={20} /> Start This Plan
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Day-wise Problem List */}
                <div className="space-y-3">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-gray-400" /> 
                        Plan Schedule
                    </h2>

                    {plan.days && plan.days.length > 0 ? (
                        plan.days.map((day, dayIndex) => {
                            const isExpanded = expandedDays[dayIndex];
                            const dayProblems = day.problems || [];
                            const solvedInDay = dayProblems.filter(p => isProblemSolved(p._id)).length;
                            const isDayComplete = dayProblems.length > 0 && solvedInDay === dayProblems.length;
                            const isCurrentDay = plan.isEnrolled && day.dayNumber === plan.currentDay;

                            return (
                                <div
                                    key={dayIndex}
                                    className={`bg-[#161b22] rounded-xl border transition-all ${
                                        isCurrentDay
                                            ? 'border-gray-400 dark:border-gray-500 shadow-md'
                                            : isDayComplete
                                                ? 'border-gray-200 dark:border-gray-800'
                                                : 'border-gray-300 dark:border-gray-800'
                                    }`}
                                >
                                    {/* Day Header */}
                                    <button
                                        onClick={() => toggleDay(dayIndex)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isDayComplete ? (
                                                <CheckCircle2 className="text-gray-400 shrink-0" size={22} />
                                            ) : isCurrentDay ? (
                                                <div className="w-[22px] h-[22px] rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                                                    <Play className="text-white" size={12} />
                                                </div>
                                            ) : (
                                                <Circle className="text-gray-600 shrink-0" size={22} />
                                            )}
                                            <div className="text-left">
                                                <span className="font-semibold text-white">
                                                    Day {day.dayNumber}
                                                </span>
                                                {day.title && (
                                                    <span className="text-gray-500 ml-2">— {day.title}</span>
                                                )}
                                                {isCurrentDay && (
                                                    <span className="ml-2 text-xs bg-gray-200 text-gray-400 px-2 py-0.5 rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">
                                                {solvedInDay}/{dayProblems.length} problems
                                            </span>
                                            {isExpanded ? (
                                                <ChevronDown className="text-gray-500" size={18} />
                                            ) : (
                                                <ChevronRight className="text-gray-500" size={18} />
                                            )}
                                        </div>
                                    </button>

                                    {/* Problem List (expanded) */}
                                    {isExpanded && dayProblems.length > 0 && (
                                        <div className="px-4 pb-4 space-y-2">
                                            <div className="border-t border-gray-800 pt-3">
                                                {dayProblems.map((problem, pIdx) => {
                                                    const solved = isProblemSolved(problem._id);
                                                    return (
                                                        <div
                                                            key={problem._id || pIdx}
                                                            className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-800/50 ${
                                                                solved ? 'bg-gray-600/5' : ''
                                                            }`}
                                                            onClick={() => navigate(`/problem/${problem._id}`)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {solved ? (
                                                                    <CheckCircle2 className="text-gray-400 shrink-0" size={18} />
                                                                ) : (
                                                                    <Circle className="text-gray-600 shrink-0" size={18} />
                                                                )}
                                                                <span className={`font-medium ${solved ? 'text-gray-400 line-through' : 'text-white'}`}>
                                                                    {problem.title || 'Untitled Problem'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {problem.tags?.slice(0, 2).map((tag, tIdx) => (
                                                                    <span key={tIdx} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded hidden sm:inline">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                <span className={`text-xs px-2 py-1 rounded-lg border capitalize ${getDifficultyBadge(problem.difficulty)}`}>
                                                                    {problem.difficulty}
                                                                </span>
                                                                <ArrowRight className="text-gray-600" size={14} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {isExpanded && dayProblems.length === 0 && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-gray-600 italic">No problems assigned for this day yet.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-8 text-center">
                            <BookOpen className="mx-auto text-gray-600 mb-3" size={40} />
                            <p className="text-gray-500">No schedule has been created for this plan yet.</p>
                            <p className="text-gray-600 text-sm mt-1">Problems will be added by the plan creator.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudyPlanDetail;
