import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axiosClient from '../utils/axiosClient';
import { useTheme } from '../contexts/ThemeContext';
import {
  Play, Send, RotateCcw, CheckCircle2, AlertCircle, ChevronDown,
  Maximize2, Minimize2, Code2, FileText, Clock, Cpu, Bookmark,
  BookmarkCheck, Lightbulb, Loader2, X, ArrowLeft, ChevronLeft,
  ChevronRight, Sun, Moon, Copy, Check, Tag, Building2, MessageSquare, Notebook, Save, Sparkles, SendHorizontal, ChevronUp, MessageCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Execution State
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [activeCase, setActiveCase] = useState(0);
  const [bottomTab, setBottomTab] = useState('testcases');

  // Bookmark State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // AI Hint State
  const [showHintModal, setShowHintModal] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  // Community / Discussion
  const [problemDiscussions, setProblemDiscussions] = useState([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [showNewProblemPost, setShowNewProblemPost] = useState(false);
  const [newProblemPost, setNewProblemPost] = useState({ title: '', content: '' });

  // Notes State
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteLoading, setNoteLoading] = useState(true);

  // AI Chat State
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(40); // percentage
  const [bottomHeight, setBottomHeight] = useState(35); // percentage
  const [chatWidth, setChatWidth] = useState(30); // percentage of the right container
  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);
  const [isDraggingChatH, setIsDraggingChatH] = useState(false);
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Show/hide tags
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    if (activeTab === 'discuss') {
      fetchProblemDiscussions();
    }
  }, [id, activeTab]);

  const fetchProblemDiscussions = async () => {
    setDiscussionsLoading(true);
    try {
      const { data } = await axiosClient.get(`/problem/discussions/${id}`);
      setProblemDiscussions(data);
    } catch (error) {
      console.error("Failed to fetch discussions", error);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const handleCreateProblemPost = async (e) => {
    e.preventDefault();
    if (!newProblemPost.title.trim() || !newProblemPost.content.trim()) return;
    try {
      await axiosClient.post('/problem/discussion', {
        ...newProblemPost,
        problemId: id,
        category: 'Problem Solving',
        isGlobal: false
      });
      setShowNewProblemPost(false);
      setNewProblemPost({ title: '', content: '' });
      fetchProblemDiscussions();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${id}`);
        setProblem(data);
        const defaultStartCode = data.startCode?.find(sc => sc.language === language);
        setCode(defaultStartCode ? defaultStartCode.initialCode : '// Write your solution here\n\nfunction solution() {\n  // Your code\n}');
        try {
          const bookmarkRes = await axiosClient.get(`/problem/bookmark/${id}`);
          setIsBookmarked(bookmarkRes.data.isBookmarked);
        } catch (e) {
          setIsBookmarked(false);
        }

        // Fetch user's note
        try {
          const noteRes = await axiosClient.get(`/problem/${id}/note`);
          setNoteContent(noteRes.data.content || '');
        } catch (e) {
          console.error("Failed to load note", e);
        } finally {
          setNoteLoading(false);
        }

      } catch (error) {
        console.error("Failed to load problem", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id, language]);

  // Horizontal resize handler
  const handleMouseMoveH = useCallback((e) => {
    if (!isDraggingH || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.max(20, Math.min(60, newWidth)));
  }, [isDraggingH]);

  // Vertical resize handler
  const handleMouseMoveV = useCallback((e) => {
    if (!isDraggingV || !rightPanelRef.current) return;
    const rect = rightPanelRef.current.getBoundingClientRect();
    const newBottom = ((rect.bottom - e.clientY) / rect.height) * 100;
    setBottomHeight(Math.max(15, Math.min(65, newBottom)));
  }, [isDraggingV]);

  // Chat Horizontal resize handler
  const handleMouseMoveChatH = useCallback((e) => {
    if (!isDraggingChatH || !rightPanelRef.current) return;
    const rect = rightPanelRef.current.getBoundingClientRect();
    const newChatWidth = ((rect.right - e.clientX) / rect.width) * 100;
    setChatWidth(Math.max(20, Math.min(60, newChatWidth)));
  }, [isDraggingChatH]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingH(false);
    setIsDraggingV(false);
    setIsDraggingChatH(false);
  }, []);

  useEffect(() => {
    if (isDraggingH || isDraggingV || isDraggingChatH) {
      const handleMove = isDraggingH ? handleMouseMoveH : isDraggingV ? handleMouseMoveV : handleMouseMoveChatH;
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDraggingH || isDraggingChatH ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveH);
      document.removeEventListener('mousemove', handleMouseMoveV);
      document.removeEventListener('mousemove', handleMouseMoveChatH);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingH, isDraggingV, isDraggingChatH, handleMouseMoveH, handleMouseMoveV, handleMouseMoveChatH, handleMouseUp]);

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await axiosClient.delete(`/problem/bookmark/${id}`);
      } else {
        await axiosClient.post('/problem/bookmark', { problemId: id });
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Bookmark error", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleGetHint = async () => {
    setShowHintModal(true);
    setHintLoading(true);
    setHint('');
    try {
      const { data } = await axiosClient.post('/problem/ai-hint', {
        problemTitle: problem.title,
        problemDescription: problem.description,
        difficulty: problem.difficulty,
        userCode: code
      });
      setHint(data.hint);
    } catch (error) {
      setHint('Unable to get hint at this time. Try again later.');
    } finally {
      setHintLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setChatLoading(true);

    try {
      const { data } = await axiosClient.post('/problem/ai-chat', {
        problemTitle: problem.title,
        problemDescription: problem.description,
        userCode: code,
        language: language,
        chatHistory: chatHistory, // Send previous history
        userMessage: userMsg
      });
      setChatHistory([...newHistory, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: 'ai', content: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await axiosClient.post(`/problem/${id}/note`, { content: noteContent });
      // Show short visual feedback perhaps via a toast, but this serves as the simplest way:
      setTimeout(() => setSavingNote(false), 500);
    } catch (error) {
      console.error("Failed to save note:", error);
      setSavingNote(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const langCode = problem.startCode?.find(sc => sc.language === newLang);
    setCode(langCode ? langCode.initialCode : '// Write your solution here');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setBottomTab('results');
    try {
      const { data } = await axiosClient.post(`/submission/run/${id}`, { code, language, problemId: id });
      setOutput({ type: 'run', results: data });
    } catch (error) {
      setOutput({ type: 'error', message: error.response?.data?.message || "Execution Failed" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput(null);
    setBottomTab('results');
    try {
      const { data } = await axiosClient.post(`/submission/submit/${id}`, { code, language, problemId: id });
      setOutput({ type: 'submit', result: data });
    } catch (error) {
      setOutput({ type: 'error', message: error.response?.data?.message || "Submission Failed" });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-gray-500 bg-gray-200 border-gray-300';
      case 'medium': return 'text-gray-500 bg-gray-1000/10 border-gray-400';
      case 'hard': return 'text-gray-500 bg-gray-1000/10 border-gray-400';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white dark:bg-[#1e1e1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 overflow-hidden">

      {/* ═══════════════ TOP TOOLBAR ═══════════════ */}
      <div className="h-11 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 flex items-center px-3 gap-2 shrink-0">
        {/* Left: Back + Nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Problem List</span>
          </button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
          <button className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Center: Submit */}
        <div className="flex-1 flex justify-center gap-2">
          <button
            onClick={() => setShowChatPanel(!showChatPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
              showChatPanel 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                : 'bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            <Sparkles size={14} className={showChatPanel ? 'text-blue-500' : 'text-gray-500'} />
            Agent
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold bg-gray-800 hover:bg-gray-900 text-white transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
            Submit
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ═══════════════ MAIN WORKSPACE ═══════════════ */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">

        {/* ─── LEFT PANEL: Description ─── */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col min-w-0 bg-white dark:bg-[#252525] overflow-hidden">

          {/* Description Tabs */}
          <div className="h-10 flex items-center gap-0 px-1 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2d2d2d] shrink-0">
            {[
              { id: 'description', icon: FileText, label: 'Description' },
              { id: 'solutions', icon: Code2, label: 'Solutions' },
              { id: 'discuss', icon: MessageSquare, label: 'Discuss' },
              { id: 'notes', icon: Notebook, label: 'Notes' },
              { id: 'submissions', icon: Clock, label: 'Submissions' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors mx-0.5 ${
                  activeTab === id
                    ? 'bg-white dark:bg-[#252525] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Scrollable Description Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'description' && (
              <div className="p-5 space-y-5">
                {/* Title + Actions */}
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{problem.title}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Difficulty badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </span>

                    {/* Bookmark */}
                    <button
                      onClick={handleBookmark}
                      disabled={bookmarkLoading}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border ${
                        isBookmarked
                          ? 'bg-gray-100 dark:bg-gray-1000/10 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {bookmarkLoading ? <Loader2 size={11} className="animate-spin" /> :
                        isBookmarked ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
                      {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Description text */}
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  {(problem.visibleTestCases || []).map((testCase, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Example {idx + 1}:</h3>
                      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg p-3.5 border border-gray-200 dark:border-gray-800 space-y-1.5 font-mono text-sm">
                        <div><span className="text-gray-500 dark:text-gray-500">Input: </span><span className="text-gray-900 dark:text-gray-200">{testCase.input}</span></div>
                        <div><span className="text-gray-500 dark:text-gray-500">Output: </span><span className="text-gray-900 dark:text-gray-200">{testCase.output}</span></div>
                        {testCase.explanation && (
                          <div><span className="text-gray-500 dark:text-gray-500">Explanation: </span><span className="text-gray-700 dark:text-gray-400">{testCase.explanation}</span></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {problem.constraints && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Constraints:</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono bg-gray-50/50 dark:bg-gray-800/20 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      {problem.constraints}
                    </div>
                  </div>
                )}

                {/* Acceptance Stats */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-8 py-6 border-t border-gray-100 dark:border-gray-800 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Accepted</span>
                    <span className="font-bold text-gray-900 dark:text-white">{problem.acceptedCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Submissions</span>
                    <span className="font-bold text-gray-900 dark:text-white">{problem.submissionCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Acceptance Rate</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {problem.submissionCount > 0 
                        ? ((problem.acceptedCount / problem.submissionCount) * 100).toFixed(1) 
                        : '0.0'}%
                    </span>
                  </div>
                </div>

                {/* Metadata Accordions */}
                <div className="mt-4 border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Topics Accordion */}
                  <div className="collapse collapse-arrow rounded-none">
                    <input type="checkbox" /> 
                    <div className="collapse-title flex items-center gap-2 py-4 px-0 min-h-0 text-sm font-bold text-gray-700 dark:text-gray-300">
                       <Tag size={16} className="text-gray-400" /> Topics
                    </div>
                    <div className="collapse-content px-0">
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(problem.tags || []).map(tag => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Companies Accordion */}
                  <div className="collapse collapse-arrow rounded-none">
                    <input type="checkbox" /> 
                    <div className="collapse-title flex items-center gap-2 py-4 px-0 min-h-0 text-sm font-bold text-gray-700 dark:text-gray-300">
                       <Building2 size={16} className="text-gray-400" /> Companies
                    </div>
                    <div className="collapse-content px-0">
                       <div className="flex flex-wrap gap-2 pt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                          {(problem.companies || []).length > 0 
                            ? problem.companies.map(c => <span key={c} className="px-3 py-1 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">{c}</span>)
                            : "No company data available for this problem yet."}
                       </div>
                    </div>
                  </div>

                  {/* Hints Accordion */}
                  {(problem.hints || []).map((hint, index) => (
                    <div key={index} className="collapse collapse-arrow rounded-none">
                      <input type="checkbox" /> 
                      <div className="collapse-title flex items-center gap-2 py-4 px-0 min-h-0 text-sm font-bold text-gray-700 dark:text-gray-300">
                         <Lightbulb size={16} className="text-gray-400" /> Hint {index + 1}
                      </div>
                      <div className="collapse-content px-0">
                        <div className="pt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          {hint}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Discussion Link Accordion (Mocking the LeetCode UI) */}
                  <div className="collapse rounded-none" onClick={() => setActiveTab('discuss')}>
                    <div className="collapse-title flex items-center justify-between py-4 px-0 min-h-0 text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                       <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-gray-400" /> Discussion
                       </div>
                       <span className="text-xs text-gray-400 font-medium">Click to view tabs →</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'solutions' && (
              <div className="p-5 h-full flex flex-col overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code2 size={20} className="text-gray-500" />
                  Official Solutions
                </h2>
                
                {problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-10">
                    {problem.referenceSolution.map((sol, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="bg-gray-100 dark:bg-[#151515] border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{sol.language} Approach</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(sol.completeCode)}
                            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Copy Code"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="p-4 text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
                          {sol.completeCode}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <MessageSquare size={40} className="mb-3 opacity-50" />
                    <p className="text-sm font-medium">No official solution provided</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discuss' && (
              <div className="p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={20} className="text-gray-500" />
                    Discussions
                  </h2>
                  <Link 
                    to={`/community?problemId=${id}`}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    View All →
                  </Link>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                   {discussionsLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-gray-400" size={24} />
                      </div>
                   ) : problemDiscussions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                          <MessageSquare size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">No discussions yet</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Be the first to start a thread about this problem!</p>
                        <button 
                          onClick={() => setShowNewProblemPost(true)}
                          className="mt-4 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          Create Post
                        </button>
                      </div>
                   ) : (
                      problemDiscussions.map((post) => (
                        <div key={post._id} className="p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer" onClick={() => navigate(`/community/post/${post._id}`)}>
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                {post.category}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                           </div>
                           <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                              {post.title}
                           </h3>
                           <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                 <ChevronUp size={12} />
                                 {post.upvotes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                 <MessageCircle size={12} />
                                 {post.replies?.length || 0}
                              </span>
                              <span className="ml-auto text-gray-400">
                                 {post.userId?.firstName || 'User'}
                              </span>
                           </div>
                        </div>
                      ))
                   )}
                </div>
              </div>
            )}

            {/* New Problem Post Modal */}
            {showNewProblemPost && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewProblemPost(false)} />
                <div className="relative bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                   <div className="p-8">
                      <h2 className="text-xl font-black mb-4">Post to {problem?.id}</h2>
                      <form onSubmit={handleCreateProblemPost} className="space-y-4">
                         <input 
                           required
                           type="text" 
                           placeholder="Discussion title..."
                           className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl py-2 px-4 text-sm focus:outline-none"
                           value={newProblemPost.title}
                           onChange={(e) => setNewProblemPost({...newProblemPost, title: e.target.value})}
                         />
                         <textarea 
                           required
                           rows={4}
                           placeholder="Share your approach or question..."
                           className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl py-2 px-4 text-sm focus:outline-none resize-none"
                           value={newProblemPost.content}
                           onChange={(e) => setNewProblemPost({...newProblemPost, content: e.target.value})}
                         />
                         <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowNewProblemPost(false)} className="px-4 py-2 text-xs font-bold text-gray-400">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-black">Post</button>
                         </div>
                      </form>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Notebook size={20} className="text-gray-500" />
                    Personal Notes
                  </h2>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote || noteLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>

                {noteLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-400 dark:focus-within:ring-gray-600 transition-shadow">
                    <textarea 
                      className="flex-1 w-full bg-gray-50 dark:bg-[#202020] text-gray-800 dark:text-gray-200 p-4 resize-none focus:outline-none"
                      placeholder="Write your personal notes, ideas, or constraints here. Supports markdown syntax..."
                      value={noteContent}
                      spellCheck="false"
                      onChange={(e) => setNoteContent(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="p-5 flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <Clock size={40} className="mb-3 opacity-50" />
                <p className="text-sm font-medium">Your submissions</p>
                <p className="text-xs mt-1">Submit a solution to see your history</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── HORIZONTAL DRAG HANDLE ─── */}
        <div
          onMouseDown={() => setIsDraggingH(true)}
          className={`w-1.5 cursor-col-resize flex items-center justify-center group hover:bg-gray-600/20 transition-colors ${isDraggingH ? 'bg-gray-600/30' : 'bg-gray-200 dark:bg-gray-800'}`}
        >
          <div className="w-0.5 h-8 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-600 transition-colors" />
        </div>

        {/* ─── RIGHT CONTAINER ─── */}
        <div ref={rightPanelRef} style={{ width: `${100 - leftWidth}%` }} className="flex h-full min-w-0">

          {/* ─── MIDDLE PANEL: Editor + Console ─── */}
          <div style={{ width: showChatPanel ? `${100 - chatWidth}%` : '100%' }} className="flex flex-col min-w-0 overflow-hidden">

            {/* Editor Header */}
            <div className="h-10 bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-200 text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 appearance-none cursor-pointer"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="c++">C++</option>
                    <option value="java">Java</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check size={14} className="text-gray-500" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => setCode(problem.startCode?.find(sc => sc.language === language)?.initialCode || '// Write your solution here')}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Reset code"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div style={{ height: `${100 - bottomHeight}%` }} className="relative bg-white dark:bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={language === 'c++' ? 'cpp' : language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                  lineHeight: 22,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  renderLineHighlightOnlyWhenFocus: true,
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  scrollbar: { verticalScrollbarSize: 6 },
                }}
              />
            </div>

            {/* ─── VERTICAL DRAG HANDLE ─── */}
            <div
              onMouseDown={() => setIsDraggingV(true)}
              className={`h-1.5 cursor-row-resize flex justify-center items-center group hover:bg-gray-600/20 transition-colors border-t border-gray-200 dark:border-gray-800 ${isDraggingV ? 'bg-gray-600/30' : 'bg-gray-50 dark:bg-[#2d2d2d]'}`}
            >
              <div className="w-8 h-0.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-600 transition-colors" />
            </div>

            {/* ─── BOTTOM: Test Cases / Results ─── */}
            <div style={{ height: `${bottomHeight}%` }} className="flex flex-col bg-white dark:bg-[#252525] overflow-hidden">
              {/* Console Tabs */}
              <div className="h-9 flex items-center px-2 gap-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#2d2d2d] shrink-0">
                <button
                  onClick={() => { setBottomTab('testcases'); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors mx-0.5 ${
                    bottomTab === 'testcases'
                      ? 'bg-white dark:bg-[#252525] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <CheckCircle2 size={12} className="text-gray-500" /> Test Cases
                </button>
                <button
                  onClick={() => setBottomTab('results')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors mx-0.5 ${
                    bottomTab === 'results'
                      ? 'bg-white dark:bg-[#1e1e3a] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Cpu size={12} className={output?.type === 'error' ? 'text-gray-500' : 'text-gray-500'} />
                  {output?.type === 'submit' ? 'Submission Results' : 'Run Results'}
                </button>

                {/* Run & Submit */}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e3a] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Play size={12} /> Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-gray-800 hover:bg-gray-900 text-white transition-colors disabled:opacity-50"
                  >
                    {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Submit
                  </button>
                </div>
              </div>

              {/* Console Content */}
              <div className="flex-1 overflow-y-auto p-3">
              {bottomTab === 'testcases' && (
                <div className="space-y-3">
                  {/* Case tabs */}
                  <div className="flex gap-1.5">
                    {(problem.visibleTestCases || []).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCase(idx)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          activeCase === idx
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Input / Expected */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1 block">Input</label>
                      <div className="bg-gray-50 dark:bg-[#16162d] border border-gray-200 dark:border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                        {problem.visibleTestCases?.[activeCase]?.input || 'No test cases'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1 block">Expected Output</label>
                      <div className="bg-gray-50 dark:bg-[#16162d] border border-gray-200 dark:border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                        {problem.visibleTestCases?.[activeCase]?.output || 'No expected output'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bottomTab === 'results' && (
                <div>
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                      <Loader2 size={28} className="animate-spin mb-2" />
                      <span className="text-xs">Running on Judge0...</span>
                    </div>
                  ) : output ? (
                    <div className="space-y-3">
                      {output.type === 'error' && (
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-1000/10 border border-gray-300 dark:border-gray-400">
                          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <AlertCircle size={14} /> Error
                          </h3>
                          <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">{output.message}</pre>
                        </div>
                      )}

                      {output.type === 'run' && (
                        <div className="space-y-3">
                          <div className="flex gap-1.5">
                            {output.results.map((res, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveCase(idx)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                  res.status.id === 3
                                    ? 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-200'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-1000/10'
                                } ${activeCase === idx ? 'ring-1 ring-gray-300 dark:ring-gray-600' : ''}`}
                              >
                                Case {idx + 1}
                              </button>
                            ))}
                          </div>

                          {output.results[activeCase] && (
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block mb-1">Status</span>
                                <span className={`text-sm font-semibold ${output.results[activeCase].status.id === 3 ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {output.results[activeCase].status.description}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block mb-1">Output</span>
                                <div className="bg-gray-50 dark:bg-[#16162d] border border-gray-200 dark:border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                                  {output.results[activeCase].stdout || "No output"}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 block mb-1">Expected</span>
                                <div className="bg-gray-50 dark:bg-[#16162d] border border-gray-200 dark:border-gray-800 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                                  {output.results[activeCase].expected_output || "No expected output"}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {output.type === 'submit' && (
                        <div className="text-center py-6">
                          <h2 className={`text-2xl font-bold mb-3 ${output.result.status === 'accepted' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {output.result.status === 'accepted' ? '✓ Accepted' : '✗ Wrong Answer'}
                          </h2>
                          <div className="flex justify-center gap-8 mt-4">
                            {[
                              { label: 'Runtime', value: `${output.result.runtime} ms` },
                              { label: 'Memory', value: `${output.result.memory} KB` },
                              { label: 'Passed', value: `${output.result.testCasesPassed} / ${output.result.testCasesTotal}` },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <span className="block text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">{label}</span>
                                <span className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                      <Play size={28} className="mb-2 opacity-50" />
                      <span className="text-xs">Run your code to see results</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* ─── CHAT HORIZONTAL DRAG HANDLE ─── */}
          {showChatPanel && (
            <div
              onMouseDown={() => setIsDraggingChatH(true)}
              className={`w-1.5 cursor-col-resize flex flex-col items-center justify-center group hover:bg-gray-600/20 transition-colors border-x border-gray-200 dark:border-gray-800 ${isDraggingChatH ? 'bg-gray-600/30' : 'bg-gray-50 dark:bg-[#2d2d2d]'}`}
            >
              <div className="w-0.5 h-8 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-500 transition-colors" />
            </div>
          )}

          {/* ─── RIGHT PANEL: AI Chat Assistant ─── */}
          {showChatPanel && (
            <div style={{ width: `${chatWidth}%` }} className="flex flex-col min-w-0 bg-white dark:bg-[#1e1e1e] border-l border-gray-200 dark:border-gray-800 relative shadow-sm z-10">
              
              {/* Header */}
              <div className="h-10 bg-gray-50 dark:bg-[#2d2d2d] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                  <Sparkles size={16} className="text-gray-500" />
                  Agent
                </div>
                <button
                  onClick={() => setShowChatPanel(false)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                      😎
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Stuck? Agent guides you.</h3>
                    <p className="text-xs px-2">Ask questions, get hints line-by-line, and understand the logic step-by-step.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-gray-800 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-tl-sm'}`}>
                         <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:m-0 prose-pre:p-2 prose-pre:rounded-md prose-p:my-1 prose-a:text-blue-500">
                           {msg.content}
                         </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-4 bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-800">
                      <Loader2 size={16} className="text-gray-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
                <form onSubmit={handleChatSubmit} className="relative flex items-end">
                  <textarea
                    rows={1}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }
                    }}
                    placeholder="Ask Agent anything..."
                    className="w-full bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 resize-none max-h-32 shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="absolute right-2 bottom-1.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                  >
                    <SendHorizontal size={14} />
                  </button>
                </form>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                  ⇧ ↵ to insert a line break.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══════════════ AI HINT MODAL ═══════════════ */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e1e3a] rounded-2xl p-6 max-w-lg w-full mx-4 border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="text-gray-500" size={22} />
                AI Hint
              </h3>
              <button
                onClick={() => setShowHintModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {hintLoading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-3" />
                <span className="text-gray-500 dark:text-gray-400 text-sm">Generating hint...</span>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#16162d] rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-200 dark:border-gray-800">
                {hint}
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              💡 Try to solve the problem yourself first. Hints are guides, not answers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemPage;