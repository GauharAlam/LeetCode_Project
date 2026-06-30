import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TemperGauge from '../components/TemperGauge';
import axiosClient from '../utils/axiosClient';
import { useSelector } from 'react-redux';
import {
    CheckCircle2,
    Clock,
    Code2,
    TrendingUp,
    Calendar,
    Flame,
    Trophy
} from 'lucide-react';
import DailyChallenge from '../components/DailyChallenge';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await axiosClient.get('/problem/dashboard');
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to fetch dashboard", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Calculate progress percentage
    const getProgress = () => {
        if (!dashboardData) return 0;
        const { solved, total } = dashboardData.stats;
        return total.count > 0 ? Math.round((solved.total / total.count) * 100) : 0;
    };

    // Generate heatmap data for the year
    const generateHeatmapData = () => {
        if (!dashboardData) return [];

        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const activityMap = {};
        dashboardData.submissionActivity?.forEach(item => {
            activityMap[item._id] = item.count;
        });

        return months.map((month, monthIndex) => {
            const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
            const days = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                days.push({
                    date: dateStr,
                    count: activityMap[dateStr] || 0
                });
            }

            return { month, days };
        });
    };

    // Temper Gauge heatmap colors
    const getHeatmapColor = (count) => {
        if (count === 0) return 'bg-elevated';
        if (count === 1) return 'bg-[#2A1810]';
        if (count <= 3) return 'bg-[#6B3A1C]';
        if (count <= 5) return 'bg-ember-400';
        return 'bg-[#FFD9A0]';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted': return 'text-easy bg-easy/10 border border-easy/20';
            case 'wrong': return 'text-hard bg-hard/10 border border-hard/20';
            case 'error': return 'text-medium bg-medium/10 border border-medium/20';
            default: return 'text-text-muted bg-elevated border border-border-subtle';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-canvas">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <span className="loading loading-spinner loading-lg text-ember-400"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-canvas">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-text-muted">{error}</p>
                </div>
            </div>
        );
    }

    const { stats, recentSubmissions, languageStats } = dashboardData;
    const heatmapData = generateHeatmapData();

    return (
        <div className="min-h-screen bg-canvas">
            <Navbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary font-display">Dashboard</h1>
                        <p className="text-text-secondary mt-1">Track your forging progress</p>
                    </div>
                    <div className="flex items-center gap-2 card-af py-2 px-4">
                        <Trophy className="w-5 h-5 text-ember-400" />
                        <span className="text-text-primary font-semibold font-mono">{stats.solved.total}</span>
                        <span className="text-text-secondary text-sm">problems solved</span>
                    </div>
                </div>

                {/* Daily Challenge Widget */}
                <DailyChallenge />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Problem Solving Overview - Temper Gauge Ring */}
                    <div className="card-af">
                        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2 font-display">
                            <TrendingUp className="w-5 h-5 text-ember-400" />
                            Problem Solving Overview
                        </h2>

                        <div className="flex items-center justify-center mb-6">
                            <TemperGauge variant="ring" progress={getProgress()} size={160} strokeWidth={12}>
                                <span className="text-3xl font-bold text-text-primary font-mono">{stats.solved.total}</span>
                                <span className="text-sm text-text-muted font-mono">/ {stats.total.count}</span>
                                <span className="text-xs text-text-muted mt-0.5">Solved</span>
                            </TemperGauge>
                        </div>

                        {/* Difficulty Breakdown — Temper Gauge bars */}
                        <div className="space-y-4">
                            {[
                                { key: 'easy', color: 'text-easy', dot: 'bg-easy' },
                                { key: 'medium', color: 'text-medium', dot: 'bg-medium' },
                                { key: 'hard', color: 'text-hard', dot: 'bg-hard' }
                            ].map(({ key, color, dot }) => (
                                <div key={key} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className={`capitalize flex items-center gap-2 ${color}`}>
                                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                                            {key}
                                        </span>
                                        <span className="text-text-secondary font-mono">
                                            {stats.solved[key]} / {stats.total[key]}
                                        </span>
                                    </div>
                                    <TemperGauge
                                        progress={stats.total[key] > 0 ? (stats.solved[key] / stats.total[key]) * 100 : 0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Languages Used */}
                    <div className="card-af">
                        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2 font-display">
                            <Code2 className="w-5 h-5 text-steel-500" />
                            Languages
                        </h2>

                        {languageStats && languageStats.length > 0 ? (
                            <div className="space-y-3">
                                {languageStats.map((lang) => (
                                    <div key={lang._id} className="flex items-center justify-between p-3 bg-inset rounded-control border border-border-subtle">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-steel-500/10 flex items-center justify-center">
                                                <Code2 className="w-5 h-5 text-steel-500" />
                                            </div>
                                            <span className="font-medium text-text-primary capitalize">{lang._id}</span>
                                        </div>
                                        <span className="text-text-secondary font-mono text-sm">{lang.count} runs</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                                <Code2 className="w-12 h-12 mb-2 opacity-30" />
                                <p>No submissions yet</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="card-af">
                        <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2 font-display">
                            <Flame className="w-5 h-5 text-ember-400" />
                            Quick Stats
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-inset rounded-control p-4 border border-border-subtle">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-easy" />
                                    <div className="text-2xl font-bold text-text-primary font-mono">{stats.solved.easy}</div>
                                </div>
                                <div className="text-sm text-text-muted">Easy Solved</div>
                            </div>
                            <div className="bg-inset rounded-control p-4 border border-border-subtle">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-medium" />
                                    <div className="text-2xl font-bold text-text-primary font-mono">{stats.solved.medium}</div>
                                </div>
                                <div className="text-sm text-text-muted">Medium Solved</div>
                            </div>
                            <div className="bg-inset rounded-control p-4 border border-border-subtle">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-hard" />
                                    <div className="text-2xl font-bold text-text-primary font-mono">{stats.solved.hard}</div>
                                </div>
                                <div className="text-sm text-text-muted">Hard Solved</div>
                            </div>
                            <div className="bg-inset rounded-control p-4 border border-border-subtle">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-ember-400" />
                                    <div className="text-2xl font-bold text-text-primary font-mono">{getProgress()}%</div>
                                </div>
                                <div className="text-sm text-text-muted">Completion</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submissions Heatmap — Temper Gauge gradient */}
                <div className="card-af mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 font-display">
                            <Calendar className="w-5 h-5 text-ember-400" />
                            {new Date().getFullYear()} Submissions
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-elevated"></div>
                                <div className="w-3 h-3 rounded-sm bg-[#2A1810]"></div>
                                <div className="w-3 h-3 rounded-sm bg-[#6B3A1C]"></div>
                                <div className="w-3 h-3 rounded-sm bg-ember-400"></div>
                                <div className="w-3 h-3 rounded-sm bg-[#FFD9A0]"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="flex gap-4 min-w-max">
                            {heatmapData.map((monthData, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {monthData.days.map((day, dayIdx) => (
                                            <div
                                                key={dayIdx}
                                                className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)} hover:ring-1 hover:ring-ember-400/50 transition-all cursor-pointer`}
                                                title={`${day.date}: ${day.count} submissions`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-text-muted font-mono">{monthData.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="card-af">
                    <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2 font-display">
                        <Clock className="w-5 h-5 text-steel-500" />
                        Recent Submissions
                    </h2>

                    {recentSubmissions && recentSubmissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-af">
                                <thead>
                                    <tr>
                                        <th>Problem</th>
                                        <th>Status</th>
                                        <th>Language</th>
                                        <th>Runtime</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSubmissions.map((sub) => (
                                        <tr key={sub._id}>
                                            <td>
                                                <button
                                                    onClick={() => navigate(`/problem/${sub.problem?._id}`)}
                                                    className="text-text-primary hover:text-ember-300 transition-colors"
                                                >
                                                    {sub.problem?.title || 'Unknown Problem'}
                                                </button>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium font-mono ${getStatusBadge(sub.status)}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="text-text-secondary capitalize font-mono text-sm">{sub.language}</td>
                                            <td className="text-text-secondary font-mono text-sm">{sub.runtime} ms</td>
                                            <td className="text-text-muted text-sm font-mono">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                            <CheckCircle2 className="w-12 h-12 mb-2 opacity-30" />
                            <p>No submissions yet</p>
                            <button
                                onClick={() => navigate('/problems')}
                                className="mt-4 text-ember-400 hover:text-ember-300 transition-colors text-sm"
                            >
                                Start solving problems →
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
