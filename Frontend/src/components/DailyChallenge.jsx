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
            <div className="card-af p-6 mb-8 animate-pulse flex h-32 items-center justify-center">
                <span className="text-text-muted text-sm font-mono">Loading today's challenge...</span>
            </div>
        );
    }

    if (!challenge) {
        return null;
    }

    const isSolved = user?.problemSolved?.includes(challenge._id);
    const dateObj = new Date(challenge.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const getDifficultyBadge = (diff) => {
        const classes = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
        return classes[diff] || '';
    };

    return (
        <div className="card-af card-af-interactive p-6 mb-8 relative overflow-hidden group">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-ember-400/5 to-transparent pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                
                <div className="flex items-start gap-4">
                    <div className="p-4 rounded-xl bg-elevated border border-border-subtle flex items-center justify-center text-text-primary">
                        {isSolved ? (
                            <CheckCircle2 className="w-8 h-8 text-easy" />
                        ) : (
                            <Calendar className="w-8 h-8 text-text-muted" />
                        )}
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="micro-label text-[10px] text-text-muted flex items-center gap-1">
                                <Target size={12} className="text-ember-400" /> Problem of the Day
                            </span>
                            <span className="text-[10px] font-mono font-bold text-text-muted bg-inset px-2 py-0.5 rounded-full border border-border-subtle">
                                {formattedDate}
                            </span>
                        </div>
                        
                        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2 font-display">
                            {challenge.title}
                            {isSolved && (
                                <span className="badge-easy text-[10px] px-2 py-0.5 ml-2 font-mono font-bold">
                                    SOLVED
                                </span>
                            )}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={getDifficultyBadge(challenge.difficulty)}>
                                {challenge.difficulty}
                            </span>
                            {challenge.tags?.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="tag-chip">
                                    {tag === 'arary' ? 'Array' : tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <button 
                        onClick={() => navigate(`/problem/${challenge._id}`)}
                        className={isSolved ? 'btn-secondary-af px-6 py-3 text-sm flex items-center gap-2' : 'btn-ember px-6 py-3 text-sm flex items-center gap-2'}
                    >
                        {isSolved ? 'Review Problem' : 'Solve Challenge'} 
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyChallenge;
