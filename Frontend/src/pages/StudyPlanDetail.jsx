import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TemperGauge from '../components/TemperGauge';
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
            case 'easy': return 'text-easy';
            case 'medium': return 'text-medium';
            case 'hard': return 'text-hard';
            default: return 'text-text-muted';
        }
    };

    const getDifficultyBadge = (diff) => {
        switch (diff) {
            case 'easy': return 'badge-easy';
            case 'medium': return 'badge-medium';
            case 'hard': return 'badge-hard';
            default: return 'text-text-muted bg-elevated border border-border-subtle rounded-full text-[10px] font-mono font-bold px-2 py-0.5';
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
            <div className="min-h-screen bg-canvas">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-ember-400" />
                </div>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="min-h-screen bg-canvas">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                    <p className="text-text-muted text-lg">{error || "Plan not found"}</p>
                    <button
                        onClick={() => navigate('/study-plans')}
                        className="text-ember-400 hover:text-ember-300 flex items-center gap-1 font-medium transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Study Plans
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/study-plans')}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 font-medium text-sm"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Study Plans</span>
                </button>

                {/* Plan Header */}
                <div className="card-af p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-elevated border border-border-subtle rounded-xl text-ember-400">
                                    <BookOpen size={28} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-text-primary font-display">{plan.name}</h1>
                                    {plan.isOfficial && (
                                        <span className="text-[10px] bg-ember-400/10 text-ember-300 border border-ember-400/20 px-2 py-0.5 rounded font-mono font-bold">
                                            OFFICIAL
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-text-secondary mb-4 text-base leading-relaxed">{plan.description}</p>

                            {/* Topics */}
                            <div className="flex flex-wrap gap-1.5 mb-5">
                                {plan.topics?.map((topic, idx) => (
                                    <span 
                                        key={idx} 
                                        onClick={() => navigate(`/problems?tag=${encodeURIComponent(topic)}`)}
                                        className="tag-chip cursor-pointer"
                                    >
                                        {topic === 'arary' ? 'Array' : topic}
                                    </span>
                                ))}
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-6 text-xs font-mono text-text-muted">
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
                                <div className="bg-inset rounded-xl p-5 border border-border-subtle">
                                    {/* Progress circle using TemperGauge variant="ring" */}
                                    <div className="flex items-center justify-center mb-4">
                                        <TemperGauge variant="ring" progress={progressPercent} size={112} strokeWidth={8}>
                                            <span className="text-2xl font-bold text-text-primary font-mono">{progressPercent}%</span>
                                            <span className="text-[10px] text-text-muted">complete</span>
                                        </TemperGauge>
                                    </div>

                                    <div className="text-center mb-4">
                                        <p className="text-sm text-text-secondary">
                                            <span className="text-text-primary font-bold font-mono">{plan.solvedCount}</span> / {plan.totalProblems} solved
                                        </p>
                                        <p className="text-xs text-text-muted mt-1 font-mono">
                                            Day {plan.currentDay} of {plan.duration}
                                        </p>
                                    </div>

                                    {plan.enrollmentStatus === 'completed' ? (
                                        <div className="text-center py-2 bg-easy/10 rounded-lg border border-easy/20">
                                            <Trophy className="inline text-easy mr-1.5" size={15} />
                                            <span className="text-easy font-semibold text-sm">Completed!</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleUnenroll}
                                            disabled={enrolling}
                                            className="w-full btn-secondary-af py-2 text-xs flex items-center justify-center gap-1.5"
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
                                    className="w-full btn-ember py-3 flex items-center justify-center gap-2 text-base font-semibold"
                                >
                                    {enrolling ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Play size={18} /> Start This Plan
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Day-wise Problem List */}
                <div className="space-y-3">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2 font-display">
                        <BookOpen size={20} className="text-ember-400" /> 
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
                                    className={`bg-surface rounded-xl border transition-all overflow-hidden ${
                                        isCurrentDay
                                            ? 'border-ember-400/50 shadow-lg shadow-ember-400/5'
                                            : 'border-border-subtle'
                                    }`}
                                >
                                    {/* Day Header */}
                                    <button
                                        onClick={() => toggleDay(dayIndex)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-elevated transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isDayComplete ? (
                                                <CheckCircle2 className="text-easy shrink-0" size={22} />
                                            ) : isCurrentDay ? (
                                                <div className="w-[22px] h-[22px] rounded-lg bg-ember-600 flex items-center justify-center shrink-0">
                                                    <Play className="text-text-primary fill-current" size={11} />
                                                </div>
                                            ) : (
                                                <Circle className="text-text-muted shrink-0" size={22} />
                                            )}
                                            <div className="text-left flex items-center flex-wrap gap-2">
                                                <span className="font-semibold text-text-primary">
                                                    Day {day.dayNumber}
                                                </span>
                                                {day.title && (
                                                    <span className="text-text-secondary">— {day.title}</span>
                                                )}
                                                {isCurrentDay && (
                                                    <span className="text-[10px] bg-ember-400/10 text-ember-300 border border-ember-400/20 px-2 py-0.5 rounded-full font-mono font-bold">
                                                        CURRENT
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono text-text-muted">
                                                {solvedInDay}/{dayProblems.length} solved
                                            </span>
                                            {isExpanded ? (
                                                <ChevronDown className="text-text-muted" size={18} />
                                            ) : (
                                                <ChevronRight className="text-text-muted" size={18} />
                                            )}
                                        </div>
                                    </button>

                                    {/* Problem List (expanded) */}
                                    {isExpanded && dayProblems.length > 0 && (
                                        <div className="px-4 pb-4">
                                            <div className="border-t border-border-subtle pt-3 space-y-2">
                                                {dayProblems.map((problem, pIdx) => {
                                                    const solved = isProblemSolved(problem._id);
                                                    return (
                                                        <div
                                                            key={problem._id || pIdx}
                                                            className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer hover:bg-elevated border border-transparent hover:border-border-subtle/50 ${
                                                                solved ? 'bg-inset opacity-80' : 'bg-inset/40'
                                                            }`}
                                                            onClick={() => navigate(`/problem/${problem._id}`)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {solved ? (
                                                                    <CheckCircle2 className="text-ember-400 shrink-0" size={18} />
                                                                ) : (
                                                                    <Circle className="text-text-muted shrink-0" size={18} />
                                                                )}
                                                                <span className={`font-medium text-sm ${solved ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                                                    {problem.title || 'Untitled Problem'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {problem.tags?.slice(0, 2).map((tag, tIdx) => (
                                                                    <span key={tIdx} className="tag-chip hidden sm:inline py-0.5">
                                                                        {tag === 'arary' ? 'Array' : tag}
                                                                    </span>
                                                                ))}
                                                                <span className={getDifficultyBadge(problem.difficulty)}>
                                                                    {problem.difficulty}
                                                                </span>
                                                                <ArrowRight className="text-text-muted group-hover:text-text-secondary transition-colors" size={14} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {isExpanded && dayProblems.length === 0 && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-text-muted italic">No problems assigned for this day yet.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="card-af p-8 text-center">
                            <BookOpen className="mx-auto text-text-muted mb-3" size={40} />
                            <p className="text-text-secondary">No schedule has been created for this plan yet.</p>
                            <p className="text-text-muted text-sm mt-1">Problems will be added by the plan creator.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudyPlanDetail;
