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
            case 1: return <Trophy className="text-amber-300" size={24} />;
            case 2: return <Medal className="text-slate-300" size={24} />;
            case 3: return <Medal className="text-amber-600" size={24} />;
            default: return <span className="text-text-muted font-mono w-6 text-center">#{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-amber-400/5 border-amber-400/20';
            case 2: return 'bg-slate-300/5 border-slate-300/20';
            case 3: return 'bg-amber-600/5 border-amber-600/20';
            default: return 'bg-surface border-border-subtle hover:border-border-default';
        }
    };

    return (
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-4">
                    <div className="p-3 bg-surface border border-border-subtle rounded-xl">
                        <Trophy className="text-ember-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-text-primary">Leaderboard</h1>
                        <p className="text-text-secondary text-sm">Top coders ranked by problems solved</p>
                    </div>
                </div>

                {/* User's Rank Card */}
                {userRank && (
                    <div className="bg-gradient-to-r from-steel-700/5 to-steel-500/5 rounded-card p-6 mb-8 border border-steel-500/20 text-steel-300">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-steel-300 text-xs font-mono uppercase tracking-wide mb-1">Your Current Ranking</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-text-primary font-mono">#{userRank.rank}</span>
                                    <span className="text-text-muted text-sm font-mono">of {userRank.totalUsers} users</span>
                                </div>
                            </div>
                            <div className="text-right sm:text-right text-left">
                                <div className="flex items-center gap-2 text-steel-300 justify-start sm:justify-end">
                                    <TrendingUp size={20} />
                                    <span className="text-2xl font-bold font-mono">Top {userRank.percentile}%</span>
                                </div>
                                <p className="text-text-muted text-xs mt-0.5">Keep solving to climb up!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry._id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankBg(entry.rank)} ${
                                    entry._id === user?._id ? 'ring-2 ring-ember-400 border-transparent' : ''
                                }`}
                            >
                                <div className="w-12 flex justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>

                                <div className="w-12 h-12 rounded-lg bg-ember-600 border border-border-default flex items-center justify-center text-text-primary font-bold text-lg font-display">
                                    {entry.firstName?.[0]?.toUpperCase() || '?'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-text-primary truncate font-display">
                                        {entry.firstName} {entry.lastName}
                                        {entry._id === user?._id && (
                                            <span className="ml-2.5 text-[9px] bg-ember-400 text-canvas px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">You</span>
                                        )}
                                    </p>
                                    <p className="text-text-muted text-xs font-mono truncate">{entry.email}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold text-text-primary font-mono">{entry.problemsSolved}</p>
                                    <p className="text-text-muted text-[10px] uppercase font-mono tracking-tighter">Solved</p>
                                </div>
                            </div>
                        ))}

                        {leaderboard.length === 0 && (
                            <div className="text-center py-12 card-af">
                                <Award className="w-12 h-12 mx-auto mb-3 text-text-muted" />
                                <p className="text-text-secondary">No users on the leaderboard yet</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaderboardPage;
