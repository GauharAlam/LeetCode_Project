import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Bookmark, BookmarkX, CheckCircle2, Loader2 } from 'lucide-react';

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

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Bookmark className="text-orange-500" size={32} />
                    <h1 className="text-3xl font-bold text-white">Saved Problems</h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-20">
                        <BookmarkX className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">No bookmarks yet</h3>
                        <p className="text-gray-500 mb-6">Save problems you want to solve later</p>
                        <button
                            onClick={() => navigate('/problems')}
                            className="btn bg-orange-500 hover:bg-orange-600 text-white"
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
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1">
                                            <button
                                                onClick={() => navigate(`/problem/${problem._id}`)}
                                                className="text-lg font-medium text-white hover:text-orange-400 transition-colors"
                                            >
                                                {problem.title}
                                            </button>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)} uppercase`}>
                                                    {problem.difficulty}
                                                </span>
                                                <div className="flex gap-2">
                                                    {problem.tags?.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/problem/${problem._id}`)}
                                            className="btn btn-sm btn-outline btn-info"
                                        >
                                            Solve
                                        </button>
                                        <button
                                            onClick={() => removeBookmark(problem._id)}
                                            className="btn btn-sm btn-ghost text-red-400 hover:bg-red-900/20"
                                            title="Remove bookmark"
                                        >
                                            <BookmarkX size={18} />
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
