import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Trophy, Clock, Users, PlayCircle, Timer, CheckCircle, Loader2 } from 'lucide-react';

// Countdown hook
const useCountdown = (contests) => {
    const [countdowns, setCountdowns] = useState({});

    useEffect(() => {
        const activeContests = contests.filter(c => c.status === 'live' || c.status === 'upcoming');
        if (activeContests.length === 0) return;

        const updateCountdowns = () => {
            const now = Date.now();
            const newCountdowns = {};

            activeContests.forEach(contest => {
                const startTime = new Date(contest.startTime).getTime();
                const endTime = startTime + (contest.duration * 60 * 1000);

                let diff, label;
                if (contest.status === 'upcoming') {
                    diff = startTime - now;
                    label = 'Starts in';
                } else {
                    diff = endTime - now;
                    label = 'Ends in';
                }

                if (diff <= 0) {
                    newCountdowns[contest._id] = { label, time: 'Now', expired: true };
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const secs = Math.floor((diff % (1000 * 60)) / 1000);
                    const timeStr = hours > 0
                        ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
                        : `${mins}:${String(secs).padStart(2, '0')}`;
                    newCountdowns[contest._id] = { label, time: timeStr, expired: false };
                }
            });

            setCountdowns(newCountdowns);
        };

        updateCountdowns();
        const interval = setInterval(updateCountdowns, 1000);
        return () => clearInterval(interval);
    }, [contests]);

    return countdowns;
};

const ContestsPage = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();
    const countdowns = useCountdown(contests);

    useEffect(() => {
        fetchContests();
    }, [activeTab]);

    const fetchContests = async () => {
        try {
            const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
            const { data } = await axiosClient.get(`/problem/contests${params}`);
            setContests(data);
        } catch (error) {
            console.error("Failed to fetch contests", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'live':
                return (
                    <span className="badge-live font-mono text-[10px] font-bold flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />
                        LIVE
                    </span>
                );
            case 'upcoming':
                return (
                    <span className="badge-steel font-mono text-[10px] font-bold flex items-center gap-1.5 w-fit">
                        <Clock size={12} />
                        UPCOMING
                    </span>
                );
            case 'ended':
                return (
                    <span className="text-text-muted bg-elevated border border-border-subtle rounded-full text-[10px] font-mono font-bold px-2 py-0.5 flex items-center gap-1.5 w-fit">
                        <CheckCircle size={12} />
                        ENDED
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleJoinContest = async (contestId) => {
        try {
            await axiosClient.post(`/problem/contest/${contestId}/join`);
            navigate(`/contest/${contestId}`);
        } catch (error) {
            console.error("Failed to join contest", error);
        }
    };

    return (
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-4">
                    <div className="p-3 bg-surface border border-border-subtle rounded-xl">
                        <Trophy className="text-ember-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-text-primary">Contests</h1>
                        <p className="text-text-secondary text-sm">Compete with others and test your skills</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-surface rounded-control p-1 mb-6 w-fit border border-border-subtle">
                    {['all', 'live', 'upcoming', 'ended'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab
                                    ? 'bg-elevated text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Contests Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
                    </div>
                ) : contests.length === 0 ? (
                    <div className="text-center py-20 card-af">
                        <Trophy className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-text-primary font-display">No contests found</h3>
                        <p className="text-text-secondary">Check back later for new contests!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {contests.map((contest) => (
                            <div
                                key={contest._id}
                                className={`card-af card-af-interactive flex flex-col justify-between ${
                                    contest.status === 'ended' ? 'opacity-70 hover:opacity-100' : ''
                                } ${contest.status === 'live' ? 'border-live/40 hover:border-live/60' : ''}`}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary mb-2 font-display group-hover:text-ember-300 transition-colors">{contest.title}</h3>
                                            {getStatusBadge(contest.status)}
                                        </div>
                                        {/* Live Countdown Timer */}
                                        {countdowns[contest._id] && !countdowns[contest._id].expired && (
                                            <div className="text-right">
                                                <span className="text-[10px] micro-label block text-text-muted">{countdowns[contest._id].label}</span>
                                                <span className={`text-lg font-mono font-bold ${
                                                    contest.status === 'live' ? 'text-live animate-pulse' : 'text-steel-300'
                                                }`}>
                                                    {countdowns[contest._id].time}
                                                </span>
                                            </div>
                                        )}
                                        {contest.status === 'live' && !countdowns[contest._id] && (
                                            <div className="text-live animate-pulse">
                                                <Timer size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-text-secondary text-sm mb-6 leading-relaxed line-clamp-2">
                                        {contest.description || 'Compete against other coders and climb the leaderboard!'}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono text-text-muted border-t border-border-subtle/50 pt-4">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-text-muted" />
                                            {formatDate(contest.startTime)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Timer size={14} className="text-text-muted" />
                                            {contest.duration} mins
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Users size={14} className="text-text-muted" />
                                            {contest.participants?.length || 0} registered
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-border-subtle pt-4">
                                        <span className="text-sm font-mono text-text-muted">
                                            {contest.problems?.length || 0} problems
                                        </span>
                                        {contest.status === 'live' ? (
                                            <button
                                                onClick={() => handleJoinContest(contest._id)}
                                                className="btn-ember px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                                            >
                                                <PlayCircle size={15} />
                                                Join Now
                                            </button>
                                        ) : contest.status === 'upcoming' ? (
                                            <button
                                                onClick={() => handleJoinContest(contest._id)}
                                                className="btn-secondary-af px-5 py-2 text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                Register
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/contest/${contest._id}`)}
                                                className="btn-ghost-af px-4 py-2 text-xs font-medium"
                                            >
                                                View Results
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ContestsPage;
