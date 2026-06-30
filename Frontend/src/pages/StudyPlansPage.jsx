import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AIRecommendation from '../components/AIRecommendation';
import TemperGauge from '../components/TemperGauge';
import axiosClient from '../utils/axiosClient';
import { 
    BookOpen, ArrowRight, Loader2, Target, Flame, 
    Trophy, Zap, Users, Clock, Plus, LayoutGrid, Map, Lock, Sparkles, X 
} from 'lucide-react';

const ICON_MAP = {
    target: Target,
    flame: Flame,
    trophy: Trophy,
    zap: Zap,
    book: BookOpen
};

const SKILL_TREE_STEPS = [
  { id: 'arrays', name: 'Arrays & Hashing', description: 'Core data structure basics and search lookups.', topics: ['Array', 'Hash Table'], icon: 'target', difficulty: 'easy', duration: 3 },
  { id: 'pointers', name: 'Two Pointers', description: 'Iterate over sequences efficiently with multi-directional indexers.', topics: ['Two Pointers'], icon: 'flame', difficulty: 'easy', duration: 3 },
  { id: 'sliding_window', name: 'Sliding Window', description: 'Process contiguous subarrays and window calculation bounds.', topics: ['Sliding Window'], icon: 'zap', difficulty: 'medium', duration: 4 },
  { id: 'stack', name: 'Stacks & Queues', description: 'Evaluate expression hierarchies and handle order sequences.', topics: ['Stack', 'Queue'], icon: 'book', difficulty: 'medium', duration: 4 },
  { id: 'binary_search', name: 'Binary Search', description: 'Maximize speed with logarithmic search intervals.', topics: ['Binary Search'], icon: 'target', difficulty: 'medium', duration: 5 },
  { id: 'trees', name: 'Trees & DFS', description: 'Traverse branch hierarchies and perform recursive operations.', topics: ['Tree', 'Binary Tree'], icon: 'book', difficulty: 'medium', duration: 6 },
  { id: 'graphs', name: 'Graphs & BFS', description: 'Solve node connection matrices and path traversal models.', topics: ['Graph'], icon: 'zap', difficulty: 'hard', duration: 7 },
  { id: 'dp', name: 'Dynamic Programming', description: 'Master memoized structures and optimize recursion states.', topics: ['Dynamic Programming'], icon: 'trophy', difficulty: 'hard', duration: 7 }
];

const StudyPlansPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [myPlans, setMyPlans] = useState([]);
    const [allProblems, setAllProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingPlan, setCreatingPlan] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [selectedPlan, setSelectedPlan] = useState(null); // Node details modal

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const [allRes, myRes, probsRes] = await Promise.all([
                axiosClient.get('/study-plan/all'),
                axiosClient.get('/study-plan/my-plans'),
                axiosClient.get('/problem/getAllProblem')
            ]);
            setPlans(allRes.data);
            setMyPlans(myRes.data);
            setAllProblems(probsRes.data.problems || probsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => ICON_MAP[iconName] || Target;

    const displayPlans = activeTab === 'my' ? myPlans : plans;

    // Generate Skill tree nodes with lock/unlock status mapping to matching plans
    const getNodes = () => {
        let lastNodeCompletedOrProgress = true; // First node is always unlocked

        return SKILL_TREE_STEPS.map((step, idx) => {
            // Find a study plan in plans list matching topics or title
            const matchedPlan = plans.find(p => 
                p.topics?.some(t => step.topics.some(nt => t.toLowerCase() === nt.toLowerCase())) ||
                p.name.toLowerCase().includes(step.name.toLowerCase())
            );

            const isEnrolled = matchedPlan?.isEnrolled || false;
            const solvedCount = matchedPlan?.solvedCount || 0;
            const totalProblems = matchedPlan?.totalProblems || 0;
            const progress = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
            const isCompleted = isEnrolled && progress === 100;

            const isUnlocked = lastNodeCompletedOrProgress;

            // Lock next node if this one doesn't have active enrollment progress
            lastNodeCompletedOrProgress = isEnrolled && solvedCount > 0;

            return {
                ...step,
                matchedPlan,
                isEnrolled,
                solvedCount,
                totalProblems,
                progress,
                isCompleted,
                isUnlocked
            };
        });
    };

    const handleAutoForgePlan = async (node) => {
        setCreatingPlan(true);
        try {
            // Find up to 4 problems matching the node's topics
            const matchedProbs = allProblems
                .filter(p => p.tags?.some(tag => node.topics.some(nt => tag.toLowerCase() === nt.toLowerCase())))
                .slice(0, 4);

            if (matchedProbs.length === 0) {
                alert(`No seed problems found for topic: ${node.name}. Try creating some problems first under Admin.`);
                setCreatingPlan(false);
                return;
            }

            const payload = {
                name: `Skill Forge: ${node.name}`,
                description: `Unlock path curriculum for ${node.name}. Master core concepts step-by-step.`,
                difficulty: node.difficulty || 'easy',
                duration: 3,
                icon: node.icon || 'target',
                color: 'from-orange-500 to-red-500',
                topics: node.topics,
                isPublic: true,
                days: [
                    { dayNumber: 1, title: 'Introduction', problems: [matchedProbs[0]?._id, matchedProbs[1]?._id].filter(Boolean) },
                    { dayNumber: 2, title: 'Advancement', problems: [matchedProbs[2]?._id, matchedProbs[3]?._id].filter(Boolean) }
                ]
            };

            await axiosClient.post('/study-plan/create', payload);
            alert(`Success! Generated curriculum plan: ${payload.name}`);
            setSelectedPlan(null);
            fetchPlans();
        } catch (err) {
            console.error(err);
            alert("Failed to auto-generate study plan.");
        } finally {
            setCreatingPlan(false);
        }
    };

    const nodes = getNodes();

    return (
        <div className="min-h-screen bg-canvas text-text-primary pb-20">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                            <BookOpen className="text-ember-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-display text-text-primary">Study Plans</h1>
                            <p className="text-text-secondary text-sm">Structured learning paths to level up your skills</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/study-plans/create')}
                        className="btn-ember px-5 py-2.5 text-sm flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Plan
                    </button>
                </div>

                {/* AI Recommendation */}
                <AIRecommendation onPlanCreated={fetchPlans} />

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-surface rounded-control p-1 border border-border-subtle">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'all'
                                    ? 'bg-elevated text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            All Plans ({plans.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'my'
                                    ? 'bg-elevated text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            My Plans ({myPlans.length})
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex gap-1 bg-surface rounded-control p-1 border border-border-subtle">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                viewMode === 'map'
                                    ? 'bg-elevated text-ember-400 shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                            title="Interactive Skill Map"
                        >
                            <Map size={14} />
                            (Recommended) Skill Map
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                viewMode === 'list'
                                    ? 'bg-elevated text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                            title="Grid List"
                        >
                            <LayoutGrid size={14} />
                            Grid List
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-ember-400" />
                    </div>
                ) : displayPlans.length === 0 ? (
                    <div className="text-center py-20 card-af">
                        <BookOpen className="mx-auto text-text-muted mb-4" size={48} />
                        <p className="text-text-secondary text-lg">
                            {activeTab === 'my' ? "You haven't enrolled in any plans yet." : "No study plans available."}
                        </p>
                        {activeTab === 'my' && (
                            <button
                                onClick={() => setActiveTab('all')}
                                className="mt-4 text-ember-400 hover:text-ember-300 font-medium transition-colors"
                            >
                                Browse all plans →
                            </button>
                        )}
                    </div>
                ) : viewMode === 'map' ? (
                    /* ─── SYSTEMATIC SKILL FORGE MAP VIEW ─── */
                    <div className="relative py-12 flex flex-col items-center overflow-hidden">
                        {/* Glow path connector */}
                        <div className="absolute top-10 bottom-10 w-1 bg-border-subtle left-1/2 -translate-x-1/2 z-0" />

                        {/* Curved track background path (centered) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 1200" preserveAspectRatio="none">
                            <path
                                d="M 50 0 C 35 150, 65 300, 50 450 C 35 600, 65 750, 50 900 C 35 1050, 65 1200, 50 1350"
                                fill="none"
                                stroke="#E8722C"
                                strokeWidth="0.5"
                                strokeDasharray="3 3"
                                className="opacity-40"
                            />
                        </svg>

                        {/* Zigzag nodes list */}
                        <div className="space-y-20 w-full max-w-2xl relative z-10">
                            {nodes.map((node, idx) => {
                                const Icon = getIcon(node.icon);
                                const isEven = idx % 2 === 0;
                                const isCompleted = node.isCompleted;

                                return (
                                    <div 
                                        key={node.id}
                                        className={`flex items-center w-full ${isEven ? 'justify-start md:pl-24' : 'justify-end md:pr-24'}`}
                                    >
                                        <div className={`flex items-center gap-6 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                                            {/* Circular node */}
                                            <button
                                                onClick={() => setSelectedPlan(node)}
                                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform select-none relative ${
                                                    !node.isUnlocked
                                                        ? 'bg-inset border-2 border-border-subtle text-text-muted cursor-not-allowed opacity-50'
                                                        : isCompleted
                                                        ? 'bg-easy/10 border-2 border-easy text-easy shadow-[0_0_15px_rgba(63,182,140,0.25)] hover:scale-105 cursor-pointer'
                                                        : 'bg-surface border-2 border-ember-400 text-ember-400 shadow-[0_0_20px_rgba(232,114,44,0.25)] hover:scale-105 cursor-pointer animate-[pulse_3s_infinite]'
                                                }`}
                                            >
                                                {!node.isUnlocked ? (
                                                    <Lock size={26} className="text-text-muted" />
                                                ) : (
                                                    <Icon size={30} />
                                                )}

                                                {/* Node Index label */}
                                                <span className="absolute -bottom-2 bg-elevated border border-border-subtle rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono text-text-muted shadow-sm">
                                                    NODE {idx + 1}
                                                </span>
                                            </button>

                                            {/* Connector indicator tag */}
                                            <div 
                                                onClick={() => setSelectedPlan(node)}
                                                className={`card-af py-3 px-4 max-w-xs transition-all border ${
                                                    !node.isUnlocked 
                                                        ? 'opacity-40 border-border-subtle' 
                                                        : 'hover:border-ember-400/50 cursor-pointer shadow-md'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm font-display text-text-primary truncate">{node.name}</h3>
                                                    {node.matchedPlan ? (
                                                        <span className="text-[8px] bg-easy/10 text-easy border border-easy/20 px-1 rounded font-mono font-bold shrink-0">ACTIVE</span>
                                                    ) : (
                                                        <span className="text-[8px] bg-steel-500/10 text-steel-300 border border-steel-500/20 px-1 rounded font-mono font-bold shrink-0">UNFORGED</span>
                                                    )}
                                                </div>
                                                <p className="text-text-secondary text-xs line-clamp-1 mt-1 leading-relaxed">{node.description}</p>
                                                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-text-muted">
                                                    <span className="capitalize">📊 {node.difficulty}</span>
                                                    <span>•</span>
                                                    <span>{node.duration} days</span>
                                                    {node.isEnrolled && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-ember-400 font-bold">{node.progress}%</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* ─── GRID LIST VIEW ─── */
                    <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
                        {displayPlans.map((plan) => {
                            const Icon = getIcon(plan.icon);
                            const progress = plan.totalProblems > 0
                                ? Math.round(((plan.solvedCount || 0) / plan.totalProblems) * 100)
                                : 0;

                            return (
                                <div
                                    key={plan._id}
                                    onClick={() => navigate(`/study-plans/${plan._id}`)}
                                    className="card-af card-af-interactive cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                                >
                                    {plan.isEnrolled && (
                                        <div className="absolute top-4 right-4">
                                            {plan.enrollmentStatus === 'completed' ? (
                                                <span className="badge-easy text-[10px] px-2 py-0.5 flex items-center gap-1 font-mono font-bold">
                                                    <Trophy size={11} /> COMPLETED
                                                </span>
                                            ) : (
                                                <span className="badge-steel text-[10px] px-2 py-0.5 font-mono font-bold">
                                                    ENROLLED
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 rounded-xl bg-elevated border border-border-subtle text-text-primary group-hover:text-ember-400 transition-colors">
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1 pr-16">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-ember-300 transition-colors font-display">{plan.name}</h3>
                                                    {plan.isOfficial && (
                                                        <span className="text-[10px] bg-ember-400/10 text-ember-300 border border-ember-400/20 px-1.5 py-0.5 rounded font-mono font-bold">
                                                            OFFICIAL
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">{plan.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {plan.topics?.slice(0, 4).map((topic, idx) => (
                                                <span key={idx} className="tag-chip">
                                                    {topic === 'arary' ? 'Array' : topic}
                                                </span>
                                            ))}
                                            {plan.topics?.length > 4 && (
                                                <span className="text-xs text-text-muted self-center font-mono">+{plan.topics.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        {plan.isEnrolled && plan.totalProblems > 0 && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs text-text-muted mb-1.5 font-mono">
                                                    <span>{plan.solvedCount}/{plan.totalProblems} solved</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <TemperGauge progress={progress} />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                                            <div className="flex gap-4 font-mono text-xs text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} className="text-text-muted" /> {plan.duration} days
                                                </span>
                                                <span className="capitalize flex items-center gap-1">
                                                    📊 {plan.difficulty}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users size={13} className="text-text-muted" /> {plan.enrolledCount || 0}
                                                </span>
                                            </div>
                                            <div className="text-text-muted group-hover:text-ember-400 group-hover:translate-x-1 transition-all">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ─── SYSTEMATIC NODE DETAIL OVERLAY MODAL ─── */}
            {selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
                    <div className="card-af max-w-md w-full relative p-6 animate-scale-up">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedPlan(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-elevated border border-border-subtle rounded-xl text-ember-400">
                                {React.createElement(getIcon(selectedPlan.icon), { size: 24 })}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-display text-text-primary">{selectedPlan.name}</h2>
                                <p className="text-xs text-text-muted font-mono capitalize">Level difficulty: {selectedPlan.difficulty}</p>
                            </div>
                        </div>

                        <p className="text-text-secondary text-sm leading-relaxed mb-4">
                            {selectedPlan.description}
                        </p>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {selectedPlan.topics?.map((topic, idx) => (
                                <span key={idx} className="tag-chip text-xs">
                                    {topic}
                                </span>
                            ))}
                        </div>

                        {/* Lock / Enrolled stats / Auto-forge options */}
                        {!selectedPlan.isUnlocked ? (
                            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-hard/10 border border-hard/20 text-hard text-xs font-medium mb-6">
                                <Lock size={16} />
                                <span>This node is locked. Solve at least 1 problem in the previous node to unlock it!</span>
                            </div>
                        ) : selectedPlan.matchedPlan ? (
                            /* Step has plan associated */
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-text-muted mb-1.5 font-mono">
                                    <span>Progress ({selectedPlan.solvedCount}/{selectedPlan.totalProblems} solved)</span>
                                    <span>{selectedPlan.progress}%</span>
                                </div>
                                <TemperGauge progress={selectedPlan.progress} />
                            </div>
                        ) : (
                            /* Step has no plan -> Auto forge CTA */
                            <div className="flex flex-col gap-3 p-4 rounded-lg bg-steel-500/10 border border-steel-500/20 mb-6">
                                <div className="flex items-center gap-2.5 text-steel-300 text-xs font-medium">
                                    <Sparkles size={16} />
                                    <span>This skill node is un-forged. Create a plan for it!</span>
                                </div>
                                <p className="text-[11px] text-text-secondary leading-relaxed">
                                    Automatically gather challenges from the problem pool matching the <strong className="text-text-primary font-mono">{selectedPlan.topics.join(', ')}</strong> tags and configure a structured path.
                                </p>
                                <button
                                    onClick={() => handleAutoForgePlan(selectedPlan)}
                                    disabled={creatingPlan}
                                    className="btn-ember py-2 text-xs font-semibold flex items-center justify-center gap-1.5 mt-1"
                                >
                                    {creatingPlan ? (
                                        <><Loader2 size={12} className="animate-spin" /> Forging Node...</>
                                    ) : (
                                        <><Sparkles size={12} /> Auto Forge Path</>
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="btn-secondary-af px-4 py-2 text-xs"
                            >
                                Close
                            </button>
                            {selectedPlan.matchedPlan && (
                                <button
                                    disabled={!selectedPlan.isUnlocked}
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        navigate(`/study-plans/${selectedPlan.matchedPlan._id}`);
                                    }}
                                    className="btn-ember px-5 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Enter Path
                                    <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlansPage;
