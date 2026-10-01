import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AIRecommendation from '../components/AIRecommendation';
import TemperGauge from '../components/TemperGauge';
import axiosClient from '../utils/axiosClient';
import { 
    BookOpen, ArrowRight, Loader2, Target, Flame, 
    Trophy, Zap, Users, Clock, Plus, LayoutGrid, Map, Lock, Sparkles, 
    Search, Filter, CheckCircle2, Play, Compass, Layers, GitBranch, Terminal, ShieldCheck
} from 'lucide-react';

const ICON_MAP = {
    target: Target,
    flame: Flame,
    trophy: Trophy,
    zap: Zap,
    book: BookOpen,
    layers: Layers,
    route: GitBranch,
    network: Compass,
    map: Map
};

const StudyPlansPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [myPlans, setMyPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'official', 'my', 'community'
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [sortBy, setSortBy] = useState('featured'); // 'featured', 'duration-asc', 'duration-desc', 'enrolled'

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const [allRes, myRes] = await Promise.all([
                axiosClient.get('/study-plan/all'),
                axiosClient.get('/study-plan/my-plans')
            ]);
            setPlans(allRes.data || []);
            setMyPlans(myRes.data || []);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => ICON_MAP[iconName] || Target;

    // Extract all unique topics
    const allTopics = useMemo(() => {
        const set = new Set();
        plans.forEach(p => (p.topics || []).forEach(t => set.add(t.toLowerCase())));
        return Array.from(set).sort();
    }, [plans]);

    // Filter and sort plans
    const filteredPlans = useMemo(() => {
        let list = [...plans];

        // Tab filter
        if (activeTab === 'official') {
            list = list.filter(p => p.isOfficial);
        } else if (activeTab === 'my') {
            list = myPlans;
        } else if (activeTab === 'community') {
            list = list.filter(p => !p.isOfficial);
        }

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.topics?.some(t => t.toLowerCase().includes(q))
            );
        }

        // Difficulty filter
        if (difficultyFilter !== 'all') {
            list = list.filter(p => p.difficulty === difficultyFilter);
        }

        // Topic filter
        if (selectedTopic !== 'all') {
            list = list.filter(p => p.topics?.some(t => t.toLowerCase() === selectedTopic.toLowerCase()));
        }

        // Sorting
        list.sort((a, b) => {
            if (sortBy === 'enrolled') return (b.enrolledCount || 0) - (a.enrolledCount || 0);
            if (sortBy === 'duration-asc') return (a.duration || 0) - (b.duration || 0);
            if (sortBy === 'duration-desc') return (b.duration || 0) - (a.duration || 0);
            // Default: official first, then enrolled first, then newest
            if (a.isOfficial && !b.isOfficial) return -1;
            if (!a.isOfficial && b.isOfficial) return 1;
            return (b.enrolledCount || 0) - (a.enrolledCount || 0);
        });

        return list;
    }, [plans, myPlans, activeTab, searchQuery, difficultyFilter, selectedTopic, sortBy]);

    // Active enrollments for dashboard
    const activeEnrollments = useMemo(() => {
        return myPlans.filter(p => p.enrollmentStatus !== 'completed' && p.isEnrolled);
    }, [myPlans]);

    // Official track highlights
    const officialTracks = useMemo(() => {
        return plans.filter(p => p.isOfficial).slice(0, 4);
    }, [plans]);

    const getDifficultyBadge = (diff) => {
        switch (diff) {
            case 'easy': return 'badge-easy';
            case 'medium': return 'badge-medium';
            case 'hard': return 'badge-hard';
            default: return 'badge-steel';
        }
    };

    return (
        <div className="min-h-screen bg-canvas text-text-primary pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* ─── HERO HEADER ─── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface via-surface to-elevated border border-border-subtle p-6 sm:p-8 mb-8">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ember-500/10 border border-ember-500/20 text-ember-400 text-xs font-mono font-medium mb-3">
                                <Sparkles size={13} />
                                Structured DSA Curriculums
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold font-display text-text-primary tracking-tight">
                                Master Patterns with a Daily Plan
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
                                Don't solve random questions. Follow curated multi-day roadmaps designed by top engineers to build lasting algorithmic intuition.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => navigate('/study-plans/create')}
                                className="btn-ember px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-ember-500/10 hover:shadow-ember-500/20 transition-all"
                            >
                                <Plus size={16} />
                                Build Custom Plan
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="mt-6 pt-6 border-t border-border-subtle/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <span className="text-xs text-text-muted font-mono">AVAILABLE TRACKS</span>
                            <p className="text-xl font-bold text-text-primary font-display">{plans.length}</p>
                        </div>
                        <div>
                            <span className="text-xs text-text-muted font-mono">OFFICIAL CURRICULUMS</span>
                            <p className="text-xl font-bold text-ember-400 font-display">{plans.filter(p => p.isOfficial).length}</p>
                        </div>
                        <div>
                            <span className="text-xs text-text-muted font-mono">MY ACTIVE PLANS</span>
                            <p className="text-xl font-bold text-text-primary font-display">{myPlans.length}</p>
                        </div>
                        <div>
                            <span className="text-xs text-text-muted font-mono">TOTAL PROBLEMS</span>
                            <p className="text-xl font-bold text-text-primary font-display">
                                {plans.reduce((sum, p) => sum + (p.totalProblems || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── ACTIVE ENROLLMENT DASHBOARD ─── */}
                {activeEnrollments.length > 0 && (
                    <section className="mb-10 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Flame className="text-ember-400" size={20} />
                                <h2 className="text-xl font-bold font-display text-text-primary">Continue Learning</h2>
                            </div>
                            <span className="text-xs font-mono text-text-muted">{activeEnrollments.length} in progress</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeEnrollments.map(plan => {
                                const Icon = getIcon(plan.icon);
                                return (
                                    <div
                                        key={plan._id}
                                        onClick={() => navigate(`/study-plans/${plan._id}`)}
                                        className="card-af card-af-interactive p-5 cursor-pointer group border-ember-400/20 bg-surface hover:border-ember-400/50 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="p-2.5 rounded-xl bg-elevated border border-border-subtle text-ember-400">
                                                    <Icon size={20} />
                                                </div>
                                                <span className="text-[11px] font-mono text-ember-400 font-bold bg-ember-500/10 px-2 py-0.5 rounded border border-ember-500/20">
                                                    Day {plan.currentDay} of {plan.duration}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-base font-display text-text-primary group-hover:text-ember-300 transition-colors">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xs text-text-secondary line-clamp-1 mt-1">
                                                {plan.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border-subtle">
                                            <div className="flex justify-between text-xs text-text-muted font-mono mb-1.5">
                                                <span>{plan.solvedCount || 0} / {plan.totalProblems || 0} solved</span>
                                                <span className="font-bold text-ember-400">{plan.progress || 0}%</span>
                                            </div>
                                            <TemperGauge progress={plan.progress || 0} />
                                            <div className="mt-3 flex items-center justify-end text-xs font-semibold text-ember-400 group-hover:text-ember-300 gap-1">
                                                Resume Plan <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ─── AI RECOMMENDATION MODULE ─── */}
                <div className="mb-10">
                    <AIRecommendation onPlanCreated={fetchPlans} />
                </div>

                {/* ─── FEATURED OFFICIAL CURRICULUMS SPOTLIGHT ─── */}
                {activeTab === 'all' && searchQuery === '' && selectedTopic === 'all' && (
                    <section className="mb-12">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                            <div>
                                <p className="micro-label text-ember-400 mb-1">Standardized Learning Tracks</p>
                                <h2 className="text-2xl font-bold font-display text-text-primary">Official Pattern Curriculums</h2>
                            </div>
                            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                                Battle-tested 60-problem pathway designed to prepare you for tech interviews systematically.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {officialTracks.map(plan => {
                                const Icon = getIcon(plan.icon);
                                const isEnrolled = plan.isEnrolled;
                                const isComplete = plan.enrollmentStatus === 'completed';

                                return (
                                    <div
                                        key={plan._id}
                                        onClick={() => navigate(`/study-plans/${plan._id}`)}
                                        className="card-af card-af-interactive p-5 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-ember-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-ember-500/10 transition-all" />
                                        
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="p-2.5 rounded-xl bg-elevated border border-border-subtle text-ember-400 group-hover:scale-105 transition-transform">
                                                    <Icon size={20} />
                                                </div>
                                                <span className={getDifficultyBadge(plan.difficulty)}>
                                                    {plan.difficulty}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-mono font-bold text-ember-400 bg-ember-500/10 border border-ember-500/20 px-1.5 py-0.2 rounded">
                                                    OFFICIAL
                                                </span>
                                                <span className="text-[11px] font-mono text-text-muted">
                                                    {plan.duration} Days
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold font-display text-text-primary group-hover:text-ember-300 transition-colors">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
                                                {plan.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border-subtle">
                                            <div className="flex items-center justify-between text-xs text-text-muted font-mono mb-2">
                                                <span>{plan.totalProblems} Problems</span>
                                                <span>{plan.enrolledCount || 0} Learners</span>
                                            </div>

                                            {isEnrolled ? (
                                                <div>
                                                    <div className="flex justify-between text-[11px] font-mono mb-1 text-text-muted">
                                                        <span>Progress</span>
                                                        <span className="text-ember-400 font-bold">{plan.progress}%</span>
                                                    </div>
                                                    <TemperGauge progress={plan.progress || 0} />
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ember-400 group-hover:text-ember-300">
                                                    Explore Curriculum <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ─── SEARCH & FILTER SUITE ─── */}
                <div className="space-y-4 mb-8">
                    {/* Primary Tab Navigation & Search */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5 bg-surface rounded-control p-1 border border-border-subtle">
                            {[
                                { id: 'all', label: `All Plans (${plans.length})` },
                                { id: 'official', label: `Official Tracks (${plans.filter(p => p.isOfficial).length})` },
                                { id: 'my', label: `My Enrolled (${myPlans.length})` },
                                { id: 'community', label: `Community (${plans.filter(p => !p.isOfficial).length})` },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-elevated text-ember-400 shadow-sm border border-border-subtle'
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Sort Controls */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search curriculums..."
                                    className="input-af pl-9 pr-3 py-2 text-xs sm:text-sm w-full"
                                />
                            </div>

                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-ember-400"
                            >
                                <option value="featured">Sort: Recommended</option>
                                <option value="enrolled">Sort: Most Enrolled</option>
                                <option value="duration-asc">Sort: Shortest First</option>
                                <option value="duration-desc">Sort: Longest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Secondary Filter Chips (Difficulty & Topics) */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle/50">
                        <span className="text-xs text-text-muted font-mono flex items-center gap-1 mr-1">
                            <Filter size={12} /> Difficulty:
                        </span>
                        {['all', 'easy', 'medium', 'hard'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => setDifficultyFilter(diff)}
                                className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-all ${
                                    difficultyFilter === diff
                                        ? 'bg-ember-500/20 text-ember-300 border border-ember-500/30'
                                        : 'bg-surface text-text-muted hover:text-text-secondary border border-border-subtle'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}

                        <div className="h-4 w-px bg-border-subtle mx-1 hidden sm:block" />

                        <span className="text-xs text-text-muted font-mono ml-1 hidden sm:inline">Topic:</span>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setSelectedTopic('all')}
                                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                                    selectedTopic === 'all'
                                        ? 'bg-elevated text-text-primary border border-border-subtle'
                                        : 'bg-surface text-text-muted hover:text-text-secondary border border-border-subtle'
                                }`}
                            >
                                All Topics
                            </button>
                            {allTopics.slice(0, 8).map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(selectedTopic === topic ? 'all' : topic)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-all ${
                                        selectedTopic.toLowerCase() === topic.toLowerCase()
                                            ? 'bg-ember-500/20 text-ember-300 border border-ember-500/30'
                                            : 'bg-surface text-text-muted hover:text-text-secondary border border-border-subtle'
                                    }`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── PLANS CATALOG GRID ─── */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-ember-400" />
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-20 card-af p-8">
                        <BookOpen className="mx-auto text-text-muted mb-4" size={48} />
                        <h3 className="text-lg font-bold text-text-primary font-display">No study plans match your criteria</h3>
                        <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto">
                            {activeTab === 'my' 
                                ? "You haven't enrolled in any plans matching this filter." 
                                : "Try clearing your search query or selecting another difficulty/topic."}
                        </p>
                        <button
                            onClick={() => { setActiveTab('all'); setSearchQuery(''); setDifficultyFilter('all'); setSelectedTopic('all'); }}
                            className="mt-5 btn-ember px-5 py-2 text-xs font-semibold"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {filteredPlans.map((plan) => {
                            const Icon = getIcon(plan.icon);
                            const progress = plan.progress || 0;
                            const isEnrolled = plan.isEnrolled;
                            const isComplete = plan.enrollmentStatus === 'completed';

                            return (
                                <div
                                    key={plan._id}
                                    onClick={() => navigate(`/study-plans/${plan._id}`)}
                                    className="card-af card-af-interactive cursor-pointer group relative overflow-hidden flex flex-col justify-between p-6"
                                >
                                    {/* Top Status Badges */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="p-3 rounded-xl bg-elevated border border-border-subtle text-text-primary group-hover:text-ember-400 group-hover:border-ember-400/30 transition-all">
                                            <Icon size={22} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {plan.isOfficial && (
                                                <span className="text-[10px] bg-ember-500/10 text-ember-300 border border-ember-500/20 px-2 py-0.5 rounded font-mono font-bold">
                                                    OFFICIAL
                                                </span>
                                            )}
                                            {isEnrolled && (
                                                isComplete ? (
                                                    <span className="badge-easy text-[10px] px-2 py-0.5 flex items-center gap-1 font-mono font-bold">
                                                        <Trophy size={11} /> DONE
                                                    </span>
                                                ) : (
                                                    <span className="badge-steel text-[10px] px-2 py-0.5 font-mono font-bold">
                                                        ENROLLED
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div>
                                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-ember-300 transition-colors font-display">
                                            {plan.name}
                                        </h3>
                                        <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed mb-4">
                                            {plan.description}
                                        </p>

                                        {/* Topic Tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {plan.topics?.slice(0, 3).map((topic, idx) => (
                                                <span key={idx} className="tag-chip text-xs">
                                                    {topic}
                                                </span>
                                            ))}
                                            {plan.topics?.length > 3 && (
                                                <span className="text-[11px] text-text-muted self-center font-mono">
                                                    +{plan.topics.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div>
                                        {isEnrolled && (
                                            <div className="mb-4 pt-3 border-t border-border-subtle/60">
                                                <div className="flex justify-between text-xs text-text-muted mb-1.5 font-mono">
                                                    <span>{plan.solvedCount || 0}/{plan.totalProblems || 0} Solved</span>
                                                    <span className="text-ember-400 font-bold">{progress}%</span>
                                                </div>
                                                <TemperGauge progress={progress} />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs font-mono text-text-muted">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} /> {plan.duration}d
                                                </span>
                                                <span className={getDifficultyBadge(plan.difficulty)}>
                                                    {plan.difficulty}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users size={13} /> {plan.enrolledCount || 0}
                                                </span>
                                            </div>
                                            <div className="text-text-muted group-hover:text-ember-400 group-hover:translate-x-1 transition-all">
                                                <ArrowRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudyPlansPage;
