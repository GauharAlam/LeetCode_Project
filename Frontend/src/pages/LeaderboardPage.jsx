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
            case 1: return <Trophy className="text-yellow-400" size={24} />;
            case 2: return <Medal className="text-gray-400" size={24} />;
            case 3: return <Medal className="text-orange-400" size={24} />;
            default: return <span className="text-gray-500 font-mono w-6 text-center">#{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border-yellow-500/30';
            case 2: return 'bg-gradient-to-r from-gray-700/30 to-gray-700/10 border-gray-500/30';
            case 3: return 'bg-gradient-to-r from-orange-900/30 to-orange-900/10 border-orange-500/30';
            default: return 'bg-gray-900/50 border-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                        <Trophy className="text-yellow-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
                        <p className="text-gray-500">Top coders ranked by problems solved</p>
                    </div>
                </div>

                {/* User's Rank Card */}
                {userRank && (
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-6 mb-8 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Your Current Ranking</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-white">#{userRank.rank}</span>
                                    <span className="text-gray-500">of {userRank.totalUsers} users</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-green-400">
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
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry._id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankBg(entry.rank)} ${entry._id === user?._id ? 'ring-2 ring-blue-500' : ''}`}
                            >
                                <div className="w-12 flex justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>

                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                    {entry.firstName?.[0]?.toUpperCase() || '?'}
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium text-white">
                                        {entry.firstName}
                                        {entry._id === user?._id && (
                                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                                        )}
                                    </p>
                                    <p className="text-gray-500 text-sm">{entry.email}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{entry.problemsSolved}</p>
                                    <p className="text-gray-500 text-xs">problems solved</p>
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
