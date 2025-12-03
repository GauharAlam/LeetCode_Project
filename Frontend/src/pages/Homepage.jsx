import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Search, CheckCircle2, Filter, ArrowUpDown, X, ListFilter, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';

const Homepage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // --- Filter & Sort States ---
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortConfig, setSortConfig] = useState(null); // { key: 'title'|'difficulty', direction: 'asc'|'desc' }

  // --- UI States ---
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Refs for click outside
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // 1. Extract Unique Tags dynamically from fetched problems
  const uniqueTags = useMemo(() => {
    const tags = new Set();
    problems.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  // 2. Main Logic: Filter -> Search -> Sort
  const processedProblems = useMemo(() => {
    let result = [...problems];

    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Difficulty Filter
    if (difficultyFilter !== 'All') {
      result = result.filter(p => p.difficulty === difficultyFilter);
    }

    // Tags Filter (Problem must have ALL selected tags)
    if (selectedTags.length > 0) {
      result = result.filter(p => 
        selectedTags.every(tag => p.tags.includes(tag))
      );
    }

    // Sorting Logic
    if (sortConfig) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Custom sort for difficulty string
        if (sortConfig.key === 'difficulty') {
          const diffMap = { easy: 1, medium: 2, hard: 3 };
          valA = diffMap[valA];
          valB = diffMap[valB];
        } else if (sortConfig.key === 'title') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [problems, search, difficultyFilter, selectedTags, sortConfig]);

  // Helper Functions
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSort = (key) => {
    setSortConfig(current => {
      if (current?.key === key) {
        // Toggle direction if same key
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Default to ascending for new key
      return { key, direction: 'asc' };
    });
    setShowSortMenu(false);
  };

  const isSolved = (problemId) => user?.problemSolved?.includes(problemId);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* --- Controls Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search problems or tags..." 
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg bg-[#161b22] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Quick Difficulty Tabs */}
            <div className="bg-[#161b22] p-1 rounded-lg border border-gray-700 flex items-center">
              {['All', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    difficultyFilter === diff 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                  sortConfig 
                    ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                    : 'bg-[#161b22] border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                <ArrowUpDown size={18} />
                <span className="text-sm font-medium hidden sm:inline">Sort</span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e232a] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1">
                    <button 
                      onClick={() => handleSort('difficulty')}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Difficulty</span>
                      {sortConfig?.key === 'difficulty' && (
                        <span className="text-xs opacity-70">{sortConfig.direction === 'asc' ? 'Easy→Hard' : 'Hard→Easy'}</span>
                      )}
                    </button>
                    <button 
                      onClick={() => handleSort('title')}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                    >
                      <span>Title</span>
                      {sortConfig?.key === 'title' && (
                        <span className="text-xs opacity-70">{sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'}</span>
                      )}
                    </button>
                    {sortConfig && (
                      <>
                        <div className="h-px bg-gray-700 my-1 mx-2" />
                        <button 
                          onClick={() => { setSortConfig(null); setShowSortMenu(false); }}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X size={14} /> Reset Sort
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tags Filter Dropdown */}
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                  selectedTags.length > 0
                    ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                    : 'bg-[#161b22] border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                <ListFilter size={18} />
                <span className="text-sm font-medium hidden sm:inline">Tags</span>
                {selectedTags.length > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {selectedTags.length}
                  </span>
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#1e232a] border border-gray-700 rounded-xl shadow-xl z-50 p-3">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by Tags</span>
                    {selectedTags.length > 0 && (
                      <button 
                        onClick={() => setSelectedTags([])}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : 'bg-[#161b22] border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {uniqueTags.length === 0 && <span className="text-sm text-gray-500 italic w-full text-center py-2">No tags found</span>}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Selected Tags Pills */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
                <Tag size={12} />
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-white transition-colors"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}

        {/* --- Problems Table --- */}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#161b22] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0d1117]/50 text-gray-400 text-sm">
                  <th className="px-6 py-4 font-medium w-16 text-center">Status</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium w-32">Difficulty</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="loading loading-spinner loading-lg text-blue-500"></span>
                        <span className="text-gray-500 text-sm">Loading problems...</span>
                      </div>
                    </td>
                  </tr>
                ) : processedProblems.length > 0 ? (
                  processedProblems.map((prob, index) => (
                    <tr 
                      key={prob._id} 
                      className={`group transition-colors hover:bg-[#1c2128] ${index % 2 === 0 ? 'bg-[#161b22]' : 'bg-[#161b22]/50'}`}
                    >
                      <td className="px-6 py-4 text-center">
                        {isSolved(prob._id) ? (
                          <CheckCircle2 className="inline-block w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-700 inline-block group-hover:border-gray-500 transition-colors" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => navigate(`/problem/${prob._id}`)}
                          className="text-gray-200 font-medium hover:text-blue-400 transition-colors text-base text-left"
                        >
                          {prob.title}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(prob.difficulty)} uppercase tracking-wide`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {prob.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                              {tag}
                            </span>
                          ))}
                          {prob.tags.length > 3 && (
                            <span className="text-xs text-gray-500 self-center">+{prob.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/problem/${prob._id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-sm btn-outline btn-info h-8 min-h-0 font-normal"
                        >
                          Solve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter className="w-8 h-8 opacity-20" />
                        <p>No problems match your filters.</p>
                        <button 
                          onClick={() => {
                            setSearch('');
                            setDifficultyFilter('All');
                            setSelectedTags([]);
                            setSortConfig(null);
                          }}
                          className="text-blue-400 hover:underline text-sm mt-2"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {!loading && (
          <div className="mt-4 text-xs text-gray-500 text-right">
            Showing {processedProblems.length} of {problems.length} problems
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;