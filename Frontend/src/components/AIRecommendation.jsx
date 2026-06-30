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
            <div className="card-af border-l-4 border-l-steel-500 mb-8 relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-steel-500/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
                <div className="relative flex items-center justify-between flex-wrap gap-4 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-elevated border border-border-subtle rounded-xl text-steel-500">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 font-display">
                                AI-Powered Plan
                                <span className="text-[10px] bg-steel-500/10 text-steel-300 border border-steel-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                                    GEMINI AI
                                </span>
                            </h3>
                            <p className="text-text-secondary text-sm mt-1">
                                Get a personalized study plan based on your strengths and weaknesses
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchRecommendation}
                        className="btn-secondary-af px-6 py-2.5 text-sm flex items-center gap-2 font-semibold hover:border-steel-500/30 hover:text-steel-300"
                    >
                        <Brain size={18} />
                        Generate My Plan
                    </button>
                </div>
                {error && (
                    <p className="text-hard text-sm mt-3 font-mono">{error}</p>
                )}
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="card-af mb-8 text-center border-l-4 border-l-steel-500">
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-inset border border-border-subtle flex items-center justify-center">
                            <Brain className="text-steel-500 animate-pulse" size={28} />
                        </div>
                        <div className="absolute -inset-1.5 rounded-2xl border-2 border-transparent border-t-steel-500 animate-spin" />
                    </div>
                    <div>
                        <p className="text-text-primary font-semibold text-lg font-display">Analyzing your profile...</p>
                        <p className="text-text-secondary text-sm mt-1">Our AI is studying your strengths and finding your gaps</p>
                    </div>
                </div>
            </div>
        );
    }

    // Result state
    const { recommendation, analysis, aiGenerated } = result;

    return (
        <div className="card-af p-0 overflow-hidden mb-8 border-l-4 border-l-steel-500">
            {/* Header */}
            <div className="bg-elevated/50 p-5 flex items-center justify-between border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-steel-500" size={22} />
                    <h3 className="text-lg font-bold text-text-primary font-display">
                        {aiGenerated ? 'AI' : 'Smart'} Recommendation
                    </h3>
                    {aiGenerated && (
                        <span className="text-[10px] bg-steel-500/10 text-steel-300 border border-steel-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                            ✨ GEMINI AI
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setResult(null)}
                    className="text-text-muted hover:text-text-primary transition-colors p-1"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-5 space-y-5">
                {/* Analysis Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-inset rounded-control p-3 text-center border border-border-subtle">
                        <p className="text-2xl font-bold text-text-primary font-mono">{analysis.totalSolved}</p>
                        <p className="text-xs text-text-muted">Problems Solved</p>
                    </div>
                    <div className="bg-inset rounded-control p-3 text-center border border-border-subtle">
                        <p className="text-2xl font-bold text-easy font-mono">{analysis.solvedDifficulty.easy}</p>
                        <p className="text-xs text-text-muted">Easy</p>
                    </div>
                    <div className="bg-inset rounded-control p-3 text-center border border-border-subtle">
                        <p className="text-2xl font-bold text-medium font-mono">{analysis.solvedDifficulty.medium}</p>
                        <p className="text-xs text-text-muted">Medium</p>
                    </div>
                    <div className="bg-inset rounded-control p-3 text-center border border-border-subtle">
                        <p className="text-2xl font-bold text-hard font-mono">{analysis.solvedDifficulty.hard}</p>
                        <p className="text-xs text-text-muted">Hard</p>
                    </div>
                </div>

                {/* Weak Areas */}
                {analysis.weakTags?.length > 0 && (
                    <div className="bg-inset rounded-control p-4 border border-border-subtle">
                        <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Target size={14} className="text-steel-500" />
                            Areas to Improve
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.weakTags.map((t, i) => (
                                <span key={i} className="tag-chip font-mono bg-elevated">
                                    {t.tag} <span className="text-text-muted">({t.rate}%)</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Plan */}
                <div className="bg-inset rounded-control p-4 border border-border-subtle">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-steel-500/10 rounded-lg text-steel-500 shrink-0 mt-1">
                            <Zap size={18} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-text-primary font-display">{recommendation.planName}</h4>
                            <p className="text-text-secondary text-sm mt-1 leading-relaxed">{recommendation.description}</p>
                        </div>
                    </div>

                    {/* Plan meta */}
                    <div className="flex flex-wrap gap-3 mb-4 text-xs font-mono text-text-muted">
                        <span className="bg-elevated px-2 py-1 rounded">
                            📅 {recommendation.duration} days
                        </span>
                        <span className="bg-elevated px-2 py-1 rounded capitalize">
                            📊 {recommendation.difficulty}
                        </span>
                        <span className="bg-elevated px-2 py-1 rounded">
                            📝 {recommendation.suggestedProblems?.length || 0} problems
                        </span>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {recommendation.topics?.map((t, i) => (
                            <span key={i} className="tag-chip">
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* AI Advice */}
                    {recommendation.advice && (
                        <div className="bg-surface rounded-lg p-3.5 mb-4 border-l-2 border-steel-500">
                            <p className="text-sm text-text-secondary italic">💡 {recommendation.advice}</p>
                        </div>
                    )}

                    {/* Day-wise breakdown */}
                    {recommendation.days?.length > 0 && (
                        <div className="mb-4">
                            <button
                                onClick={() => setShowDays(!showDays)}
                                className="text-sm text-steel-300 hover:text-steel-200 transition-colors flex items-center gap-1 mb-2 font-medium"
                            >
                                {showDays ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {showDays ? 'Hide' : 'Show'} Day-by-Day Schedule ({recommendation.days.length} days)
                            </button>

                            {showDays && (
                                <div className="space-y-2 mt-3">
                                    {recommendation.days.map((day, i) => (
                                        <div key={i} className="bg-surface rounded-lg p-3 border border-border-subtle">
                                            <p className="text-sm font-semibold text-text-primary mb-2 font-mono">
                                                <span className="text-ember-400">Day {day.dayNumber}</span>
                                                {day.title && <span className="text-text-secondary font-normal"> — {day.title}</span>}
                                            </p>
                                            <div className="space-y-1.5">
                                                {day.problems?.map((p, j) => (
                                                    <div key={j} className="flex items-center justify-between text-sm px-3 py-1.5 rounded bg-inset border border-border-subtle/30">
                                                        <span className="text-text-secondary font-medium">{p.title}</span>
                                                        <span className={`text-xs font-mono font-bold ${
                                                            p.difficulty === 'easy' ? 'text-easy' :
                                                            p.difficulty === 'medium' ? 'text-medium' : 'text-hard'
                                                        }`}>{p.difficulty?.toUpperCase()}</span>
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
                            className="btn-ember py-2.5 px-6 flex-1 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                        >
                            {creating ? (
                                <><Loader2 className="animate-spin" size={16} /> Creating...</>
                            ) : (
                                <><Check size={16} /> Accept & Start Plan</>
                            )}
                        </button>
                        <button
                            onClick={fetchRecommendation}
                            className="btn-secondary-af py-2.5 px-4 flex items-center justify-center gap-2 text-sm"
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
