import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Trophy, Clock, Users, PlayCircle, Timer, CheckCircle, Loader2 } from 'lucide-react';

const ContestsPage = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

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
                return <span className="badge badge-error gap-1"><span className="animate-pulse">●</span> Live</span>;
            case 'upcoming':
                return <span className="badge badge-info gap-1"><Clock size={12} /> Upcoming</span>;
            case 'ended':
                return <span className="badge badge-ghost gap-1"><CheckCircle size={12} /> Ended</span>;
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
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                        <Trophy className="text-red-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Contests</h1>
                        <p className="text-gray-500">Compete with others and test your skills</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['all', 'live', 'upcoming', 'ended'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Contests Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : contests.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">No contests found</h3>
                        <p className="text-gray-500">Check back later for new contests!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {contests.map((contest) => (
                            <div
                                key={contest._id}
                                className={`bg-gray-900 border rounded-2xl p-6 transition-all hover:scale-[1.01] ${contest.status === 'live' ? 'border-red-500/50' : 'border-gray-800 hover:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                                        {getStatusBadge(contest.status)}
                                    </div>
                                    {contest.status === 'live' && (
                                        <div className="text-red-400 animate-pulse">
                                            <Timer size={24} />
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {contest.description || 'Compete against other coders!'}
                                </p>

                                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {formatDate(contest.startTime)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Timer size={14} />
                                        {contest.duration} mins
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users size={14} />
                                        {contest.participants?.length || 0} participants
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {contest.problems?.length || 0} problems
                                    </span>
                                    {contest.status === 'live' ? (
                                        <button
                                            onClick={() => handleJoinContest(contest._id)}
                                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none gap-1"
                                        >
                                            <PlayCircle size={16} />
                                            Join Now
                                        </button>
                                    ) : contest.status === 'upcoming' ? (
                                        <button
                                            onClick={() => handleJoinContest(contest._id)}
                                            className="btn btn-sm btn-outline btn-info gap-1"
                                        >
                                            Register
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/contest/${contest._id}`)}
                                            className="btn btn-sm btn-ghost text-gray-400"
                                        >
                                            View Results
                                        </button>
                                    )}
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
