import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import {
    Sparkles, Loader2, Brain, Target, ChevronDown, ChevronUp,
    Zap, Check, X
} from 'lucide-react';

const AIRecommendation = ({ onPlanCreated }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [creating, setCreating] = useState(false);
    const [showDays, setShowDays] = useState(false);
    const [error, setError] = useState('');

    const fetchRecommendation = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await axiosClient.get('/problem/ai-recommend');
            setResult(data);
        } catch (err) {
            console.error('AI recommendation error:', err);
            setError(err.response?.data?.message || 'Failed to generate recommendation');
        } finally {
            setLoading(false);
        }
    };

    const createPlan = async () => {
        if (!result?.recommendation) return;
        try {
            setCreating(true);
            await axiosClient.post('/problem/ai-recommend/create', result.recommendation);
            onPlanCreated?.();
            setResult(null);
        } catch (err) {
            console.error('Create plan error:', err);
            setError('Failed to create plan');
        } finally {
            setCreating(false);
        }
    };

    // Initial CTA state
    if (!result && !loading) {
        return (
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-200 dark:bg-neutral-800 rounded-xl">
                            <Sparkles className="text-gray-600 dark:text-gray-400" size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                AI-Powered Plan
                                <span className="text-[10px] bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-normal uppercase tracking-wider">
                                    Powered by Gemini
                                </span>
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                Get a personalized study plan based on your strengths and weaknesses
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchRecommendation}
                        className="btn bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none gap-2 px-6 hover:bg-black dark:hover:bg-gray-100"
                    >
                        <Brain size={18} />
                        Generate My Plan
                    </button>
                </div>
                {error && (
                    <p className="text-gray-500 text-sm mt-3">{error}</p>
                )}
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-8 mb-8 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-neutral-700 flex items-center justify-center">
                            <Brain className="text-gray-500 dark:text-gray-400 animate-pulse" size={28} />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-500 dark:border-t-gray-400 animate-spin" />
                    </div>
                    <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">Analyzing your profile...</p>
                        <p className="text-gray-500 text-sm mt-1">Our AI is studying your strengths and finding your gaps</p>
                    </div>
                </div>
            </div>
        );
    }

    // Result state
    const { recommendation, analysis, aiGenerated } = result;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl mb-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-neutral-800/50 p-5 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-gray-500 dark:text-gray-400" size={22} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {aiGenerated ? 'AI' : 'Smart'} Recommendation
                    </h3>
                    {aiGenerated && (
                        <span className="text-[10px] bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-300 dark:border-neutral-600">
                            ✨ Gemini AI
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setResult(null)}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-5 space-y-5">
                {/* Analysis Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 text-center border border-gray-200 dark:border-neutral-700">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.totalSolved}</p>
                        <p className="text-xs text-gray-500">Problems Solved</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 text-center border border-gray-200 dark:border-neutral-700">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.solvedDifficulty.easy}</p>
                        <p className="text-xs text-gray-500">Easy</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 text-center border border-gray-200 dark:border-neutral-700">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.solvedDifficulty.medium}</p>
                        <p className="text-xs text-gray-500">Medium</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 text-center border border-gray-200 dark:border-neutral-700">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.solvedDifficulty.hard}</p>
                        <p className="text-xs text-gray-500">Hard</p>
                    </div>
                </div>

                {/* Weak Areas */}
                {analysis.weakTags?.length > 0 && (
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-neutral-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Target size={14} className="text-gray-500" />
                            Areas to Improve
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.weakTags.map((t, i) => (
                                <span key={i} className="text-xs bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-neutral-600">
                                    {t.tag} <span className="text-gray-400 dark:text-gray-500">({t.rate}%)</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Plan */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-neutral-700">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-gray-200 dark:bg-neutral-700 rounded-lg shrink-0 mt-1">
                            <Zap className="text-gray-600 dark:text-gray-400" size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{recommendation.planName}</h4>
                            <p className="text-gray-500 text-sm">{recommendation.description}</p>
                        </div>
                    </div>

                    {/* Plan meta */}
                    <div className="flex flex-wrap gap-3 mb-3">
                        <span className="text-xs bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            📅 {recommendation.duration} days
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            📊 {recommendation.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                            📝 {recommendation.suggestedProblems?.length || 0} problems
                        </span>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {recommendation.topics?.map((t, i) => (
                            <span key={i} className="text-xs bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-300 dark:border-neutral-600">
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* AI Advice */}
                    {recommendation.advice && (
                        <div className="bg-white dark:bg-neutral-900 rounded-lg p-3 mb-3 border-l-2 border-gray-400 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">💡 {recommendation.advice}</p>
                        </div>
                    )}

                    {/* Day-wise breakdown */}
                    {recommendation.days?.length > 0 && (
                        <div className="mb-3">
                            <button
                                onClick={() => setShowDays(!showDays)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 mb-2"
                            >
                                {showDays ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {showDays ? 'Hide' : 'Show'} Day-by-Day Schedule ({recommendation.days.length} days)
                            </button>

                            {showDays && (
                                <div className="space-y-2">
                                    {recommendation.days.map((day, i) => (
                                        <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg p-3 border border-gray-200 dark:border-neutral-700">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                                                <span className="text-gray-600 dark:text-gray-400">Day {day.dayNumber}</span>
                                                {day.title && <span className="text-gray-500 font-normal"> — {day.title}</span>}
                                            </p>
                                            <div className="space-y-1">
                                                {day.problems?.map((p, j) => (
                                                    <div key={j} className="flex items-center justify-between text-sm px-2 py-1 rounded bg-gray-50 dark:bg-neutral-800">
                                                        <span className="text-gray-700 dark:text-gray-300">{p.title}</span>
                                                        <span className="text-xs text-gray-500 capitalize">{p.difficulty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={createPlan}
                            disabled={creating}
                            className="btn bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none gap-2 flex-1 hover:bg-black dark:hover:bg-gray-100"
                        >
                            {creating ? (
                                <><Loader2 className="animate-spin" size={16} /> Creating...</>
                            ) : (
                                <><Check size={16} /> Accept & Start Plan</>
                            )}
                        </button>
                        <button
                            onClick={fetchRecommendation}
                            className="btn bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 gap-2 hover:bg-gray-200 dark:hover:bg-neutral-700"
                        >
                            <Brain size={16} /> Regenerate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIRecommendation;
