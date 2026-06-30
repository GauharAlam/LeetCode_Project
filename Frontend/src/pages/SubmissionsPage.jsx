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
                return <CheckCircle2 size={15} className="text-easy" />;
            case 'wrong':
                return <XCircle size={15} className="text-hard" />;
            case 'error':
                return <AlertCircle size={15} className="text-medium" />;
            default:
                return <Clock size={15} className="text-text-muted" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            accepted: 'text-easy bg-easy/10 border border-easy/20',
            wrong: 'text-hard bg-hard/10 border border-hard/20',
            error: 'text-medium bg-medium/10 border border-medium/20',
            pending: 'text-text-muted bg-inset border border-border-subtle',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${styles[status] || styles.pending}`}>
                {getStatusIcon(status)}
                {status.toUpperCase()}
            </span>
        );
    };

    const getDifficultyBadge = (diff) => {
        const classes = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
        return classes[diff] || '';
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
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-4">
                    <div className="p-3 bg-surface border border-border-subtle rounded-xl">
                        <FileCode2 className="text-ember-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-text-primary">Submissions</h1>
                        <p className="text-text-secondary text-sm">Your complete submission history</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-surface rounded-control p-1 mb-6 w-fit border border-border-subtle">
                    {['all', 'accepted', 'wrong', 'error'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === tab
                                    ? 'bg-elevated text-text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab !== 'all' && (
                                <span className="ml-1.5 text-xs opacity-60 font-mono">
                                    ({submissions.filter(s => s.status === tab).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Submissions Table */}
                <div className="overflow-hidden rounded-card border border-border-subtle bg-surface">
                    <div className="overflow-x-auto">
                        <table className="w-full table-af border-collapse">
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Status</th>
                                    <th>Language</th>
                                    <th>Runtime</th>
                                    <th>Memory</th>
                                    <th className="text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
                                                <span className="text-text-muted text-sm font-mono">Loading submissions...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((sub) => (
                                        <tr
                                            key={sub._id}
                                            className="group hover:bg-elevated transition-colors cursor-pointer"
                                            onClick={() => sub.problemId?._id && navigate(`/problem/${sub.problemId._id}`)}
                                        >
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-text-primary font-medium group-hover:text-ember-300 transition-colors text-base">
                                                        {sub.problemId?.title || 'Deleted Problem'}
                                                    </span>
                                                    {sub.problemId?.difficulty && (
                                                        <span className={getDifficultyBadge(sub.problemId.difficulty)}>
                                                            {sub.problemId.difficulty}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(sub.status)}
                                            </td>
                                            <td>
                                                <span className="tag-chip font-mono">
                                                    {sub.language}
                                                </span>
                                            </td>
                                            <td className="font-mono text-sm text-text-secondary">
                                                {formatRuntime(sub.runtime)}
                                            </td>
                                            <td className="font-mono text-sm text-text-secondary">
                                                {formatMemory(sub.memory)}
                                            </td>
                                            <td className="font-mono text-sm text-text-muted text-right">
                                                {formatDate(sub.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-text-muted">
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
                    <div className="mt-4 text-xs text-text-muted text-right font-mono">
                        Showing {filteredSubmissions.length} of {submissions.length} submissions
                    </div>
                )}
            </main>
        </div>
    );
};

export default SubmissionsPage;
