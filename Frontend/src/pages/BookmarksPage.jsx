import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Bookmark, BookmarkX, Loader2 } from 'lucide-react';

const BookmarksPage = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const { data } = await axiosClient.get('/problem/bookmarks');
            setBookmarks(data);
        } catch (error) {
            console.error("Failed to fetch bookmarks", error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (problemId) => {
        try {
            await axiosClient.delete(`/problem/bookmark/${problemId}`);
            setBookmarks(prev => prev.filter(b => b.problemId._id !== problemId));
        } catch (error) {
            console.error("Failed to remove bookmark", error);
        }
    };

    const getDifficultyBadge = (diff) => {
        const classes = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
        return classes[diff] || '';
    };

    return (
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8 border-b border-border-subtle pb-4">
                    <div className="p-3 bg-surface border border-border-subtle rounded-xl">
                        <Bookmark className="text-ember-400" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold font-display text-text-primary">Saved Problems</h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-20 card-af">
                        <BookmarkX className="w-16 h-16 text-text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-primary mb-2 font-display">No bookmarks yet</h3>
                        <p className="text-text-secondary mb-6">Save problems you want to solve later</p>
                        <button
                            onClick={() => navigate('/problems')}
                            className="btn-ember px-8 py-3 text-sm font-semibold"
                        >
                            Browse Problems
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {bookmarks.map((bookmark) => {
                            const problem = bookmark.problemId;
                            if (!problem) return null;

                            return (
                                <div
                                    key={bookmark._id}
                                    className="card-af card-af-interactive flex flex-col md:flex-row md:items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1">
                                            <button
                                                onClick={() => navigate(`/problem/${problem._id}`)}
                                                className="text-xl font-bold text-text-primary hover:text-ember-300 transition-colors text-left font-display"
                                            >
                                                {problem.title}
                                            </button>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span className={getDifficultyBadge(problem.difficulty)}>
                                                    {problem.difficulty}
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {problem.tags?.slice(0, 4).map((tag, idx) => (
                                                        <span key={idx} className="tag-chip">
                                                            {tag === 'arary' ? 'Array' : tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                                        <button
                                            onClick={() => navigate(`/problem/${problem._id}`)}
                                            className="btn-ember px-6 py-2.5 text-sm font-semibold"
                                        >
                                            Solve Now
                                        </button>
                                        <button
                                            onClick={() => removeBookmark(problem._id)}
                                            className="p-2.5 text-text-muted hover:text-hard hover:bg-hard/10 rounded-xl transition-all"
                                            title="Remove bookmark"
                                        >
                                            <BookmarkX size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookmarksPage;
