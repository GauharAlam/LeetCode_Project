import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { FileCode2, CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

const SubmissionsPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const { data } = await axiosClient.get('/submission/all');
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to fetch submissions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const filteredSubmissions = filter === 'all'
        ? submissions
        : submissions.filter(s => s.status === filter);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'wrong':
                return <XCircle size={16} className="text-red-500 dark:text-red-400" />;
            case 'error':
                return <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" />;
            default:
                return <Clock size={16} className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            accepted: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            wrong: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
            error: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            pending: 'bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRuntime = (runtime) => {
        if (!runtime) return '—';
        return `${(runtime * 1000).toFixed(0)} ms`;
    };

    const formatMemory = (memory) => {
        if (!memory) return '—';
        return `${(memory / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-300">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                        <FileCode2 className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submissions</h1>
                        <p className="text-gray-500">Your complete submission history</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {['all', 'accepted', 'wrong', 'error'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
                                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                                : 'bg-gray-100 dark:bg-[#161b22] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab !== 'all' && (
                                <span className="ml-1.5 text-xs opacity-60">
                                    ({submissions.filter(s => s.status === tab).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Submissions Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117]/50 text-gray-500 dark:text-gray-400 text-sm">
                                    <th className="px-6 py-4 font-medium">Problem</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Language</th>
                                    <th className="px-6 py-4 font-medium">Runtime</th>
                                    <th className="px-6 py-4 font-medium">Memory</th>
                                    <th className="px-6 py-4 font-medium text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                                <span className="text-gray-500 text-sm">Loading submissions...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((sub) => (
                                        <tr
                                            key={sub._id}
                                            className="group hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors cursor-pointer"
                                            onClick={() => sub.problemId?._id && navigate(`/problem/${sub.problemId._id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="text-gray-900 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {sub.problemId?.title || 'Deleted Problem'}
                                                    </span>
                                                    {sub.problemId?.difficulty && (
                                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${
                                                            sub.problemId.difficulty === 'easy' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                                            sub.problemId.difficulty === 'medium' ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                                            'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                                        }`}>
                                                            {sub.problemId.difficulty}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(sub.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {sub.language}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatRuntime(sub.runtime)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatMemory(sub.memory)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500 text-right">
                                                {formatDate(sub.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <FileCode2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            <p>No submissions found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {!loading && (
                    <div className="mt-4 text-xs text-gray-500 text-right">
                        Showing {filteredSubmissions.length} of {submissions.length} submissions
                    </div>
                )}
            </main>
        </div>
    );
};

export default SubmissionsPage;
