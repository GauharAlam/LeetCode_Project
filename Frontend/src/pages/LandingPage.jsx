import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import {
    Code2, Users, Trophy, ArrowRight, BookOpen,
    Target, MessageSquare, Award, Zap, CheckCircle2
} from 'lucide-react';

// Typing animation for the hero code editor
const useTypingEffect = (code, speed = 40) => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let i = 0;
        setDisplayedCode('');
        setIsComplete(false);
        const interval = setInterval(() => {
            if (i < code.length) {
                setDisplayedCode(code.slice(0, i + 1));
                i++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [code, speed]);

    return { displayedCode, isComplete };
};

const HERO_CODE = `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i`;

const TEST_CASES = [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]', status: 'pass' },
    { input: 'nums = [3,2,4], target = 6', output: '[1, 2]', status: 'pass' },
    { input: 'nums = [3,3], target = 6', output: '[0, 1]', status: 'pass' },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const { displayedCode, isComplete } = useTypingEffect(HERO_CODE, 30);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosClient.get("/problem/global-stats");
                setStats(response.data);
            } catch (err) {
                console.error("Failed to load platform stats:", err);
            }
        };
        fetchStats();
    }, []);

    const handleStartJourney = () => {
        if (isAuthenticated) {
            navigate('/problems');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="min-h-screen bg-canvas">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Subtle gradient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-ember-400/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="micro-label text-ember-400">Master algorithms. Build real skill.</p>
                                <h1 className="text-5xl lg:text-[3.5rem] font-bold text-text-primary leading-[1.05] font-display">
                                    Forge Your Code.
                                    <br />
                                    <span className="text-text-secondary">Temper Your Mind.</span>
                                </h1>
                            </div>
                            <p className="text-text-secondary text-lg max-w-lg leading-relaxed">
                                Every problem solved is metal tempered — practice deliberately,
                                track your heat, and watch cold iron become mastery.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleStartJourney}
                                    className="btn-ember px-8 py-3 text-base flex items-center gap-2"
                                >
                                    Start Forging
                                    <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={() => navigate('/problems')}
                                    className="btn-secondary-af px-8 py-3 text-base flex items-center gap-2"
                                >
                                    <Code2 size={20} />
                                    Browse Problems
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="flex gap-12 pt-4">
                                <div>
                                    <p className="text-3xl font-bold text-text-primary font-mono">{stats ? stats.problems?.total : '500+'}</p>
                                    <p className="text-text-muted text-sm mt-0.5">Problems</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-text-primary font-mono">{stats ? stats.users : '100+'}</p>
                                    <p className="text-text-muted text-sm mt-0.5">Active Forgers</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-text-primary font-mono">{stats ? stats.languages : '15+'}</p>
                                    <p className="text-text-muted text-sm mt-0.5">Languages</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content — Live Code Editor Panel */}
                        <div className="relative hidden lg:block">
                            <div className="card-af p-0 overflow-hidden">
                                {/* Editor header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-elevated border-b border-border-subtle">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-hard/60" />
                                            <div className="w-3 h-3 rounded-full bg-medium/60" />
                                            <div className="w-3 h-3 rounded-full bg-easy/60" />
                                        </div>
                                        <span className="text-xs text-text-muted font-mono">two_sum.py</span>
                                    </div>
                                    <span className="badge-easy text-[10px] px-2 py-0.5">EASY</span>
                                </div>

                                {/* Code area */}
                                <div className="bg-inset p-5 min-h-[220px]">
                                    <pre className="text-sm font-mono text-text-secondary leading-relaxed whitespace-pre">
                                        <code>{displayedCode}</code>
                                        <span className="animate-typing-cursor text-ember-400">|</span>
                                    </pre>
                                </div>

                                {/* Test results */}
                                <div className="border-t border-border-subtle bg-surface px-4 py-3">
                                    <p className="micro-label mb-2">Test Results</p>
                                    <div className="space-y-1.5">
                                        {TEST_CASES.map((tc, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-2 text-xs transition-all duration-500 ${
                                                    isComplete ? 'opacity-100' : i === 0 && displayedCode.length > 50 ? 'opacity-100' : 'opacity-20'
                                                }`}
                                            >
                                                <CheckCircle2 size={14} className={isComplete || (i === 0 && displayedCode.length > 50) ? 'text-easy' : 'text-text-muted'} />
                                                <span className="font-mono text-text-muted">{tc.input}</span>
                                                <span className="text-text-muted">→</span>
                                                <span className="font-mono text-easy">{tc.output}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 border-t border-border-subtle">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="micro-label text-ember-400 mb-3">Everything you need</p>
                        <h2 className="text-4xl font-bold text-text-primary mb-4 font-display">Built for Serious Practice</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Tools designed to transform repetition into real-world skill.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard title="Progress Tracking" description="Track your problem-solving journey, manage assignments, and monitor your learning progress with the Temper Gauge." icon={<Target size={24} />} link="/dashboard" linkText="View Dashboard" />
                        <FeatureCard title="Real-world Problems" description="Real-world challenges that mirror industry expectations and build job-ready skills." icon={<Code2 size={24} />} link="/problems" linkText="Explore Problems" />
                        <FeatureCard title="Code Reviews" description="Give and receive constructive feedback to improve via collaborative learning." icon={<MessageSquare size={24} />} link="/problems" linkText="Start Coding" />
                        <FeatureCard title="Community" description="Get support from the community and connect with other developers." icon={<Users size={24} />} link="/community" linkText="Join Now" />
                        <FeatureCard title="Study Plans" description="Structured learning paths curated by difficulty, topic, and interview prep goals." icon={<BookOpen size={24} />} link="/study-plans" linkText="Start Learning" />
                        <FeatureCard title="Achievements" description="Earn badges and build a public portfolio you can proudly share with employers." icon={<Award size={24} />} link="/profile" linkText="View Profile" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="card-af p-12 text-center relative overflow-hidden">
                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-ember-400/8 rounded-full blur-[80px] pointer-events-none" />
                        
                        <Zap className="text-ember-400 mx-auto mb-6" size={48} />
                        <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 font-display relative">
                            Ready to forge your coding skills?
                        </h2>
                        <p className="text-text-secondary mb-8 max-w-xl mx-auto relative">
                            Join developers who are tempering their algorithms and data structures mastery every day.
                        </p>
                        <button
                            onClick={handleStartJourney}
                            className="btn-ember px-8 py-3 text-base flex items-center gap-2 mx-auto relative"
                        >
                            Get Started for Free
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-border-subtle">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link to="/support" className="text-text-muted hover:text-text-secondary text-sm transition-colors">Help & Support</Link>
                            <Link to="#" className="text-text-muted hover:text-text-secondary text-sm transition-colors">Report an Issue</Link>
                        </div>
                        <p className="text-text-muted text-sm">© 2025 AlgoForge. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="https://github.com/GauharAlam" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-secondary transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/gauhar-alam/" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-secondary transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </a>
                            <a href="https://x.com/NawazCodex" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-secondary transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Feature Card Component — AlgoForge styled
const FeatureCard = ({ title, description, icon, link, linkText }) => {
    return (
        <div className="card-af card-af-interactive group cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-ember-400/10 rounded-lg text-ember-400">
                    {icon}
                </div>
                <span className="text-sm font-semibold text-text-primary font-display">
                    {title}
                </span>
            </div>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">{description}</p>
            <Link to={link} className="text-ember-400 hover:text-ember-300 text-sm flex items-center gap-1 group/link font-medium">
                {linkText}
                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default LandingPage;
