import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return 'text-green-400';
            case 'medium': return 'text-yellow-400';
            case 'hard': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getDifficultyBgColor = (diff) => {
        switch (diff) {
            case 'easy': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'hard': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'text-green-400 bg-green-400/10';
            case 'wrong': return 'text-red-400 bg-red-400/10';
            case 'error': return 'text-orange-400 bg-orange-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

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

        // Create a map of date -> count from submissionActivity
        const activityMap = {};
        dashboardData.submissionActivity?.forEach(item => {
            activityMap[item._id] = item.count;
        });

        // Generate grid data for each month
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

    const getHeatmapColor = (count) => {
        if (count === 0) return 'bg-gray-800';
        if (count === 1) return 'bg-green-900';
        if (count <= 3) return 'bg-green-700';
        if (count <= 5) return 'bg-green-500';
        return 'bg-green-400';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d1117] text-gray-300">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <span className="loading loading-spinner loading-lg text-blue-500"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0d1117] text-gray-300">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    const { stats, recentSubmissions, languageStats } = dashboardData;
    const heatmapData = generateHeatmapData();

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-300 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Track your coding progress</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-lg border border-gray-800">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-white font-semibold">{stats.solved.total}</span>
                        <span className="text-gray-500">problems solved</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Problem Solving Overview - Circular Progress */}
                    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            Problem Solving Overview
                        </h2>

                        <div className="flex items-center justify-center mb-6">
                            {/* Circular Progress */}
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="#374151"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="url(#gradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - getProgress() / 100)}`}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-white">{stats.solved.total}</span>
                                    <span className="text-sm text-gray-500">/ {stats.total.count}</span>
                                    <span className="text-xs text-gray-500">Solved</span>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty Breakdown */}
                        <div className="space-y-4">
                            {['easy', 'medium', 'hard'].map((diff) => (
                                <div key={diff} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className={`capitalize ${getDifficultyColor(diff)}`}>{diff}</span>
                                        <span className="text-gray-400">
                                            {stats.solved[diff]} / {stats.total[diff]}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getDifficultyBgColor(diff)} transition-all duration-500`}
                                            style={{
                                                width: stats.total[diff] > 0
                                                    ? `${(stats.solved[diff] / stats.total[diff]) * 100}%`
                                                    : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Languages Used */}
                    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-purple-400" />
                            Languages
                        </h2>

                        {languageStats && languageStats.length > 0 ? (
                            <div className="space-y-4">
                                {languageStats.map((lang) => (
                                    <div key={lang._id} className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                                <Code2 className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <span className="font-medium text-white capitalize">{lang._id}</span>
                                        </div>
                                        <span className="text-gray-400">{lang.count} submissions</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Code2 className="w-12 h-12 mb-2 opacity-30" />
                                <p>No submissions yet</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            Quick Stats
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0d1117] rounded-lg p-4 border border-gray-800">
                                <div className="text-2xl font-bold text-green-400">{stats.solved.easy}</div>
                                <div className="text-sm text-gray-500">Easy Solved</div>
                            </div>
                            <div className="bg-[#0d1117] rounded-lg p-4 border border-gray-800">
                                <div className="text-2xl font-bold text-yellow-400">{stats.solved.medium}</div>
                                <div className="text-sm text-gray-500">Medium Solved</div>
                            </div>
                            <div className="bg-[#0d1117] rounded-lg p-4 border border-gray-800">
                                <div className="text-2xl font-bold text-red-400">{stats.solved.hard}</div>
                                <div className="text-sm text-gray-500">Hard Solved</div>
                            </div>
                            <div className="bg-[#0d1117] rounded-lg p-4 border border-gray-800">
                                <div className="text-2xl font-bold text-blue-400">{getProgress()}%</div>
                                <div className="text-sm text-gray-500">Completion</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submissions Heatmap */}
                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-400" />
                            {new Date().getFullYear()} Submissions
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-900"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-700"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                                <div className="w-3 h-3 rounded-sm bg-green-400"></div>
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
                                                className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)} hover:ring-1 hover:ring-gray-600 transition-all cursor-pointer`}
                                                title={`${day.date}: ${day.count} submissions`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">{monthData.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Recent Submissions
                    </h2>

                    {recentSubmissions && recentSubmissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-500 text-sm border-b border-gray-800">
                                        <th className="pb-3 font-medium">Problem</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Language</th>
                                        <th className="pb-3 font-medium">Runtime</th>
                                        <th className="pb-3 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {recentSubmissions.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-[#0d1117] transition-colors">
                                            <td className="py-3">
                                                <button
                                                    onClick={() => navigate(`/problem/${sub.problem?._id}`)}
                                                    className="text-gray-200 hover:text-blue-400 transition-colors"
                                                >
                                                    {sub.problem?.title || 'Unknown Problem'}
                                                </button>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-400 capitalize">{sub.language}</td>
                                            <td className="py-3 text-gray-400">{sub.runtime} ms</td>
                                            <td className="py-3 text-gray-500 text-sm">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <CheckCircle2 className="w-12 h-12 mb-2 opacity-30" />
                            <p>No submissions yet</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 text-blue-400 hover:underline"
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
