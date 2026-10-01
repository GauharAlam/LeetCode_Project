import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TemperGauge from '../components/TemperGauge';
import axiosClient from '../utils/axiosClient';
import {
    BookOpen, ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2,
    Clock, Trophy, Users, ChevronDown, ChevronRight,
    Play, LogOut, Sparkles, Check, Flame, Share2
} from 'lucide-react';

const StudyPlanDetail = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [expandedDays, setExpandedDays] = useState({});
    const [error, setError] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        fetchPlanDetails();
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get(`/study-plan/${planId}`);
            setPlan(data);
            
            // Auto-expand all days or active day
            if (data.days?.length > 0) {
                const autoExpand = {};
                data.days.forEach((day, idx) => {
                    // Auto-expand first 3 days or any day with unsolved problems
                    autoExpand[idx] = true;
                });
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
        if (!confirm("Are you sure you want to leave this plan? Your progress will be saved in your profile.")) return;
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

    const toggleAllDays = (expand) => {
        if (!plan?.days) return;
        const state = {};
        plan.days.forEach((_, idx) => { state[idx] = expand; });
        setExpandedDays(state);
    };

    const isProblemSolved = (problemId) => {
        if (!problemId || !plan?.solvedProblems) return false;
        return plan.solvedProblems.includes(problemId.toString());
    };

    // Find the next unsolved problem in the plan
    const nextUnsolvedProblem = useMemo(() => {
        if (!plan?.days) return null;
        for (const day of plan.days) {
            for (const prob of (day.problems || [])) {
                if (prob?._id && !isProblemSolved(prob._id)) {
                    return { ...prob, dayNumber: day.dayNumber, dayTitle: day.title };
                }
            }
        }
        return null;
    }, [plan]);

    const getDifficultyBadge = (diff) => {
        switch (diff) {
            case 'easy': return 'badge-easy';
            case 'medium': return 'badge-medium';
            case 'hard': return 'badge-hard';
            default: return 'badge-steel';
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

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

    const progressPercent = plan.progress || 0;
    const isCompleted = plan.enrollmentStatus === 'completed' || (plan.totalProblems > 0 && plan.solvedCount >= plan.totalProblems);

    return (
        <div className="min-h-screen bg-canvas text-text-primary pb-20">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button & Share */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/study-plans')}
                        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Study Plans</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="btn-secondary-af px-3 py-1.5 text-xs flex items-center gap-1.5 text-text-muted hover:text-text-primary"
                    >
                        {copiedLink ? <Check size={14} className="text-easy" /> : <Share2 size={14} />}
                        {copiedLink ? 'Link Copied!' : 'Share Plan'}
                    </button>
                </div>

                {/* ─── HERO DETAIL CARD ─── */}
                <div className="card-af p-6 sm:p-8 mb-8 relative overflow-hidden bg-surface">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-elevated border border-border-subtle rounded-xl text-ember-400">
                                    <BookOpen size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-display">{plan.name}</h1>
                                        {plan.isOfficial && (
                                            <span className="text-[10px] bg-ember-500/10 text-ember-300 border border-ember-500/20 px-2 py-0.5 rounded font-mono font-bold">
                                                OFFICIAL
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-muted font-mono mt-0.5">
                                        Curated by {plan.createdBy?.firstName || 'AlgoForge'} {plan.createdBy?.lastName || 'Team'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-text-secondary mb-5 text-sm sm:text-base leading-relaxed">{plan.description}</p>

                            {/* Topics */}
                            <div className="flex flex-wrap gap-1.5 mb-6">
                                {plan.topics?.map((topic, idx) => (
                                    <span 
                                        key={idx} 
                                        onClick={() => navigate(`/problems?tag=${encodeURIComponent(topic)}`)}
                                        className="tag-chip cursor-pointer text-xs"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>

                            {/* Metadata Pills */}
                            <div className="flex flex-wrap gap-6 text-xs font-mono text-text-muted pt-4 border-t border-border-subtle">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-ember-400" /> {plan.duration} Days Duration
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <BookOpen size={14} className="text-ember-400" /> {plan.totalProblems} Problems Total
                                </span>
                                <span className="flex items-center gap-1.5 capitalize">
                                    <span className={getDifficultyBadge(plan.difficulty)}>{plan.difficulty}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} /> {plan.enrolledCount || 0} Enrolled Learners
                                </span>
                            </div>
                        </div>

                        {/* Progress Gauge / Actions */}
                        <div className="lg:w-72 shrink-0 flex flex-col items-center justify-center p-6 bg-inset rounded-2xl border border-border-subtle">
                            {plan.isEnrolled ? (
                                <>
                                    <div className="flex items-center justify-center mb-4">
                                        <TemperGauge variant="ring" progress={progressPercent} size={120} strokeWidth={9}>
                                            <span className="text-2xl font-bold text-text-primary font-mono">{progressPercent}%</span>
                                            <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">COMPLETE</span>
                                        </TemperGauge>
                                    </div>

                                    <div className="text-center mb-5 w-full">
                                        <p className="text-sm font-semibold text-text-primary">
                                            <span className="font-mono text-ember-400">{plan.solvedCount || 0}</span> of {plan.totalProblems || 0} problems solved
                                        </p>
                                        <p className="text-xs text-text-muted mt-1 font-mono">
                                            {isCompleted ? "🎉 All challenges completed!" : `Day ${plan.currentDay || 1} in focus`}
                                        </p>
                                    </div>

                                    {nextUnsolvedProblem && !isCompleted ? (
                                        <button
                                            onClick={() => navigate(`/problem/${nextUnsolvedProblem._id}`)}
                                            className="w-full btn-ember py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-ember-500/10 mb-2"
                                        >
                                            <Play size={14} /> Continue: {nextUnsolvedProblem.title}
                                        </button>
                                    ) : isCompleted ? (
                                        <div className="w-full text-center py-2 bg-easy/10 rounded-lg border border-easy/20 text-easy text-xs font-semibold mb-2 flex items-center justify-center gap-1.5">
                                            <Trophy size={14} /> Track Completed!
                                        </div>
                                    ) : null}

                                    <button
                                        onClick={handleUnenroll}
                                        disabled={enrolling}
                                        className="w-full btn-ghost-af py-2 text-xs text-text-muted hover:text-hard flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <LogOut size={13} />
                                        {enrolling ? 'Leaving...' : 'Leave Track'}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center w-full">
                                    <div className="w-14 h-14 rounded-full bg-ember-500/10 border border-ember-500/20 text-ember-400 flex items-center justify-center mx-auto mb-4">
                                        <Flame size={28} />
                                    </div>
                                    <h3 className="font-bold text-base text-text-primary font-display mb-1">Ready to Start?</h3>
                                    <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                                        Follow this plan daily to stay accountable and track your progress.
                                    </p>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full btn-ember py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-ember-500/10 hover:shadow-ember-500/20"
                                    >
                                        {enrolling ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <>
                                                <Play size={16} /> Enroll & Start Day 1
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── SCHEDULE TIMELINE ─── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <BookOpen size={20} className="text-ember-400" />
                            <h2 className="text-xl font-bold text-text-primary font-display">Daily Schedule & Problems</h2>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleAllDays(true)}
                                className="btn-secondary-af px-3 py-1 text-xs"
                            >
                                Expand All
                            </button>
                            <button
                                onClick={() => toggleAllDays(false)}
                                className="btn-secondary-af px-3 py-1 text-xs"
                            >
                                Collapse All
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {plan.days && plan.days.length > 0 ? (
                            plan.days.map((day, dayIndex) => {
                                const isExpanded = expandedDays[dayIndex];
                                const dayProblems = day.problems || [];
                                const solvedInDay = dayProblems.filter(p => p && isProblemSolved(p._id)).length;
                                const isDayComplete = dayProblems.length > 0 && solvedInDay === dayProblems.length;
                                const isCurrentDay = plan.isEnrolled && day.dayNumber === plan.currentDay;

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`bg-surface rounded-xl border transition-all overflow-hidden ${
                                            isDayComplete
                                                ? 'border-easy/30 bg-easy/[0.02]'
                                                : isCurrentDay
                                                ? 'border-ember-400/50 shadow-md shadow-ember-400/5'
                                                : 'border-border-subtle hover:border-border-subtle/80'
                                        }`}
                                    >
                                        {/* Day Header Accordion Toggle */}
                                        <button
                                            onClick={() => toggleDay(dayIndex)}
                                            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-elevated/40 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                {isDayComplete ? (
                                                    <div className="w-7 h-7 rounded-full bg-easy/10 border border-easy/30 flex items-center justify-center shrink-0">
                                                        <Check size={16} className="text-easy" />
                                                    </div>
                                                ) : isCurrentDay ? (
                                                    <div className="w-7 h-7 rounded-full bg-ember-500/20 border border-ember-500/40 flex items-center justify-center shrink-0">
                                                        <Play size={13} className="text-ember-400 fill-ember-400" />
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-elevated border border-border-subtle flex items-center justify-center shrink-0 text-text-muted font-mono text-xs">
                                                        {day.dayNumber}
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-sm sm:text-base text-text-primary font-display">
                                                            Day {day.dayNumber}
                                                        </span>
                                                        {day.title && (
                                                            <span className="text-text-secondary text-xs sm:text-sm">
                                                                • {day.title}
                                                            </span>
                                                        )}
                                                        {isCurrentDay && (
                                                            <span className="text-[10px] bg-ember-500/10 text-ember-300 border border-ember-500/20 px-2 py-0.2 rounded-full font-mono font-bold">
                                                                CURRENT
                                                            </span>
                                                        )}
                                                        {isDayComplete && (
                                                            <span className="text-[10px] bg-easy/10 text-easy border border-easy/20 px-2 py-0.2 rounded-full font-mono font-bold">
                                                                COMPLETED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-muted font-mono mt-0.5">
                                                        {dayProblems.length} challenge{dayProblems.length === 1 ? '' : 's'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-mono text-text-muted">
                                                    {solvedInDay}/{dayProblems.length} solved
                                                </span>
                                                <div className="p-1 rounded-md bg-elevated text-text-muted">
                                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </div>
                                            </div>
                                        </button>

                                        {/* Problems list */}
                                        {isExpanded && dayProblems.length > 0 && (
                                            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                                                <div className="border-t border-border-subtle/60 pt-3 space-y-2">
                                                    {dayProblems.map((problem, pIdx) => {
                                                        if (!problem) return null;
                                                        const solved = isProblemSolved(problem._id);

                                                        return (
                                                            <div
                                                                key={problem._id || pIdx}
                                                                onClick={() => navigate(`/problem/${problem._id}`)}
                                                                className={`flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer border ${
                                                                    solved
                                                                        ? 'bg-inset/40 border-border-subtle/40 hover:bg-elevated/40'
                                                                        : 'bg-elevated/50 border-border-subtle hover:border-ember-400/40 hover:bg-elevated'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 pr-4">
                                                                    {solved ? (
                                                                        <CheckCircle2 className="text-easy shrink-0" size={18} />
                                                                    ) : (
                                                                        <Circle className="text-text-muted shrink-0" size={18} />
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <span className={`font-semibold text-sm truncate block ${
                                                                            solved ? 'text-text-muted line-through' : 'text-text-primary'
                                                                        }`}>
                                                                            {problem.title || 'Untitled Problem'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                                        {problem.tags?.slice(0, 2).map((tag, tIdx) => (
                                                                            <span key={tIdx} className="tag-chip text-[11px] py-0.5">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    <span className={getDifficultyBadge(problem.difficulty)}>
                                                                        {problem.difficulty}
                                                                    </span>
                                                                    <ArrowRight className="text-text-muted group-hover:text-ember-400 transition-colors" size={15} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="card-af p-8 text-center">
                                <BookOpen className="mx-auto text-text-muted mb-3" size={40} />
                                <p className="text-text-secondary">No schedule has been created for this plan yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default StudyPlanDetail;
