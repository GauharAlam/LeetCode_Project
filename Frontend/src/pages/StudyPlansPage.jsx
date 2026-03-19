import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AIRecommendation from '../components/AIRecommendation';
import axiosClient from '../utils/axiosClient';
import { BookOpen, ArrowRight, Loader2, Target, Flame, Trophy, Zap, Users, Clock, Plus } from 'lucide-react';

const ICON_MAP = {
    target: Target,
    flame: Flame,
    trophy: Trophy,
    zap: Zap,
    book: BookOpen
};

const StudyPlansPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [myPlans, setMyPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

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
            setPlans(allRes.data);
            setMyPlans(myRes.data);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => ICON_MAP[iconName] || Target;

    const displayPlans = activeTab === 'my' ? myPlans : plans;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-xl">
                            <BookOpen className="text-gray-600 dark:text-gray-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Plans</h1>
                            <p className="text-gray-500">Structured learning paths to level up your skills</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/study-plans/create')}
                        className="btn bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none gap-2 hover:bg-black dark:hover:bg-gray-100"
                    >
                        <Plus size={18} />
                        Create Plan
                    </button>
                </div>

                {/* AI Recommendation */}
                <AIRecommendation onPlanCreated={fetchPlans} />

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-neutral-900 rounded-lg p-1 mb-6 w-fit border border-gray-200 dark:border-neutral-800">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'all'
                                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
                        }`}
                    >
                        All Plans ({plans.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'my'
                                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'
                        }`}
                    >
                        My Plans ({myPlans.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : displayPlans.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">
                            {activeTab === 'my' ? "You haven't enrolled in any plans yet." : "No study plans available."}
                        </p>
                        {activeTab === 'my' && (
                            <button
                                onClick={() => setActiveTab('all')}
                                className="mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline"
                            >
                                Browse all plans →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {displayPlans.map((plan) => {
                            const Icon = getIcon(plan.icon);
                            const progress = plan.totalProblems > 0
                                ? Math.round(((plan.solvedCount || 0) / plan.totalProblems) * 100)
                                : 0;

                            return (
                                <div
                                    key={plan._id}
                                    onClick={() => navigate(`/study-plans/${plan._id}`)}
                                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-gray-400 dark:hover:border-neutral-600 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    {/* Enrolled badge */}
                                    {plan.isEnrolled && (
                                        <div className="absolute top-4 right-4">
                                            {plan.enrollmentStatus === 'completed' ? (
                                                <span className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center gap-1">
                                                    <Trophy size={12} /> Completed
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full border border-gray-200 dark:border-neutral-700">
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-gray-100 dark:bg-neutral-800">
                                            <Icon className="text-gray-600 dark:text-gray-400" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                                                {plan.isOfficial && (
                                                    <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                                        Official
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm">{plan.description}</p>
                                        </div>
                                    </div>

                                    {/* Topics */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {plan.topics?.slice(0, 4).map((topic, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded border border-gray-200 dark:border-neutral-700">
                                                {topic}
                                            </span>
                                        ))}
                                        {plan.topics?.length > 4 && (
                                            <span className="text-xs text-gray-400">+{plan.topics.length - 4} more</span>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    {plan.isEnrolled && plan.totalProblems > 0 && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>{plan.solvedCount}/{plan.totalProblems} problems</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock size={13} /> {plan.duration} days
                                            </span>
                                            <span className="text-sm text-gray-500 capitalize flex items-center gap-1">
                                                📊 {plan.difficulty}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Users size={13} /> {plan.enrolledCount || 0}
                                            </span>
                                        </div>
                                        <div className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all">
                                            <ArrowRight size={20} />
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
