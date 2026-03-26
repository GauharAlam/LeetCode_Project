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
            case 'easy': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
            case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
            case 'hard': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100">
            <Navbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                        <Bookmark className="text-amber-600 dark:text-amber-400" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Problems</h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/10 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                        <BookmarkX className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
                        <p className="text-gray-500 mb-6 font-medium">Save problems you want to solve later</p>
                        <button
                            onClick={() => navigate('/problems')}
                            className="btn bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 border-none font-bold rounded-full px-8"
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
                                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-all group"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1">
                                            <button
                                                onClick={() => navigate(`/problem/${problem._id}`)}
                                                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-left"
                                            >
                                                {problem.title}
                                            </button>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black border ${getDifficultyColor(problem.difficulty)} uppercase tracking-wider`}>
                                                    {problem.difficulty}
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {problem.tags?.slice(0, 4).map((tag, idx) => (
                                                        <span key={idx} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-tighter">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                                        <button
                                            onClick={() => navigate(`/problem/${problem._id}`)}
                                            className="btn btn-md bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 border-none px-6 font-bold rounded-xl"
                                        >
                                            Solve Now
                                        </button>
                                        <button
                                            onClick={() => removeBookmark(problem._id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
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
