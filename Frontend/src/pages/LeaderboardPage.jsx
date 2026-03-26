import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Trophy, Medal, Award, Loader2, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leaderboardRes, rankRes] = await Promise.all([
                axiosClient.get('/problem/leaderboard'),
                axiosClient.get('/problem/rank')
            ]);
            setLeaderboard(leaderboardRes.data);
            setUserRank(rankRes.data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="text-amber-500" size={24} />;
            case 2: return <Medal className="text-slate-400 dark:text-slate-300" size={24} />;
            case 3: return <Medal className="text-amber-700 dark:text-amber-600" size={24} />;
            default: return <span className="text-gray-500 font-mono w-6 text-center">#{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20';
            case 2: return 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700/50';
            case 3: return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-500/20';
            default: return 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-300">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                        <Trophy className="text-amber-500 dark:text-amber-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
                        <p className="text-gray-500">Top coders ranked by problems solved</p>
                    </div>
                </div>

                {/* User's Rank Card */}
                {userRank && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Your Current Ranking</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">#{userRank.rank}</span>
                                    <span className="text-gray-500">of {userRank.totalUsers} users</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 justify-end">
                                    <TrendingUp size={20} />
                                    <span className="text-2xl font-bold">Top {userRank.percentile}%</span>
                                </div>
                                <p className="text-gray-500 text-sm">Keep solving to climb up!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry._id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankBg(entry.rank)} ${entry._id === user?._id ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
                            >
                                <div className="w-12 flex justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>

                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                    {entry.firstName?.[0]?.toUpperCase() || '?'}
                                </div>

                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {entry.firstName}
                                        {entry._id === user?._id && (
                                            <span className="ml-2 text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-black">You</span>
                                        )}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{entry.email}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{entry.problemsSolved}</p>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Problems Solved</p>
                                </div>
                            </div>
                        ))}

                        {leaderboard.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No users on the leaderboard yet</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaderboardPage;
