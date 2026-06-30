import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import {
    BookOpen, ArrowLeft, Plus, Trash2, Search, ChevronDown, ChevronUp,
    Loader2, X, Check
} from 'lucide-react';

const COLOR_OPTIONS = [
    { value: 'from-green-500 to-emerald-500', label: 'Green' },
    { value: 'from-orange-500 to-red-500', label: 'Orange' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple' },
    { value: 'from-blue-500 to-cyan-500', label: 'Blue' },
    { value: 'from-yellow-500 to-amber-500', label: 'Yellow' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink' },
];

const ICON_OPTIONS = ['target', 'flame', 'trophy', 'zap', 'book'];

const CreateStudyPlan = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [allProblems, setAllProblems] = useState([]);
    const [loadingProblems, setLoadingProblems] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProblemPicker, setShowProblemPicker] = useState(null); // dayIndex or null
    const [difficultyFilter, setDifficultyFilter] = useState('all');

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        difficulty: 'easy',
        duration: 7,
        icon: 'target',
        color: 'from-blue-500 to-cyan-500',
        topics: '',
        isPublic: true,
        days: [{ dayNumber: 1, title: '', problems: [] }]
    });

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const { data } = await axiosClient.get('/problem/getAllProblem');
            setAllProblems(data.problems || data || []);
        } catch (err) {
            console.error("Failed to fetch problems:", err);
            setAllProblems([]);
        } finally {
            setLoadingProblems(false);
        }
    };

    const addDay = () => {
        setForm(prev => ({
            ...prev,
            days: [...prev.days, { dayNumber: prev.days.length + 1, title: '', problems: [] }]
        }));
    };

    const removeDay = (dayIndex) => {
        if (form.days.length <= 1) return;
        setForm(prev => ({
            ...prev,
            days: prev.days.filter((_, i) => i !== dayIndex).map((d, i) => ({ ...d, dayNumber: i + 1 }))
        }));
    };

    const updateDayTitle = (dayIndex, title) => {
        setForm(prev => ({
            ...prev,
            days: prev.days.map((d, i) => i === dayIndex ? { ...d, title } : d)
        }));
    };

    const addProblemToDay = (dayIndex, problem) => {
        const alreadyAdded = form.days[dayIndex].problems.some(p => p._id === problem._id);
        if (alreadyAdded) return;

        setForm(prev => ({
            ...prev,
            days: prev.days.map((d, i) =>
                i === dayIndex ? { ...d, problems: [...d.problems, problem] } : d
            )
        }));
    };

    const removeProblemFromDay = (dayIndex, problemId) => {
        setForm(prev => ({
            ...prev,
            days: prev.days.map((d, i) =>
                i === dayIndex ? { ...d, problems: d.problems.filter(p => p._id !== problemId) } : d
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.description.trim()) {
            alert("Please fill in name and description.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                difficulty: form.difficulty,
                duration: Number(form.duration),
                icon: form.icon,
                color: form.color,
                topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
                isPublic: form.isPublic,
                days: form.days.map(d => ({
                    dayNumber: d.dayNumber,
                    title: d.title,
                    problems: d.problems.map(p => p._id)
                }))
            };

            await axiosClient.post('/study-plan/create', payload);
            navigate('/study-plans');
        } catch (err) {
            console.error("Create plan error:", err);
            alert(err.response?.data?.message || "Failed to create study plan");
        } finally {
            setSaving(false);
        }
    };

    // Filter problems for picker
    const filteredProblems = allProblems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    const getDifficultyBadge = (diff) => {
        const classes = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
        return classes[diff] || '';
    };

    // All problems already added (across all days)
    const allAddedProblemIds = form.days.flatMap(d => d.problems.map(p => p._id));

    const totalProblems = form.days.reduce((sum, d) => sum + d.problems.length, 0);

    return (
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/study-plans')}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 font-medium text-sm"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Study Plans</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-4">
                    <div className="p-3 bg-surface border border-border-subtle rounded-xl text-ember-400">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-text-primary">Create Study Plan</h1>
                        <p className="text-text-secondary text-sm">Build a structured learning path</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="card-af">
                        <h2 className="text-lg font-bold text-text-primary mb-4 font-display">Basic Information</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="micro-label block mb-1.5">Plan Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. 30 Days of Code"
                                    className="input-af text-sm"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="micro-label block mb-1.5">Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="What will learners achieve with this plan?"
                                    rows={2}
                                    className="input-af text-sm h-20 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="micro-label block mb-1.5">Difficulty</label>
                                <select
                                    value={form.difficulty}
                                    onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
                                    className="input-af text-sm cursor-pointer bg-surface"
                                >
                                    <option value="easy" className="bg-surface">Easy</option>
                                    <option value="medium" className="bg-surface">Medium</option>
                                    <option value="hard" className="bg-surface">Hard</option>
                                    <option value="mixed" className="bg-surface">Mixed</option>
                                </select>
                            </div>

                            <div>
                                <label className="micro-label block mb-1.5">Duration (days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={form.duration}
                                    onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                                    className="input-af text-sm"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="micro-label block mb-1.5">Topics (comma separated)</label>
                                <input
                                    type="text"
                                    value={form.topics}
                                    onChange={e => setForm(prev => ({ ...prev, topics: e.target.value }))}
                                    placeholder="e.g. Arrays, Strings, Dynamic Programming"
                                    className="input-af text-sm"
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="micro-label block mb-2">Theme Color</label>
                                <div className="flex gap-2">
                                    {COLOR_OPTIONS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, color: c.value }))}
                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.value} ${
                                                form.color === c.value ? 'ring-2 ring-ember-400 ring-offset-2 ring-offset-canvas' : ''
                                            } transition-all`}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Visibility */}
                            <div className="flex items-end">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublic}
                                        onChange={e => setForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                                        className="w-4 h-4 rounded text-ember-400 focus:ring-ember-400 border-border-subtle bg-canvas"
                                    />
                                    <span className="text-sm text-text-secondary font-medium">Make this plan public</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Day Schedule Section */}
                    <div className="card-af">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary font-display">Schedule</h2>
                                <p className="text-xs text-text-muted font-mono">{totalProblems} problems across {form.days.length} days</p>
                            </div>
                            <button
                                type="button"
                                onClick={addDay}
                                className="btn-secondary-af px-3 py-1.5 text-xs flex items-center gap-1.5"
                            >
                                <Plus size={16} /> Add Day
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.days.map((day, dayIndex) => (
                                <div key={dayIndex} className="bg-inset rounded-xl border border-border-subtle p-4">
                                    {/* Day Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-sm font-bold font-mono text-text-muted shrink-0">
                                            Day {day.dayNumber}
                                        </span>
                                        <input
                                            type="text"
                                            value={day.title}
                                            onChange={e => updateDayTitle(dayIndex, e.target.value)}
                                            placeholder="Day title (optional)"
                                            className="flex-1 bg-transparent border-b border-border-subtle/50 px-2 py-1 text-text-primary focus:border-ember-400 focus:outline-none text-sm transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowProblemPicker(showProblemPicker === dayIndex ? null : dayIndex)}
                                            className="btn-secondary-af px-2.5 py-1 text-xs flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add Problem
                                        </button>
                                        {form.days.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDay(dayIndex)}
                                                className="btn-ghost-af text-hard p-2.5 hover:bg-hard/10 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Problems in this day */}
                                    {day.problems.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {day.problems.map((problem, pIdx) => (
                                                <div key={problem._id} className="flex items-center justify-between px-3 py-2 bg-surface rounded-lg border border-border-subtle/30">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-text-muted font-mono">{pIdx + 1}.</span>
                                                        <span className="text-sm text-text-primary font-medium">{problem.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={getDifficultyBadge(problem.difficulty)}>
                                                            {problem.difficulty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProblemFromDay(dayIndex, problem._id)}
                                                            className="text-text-muted hover:text-text-secondary transition-colors p-1"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-muted italic px-3 font-medium">No problems added yet</p>
                                    )}

                                    {/* Problem Picker (inline) */}
                                    {showProblemPicker === dayIndex && (
                                        <div className="mt-3 border-t border-border-subtle/50 pt-3">
                                            <div className="flex gap-2 mb-3">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={e => setSearchQuery(e.target.value)}
                                                        placeholder="Search problems..."
                                                        className="input-af pl-9 pr-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <select
                                                    value={difficultyFilter}
                                                    onChange={e => setDifficultyFilter(e.target.value)}
                                                    className="bg-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none"
                                                >
                                                    <option value="all" className="bg-surface">All</option>
                                                    <option value="easy" className="bg-surface">Easy</option>
                                                    <option value="medium" className="bg-surface">Medium</option>
                                                    <option value="hard" className="bg-surface">Hard</option>
                                                </select>
                                            </div>

                                            <div className="max-h-48 overflow-y-auto space-y-1 bg-surface border border-border-subtle/70 rounded-lg p-2.5">
                                                {loadingProblems ? (
                                                    <div className="text-center py-4">
                                                        <Loader2 className="animate-spin mx-auto text-ember-400" size={20} />
                                                    </div>
                                                ) : filteredProblems.length === 0 ? (
                                                    <p className="text-sm text-text-muted text-center py-4 italic font-medium">No problems found</p>
                                                ) : (
                                                    filteredProblems.map(problem => {
                                                        const isAdded = allAddedProblemIds.includes(problem._id);
                                                        return (
                                                            <button
                                                                key={problem._id}
                                                                type="button"
                                                                onClick={() => !isAdded && addProblemToDay(dayIndex, problem)}
                                                                disabled={isAdded}
                                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                                                    isAdded
                                                                        ? 'bg-elevated/40 text-text-muted cursor-default'
                                                                        : 'hover:bg-elevated text-text-primary cursor-pointer border border-transparent hover:border-border-subtle/30'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {isAdded ? (
                                                                        <Check size={14} className="text-easy" />
                                                                    ) : (
                                                                        <Plus size={14} className="text-text-muted" />
                                                                    )}
                                                                    <span className="text-sm font-medium">{problem.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {problem.tags?.slice(0, 2).map((tag, tIdx) => (
                                                                        <span key={tIdx} className="tag-chip font-mono py-0.5">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                    <span className={getDifficultyBadge(problem.difficulty)}>
                                                                        {problem.difficulty}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/study-plans')}
                            className="btn-secondary-af px-5 py-2.5 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-ember px-8 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <><Loader2 className="animate-spin" size={18} /> Creating...</>
                            ) : (
                                <><BookOpen size={18} /> Create Study Plan</>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreateStudyPlan;
