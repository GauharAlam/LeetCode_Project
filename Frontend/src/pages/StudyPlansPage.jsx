import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { BookOpen, ArrowRight, CheckCircle2, Loader2, Target, Flame, Trophy, Zap } from 'lucide-react';

// Predefined study plans
const STUDY_PLANS = [
    {
        id: 'beginner',
        name: '30 Days of Code',
        description: 'Perfect for beginners starting their coding journey',
        duration: '30 days',
        difficulty: 'Easy',
        icon: Target,
        color: 'from-green-500 to-emerald-500',
        topics: ['Arrays', 'Strings', 'Math', 'Basic Loops']
    },
    {
        id: 'dsa',
        name: 'Data Structures Mastery',
        description: 'Master all essential data structures',
        duration: '60 days',
        difficulty: 'Medium',
        icon: Flame,
        color: 'from-orange-500 to-red-500',
        topics: ['Arrays', 'LinkedLists', 'Trees', 'Graphs', 'HashMaps']
    },
    {
        id: 'interview',
        name: 'Top Interview 150',
        description: 'Most frequently asked interview questions',
        duration: '45 days',
        difficulty: 'Medium-Hard',
        icon: Trophy,
        color: 'from-purple-500 to-pink-500',
        topics: ['DP', 'Greedy', 'Backtracking', 'Two Pointers']
    },
    {
        id: 'advanced',
        name: 'Advanced Algorithms',
        description: 'For experienced coders aiming for FAANG',
        duration: '90 days',
        difficulty: 'Hard',
        icon: Zap,
        color: 'from-blue-500 to-cyan-500',
        topics: ['Dynamic Programming', 'Graphs', 'System Design Basics']
    }
];

const StudyPlansPage = () => {
    const navigate = useNavigate();

    const handleStartPlan = (planId) => {
        // Navigate to problems page with pre-filtered tags based on plan
        navigate('/problems');
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <BookOpen className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Study Plans</h1>
                        <p className="text-gray-500">Structured learning paths to level up your skills</p>
                    </div>
                </div>

                {/* Study Plans Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {STUDY_PLANS.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color}`}>
                                        <Icon className="text-white" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                        <p className="text-gray-400 text-sm">{plan.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {plan.topics.map((topic, idx) => (
                                        <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                            {topic}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <span className="text-sm text-gray-500">
                                            ⏱️ {plan.duration}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            📊 {plan.difficulty}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleStartPlan(plan.id)}
                                        className="btn btn-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none gap-1 group-hover:gap-2 transition-all"
                                    >
                                        Start Plan
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Coming Soon Banner */}
                <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 text-center">
                    <h3 className="text-lg font-medium text-white mb-2">More Plans Coming Soon!</h3>
                    <p className="text-gray-400 text-sm">We're working on specialized tracks for System Design, SQL, and more.</p>
                </div>
            </main>
        </div>
    );
};

export default StudyPlansPage;
