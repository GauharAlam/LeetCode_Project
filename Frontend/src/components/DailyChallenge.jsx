import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { Calendar, Target, CheckCircle2, ArrowRight } from 'lucide-react';

const DailyChallenge = () => {
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchDailyChallenge = async () => {
            try {
                const { data } = await axiosClient.get('/problem/daily-challenge');
                setChallenge(data);
            } catch (err) {
                console.error("Failed to fetch daily challenge:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDailyChallenge();
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 animate-pulse flex h-32 items-center justify-center">
                <span className="text-gray-500 text-sm">Loading today's challenge...</span>
            </div>
        );
    }

    if (!challenge) {
        return null;
    }

    const isSolved = user?.problemSolved?.includes(challenge._id);
    const dateObj = new Date(challenge.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'easy': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
            case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
            case 'hard': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-gray-200/20 dark:from-gray-800/20 to-transparent pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                
                <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl flex items-center justify-center ${isSolved ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-800'}`}>
                        {isSolved ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        ) : (
                            <Calendar className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                <Target size={12} /> Problem of the Day
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500 px-2 bg-white dark:bg-[#0d1117] rounded-full border border-gray-200 dark:border-gray-700">
                                {formattedDate}
                            </span>
                        </div>
                        
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            {challenge.title}
                            {isSolved && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium border border-gray-300 dark:border-gray-700 ml-2">Solved</span>}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getDifficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty}
                            </span>
                            {challenge.tags?.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <button 
                        onClick={() => navigate(`/problem/${challenge._id}`)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${
                            isSolved 
                            ? 'bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800' 
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-200'
                        }`}
                    >
                        {isSolved ? 'Review Problem' : 'Solve Challenge'} 
                        <ArrowRight size={18} className={isSolved ? 'text-gray-400' : 'text-gray-400 group-hover:translate-x-1 transition-transform'} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyChallenge;
