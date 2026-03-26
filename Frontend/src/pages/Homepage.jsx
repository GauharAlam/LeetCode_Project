import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Search, CheckCircle2, Filter, ArrowUpDown, X, ListFilter, ChevronDown, Tag, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import DailyChallenge from '../components/DailyChallenge';

const Homepage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(0);

  // Filter & Sort States
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [sortConfig, setSortConfig] = useState(null);

  // UI States
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const companies = ['All', 'google', 'amazon', 'meta', 'microsoft', 'apple', 'netflix', 'uber', 'airbnb', 'linkedin', 'twitter', 'spotify', 'oracle', 'salesforce', 'adobe', 'nvidia', 'stripe', 'coinbase', 'other'];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tagFromUrl = queryParams.get('tag');
    if (tagFromUrl && !selectedTags.includes(tagFromUrl)) {
      setSelectedTags(prev => [...prev, tagFromUrl]);
    }
  }, [location.search]);

  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const companyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowSortMenu(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
      if (companyRef.current && !companyRef.current.contains(event.target)) setShowCompanyMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(`/problem/getAllProblem?page=${currentPage}&limit=20`);
        setProblems(data.problems || data);
        setTotalPages(data.totalPages || 1);
        setTotalProblems(data.total || (data.problems || data).length);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [currentPage]);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    problems.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  const processedProblems = useMemo(() => {
    let result = [...problems];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (difficultyFilter !== 'All') result = result.filter(p => p.difficulty === difficultyFilter);
    if (selectedTags.length > 0) result = result.filter(p => selectedTags.every(tag => p.tags.includes(tag)));
    if (selectedCompany !== 'All') result = result.filter(p => p.companies?.includes(selectedCompany));
    if (sortConfig) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key], valB = b[sortConfig.key];
        if (sortConfig.key === 'difficulty') { const m = { easy: 1, medium: 2, hard: 3 }; valA = m[valA]; valB = m[valB]; }
        else if (sortConfig.key === 'title') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [problems, search, difficultyFilter, selectedTags, selectedCompany, sortConfig]);

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const handleSort = (key) => { setSortConfig(c => c?.key === key ? { key, direction: c.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }); setShowSortMenu(false); };
  const isSolved = (problemId) => user?.problemSolved?.includes(problemId);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'hard': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-300 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DailyChallenge />

        {/* Controls Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search problems or tags..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#161b22] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* Difficulty Tabs */}
            <div className="bg-gray-100 dark:bg-[#161b22] p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
              {['All', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${difficultyFilter === diff
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>

            {/* Company Filter */}
            <div className="relative" ref={companyRef}>
              <button
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${selectedCompany !== 'All'
                    ? 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400'
                    : 'bg-gray-50 dark:bg-[#161b22] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <Building2 size={18} />
                <span className="text-sm font-medium hidden sm:inline">
                  {selectedCompany === 'All' ? 'Company' : selectedCompany.charAt(0).toUpperCase() + selectedCompany.slice(1)}
                </span>
              </button>

              {showCompanyMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e232a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                  <div className="p-1">
                    {companies.map(company => (
                      <button
                        key={company}
                        onClick={() => { setSelectedCompany(company); setShowCompanyMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCompany === company
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                          }`}
                      >
                        {company === 'All' ? 'All Companies' : company.charAt(0).toUpperCase() + company.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${sortConfig
                    ? 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400'
                    : 'bg-gray-50 dark:bg-[#161b22] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <ArrowUpDown size={18} />
                <span className="text-sm font-medium hidden sm:inline">Sort</span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e232a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-1">
                    <button onClick={() => handleSort('difficulty')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                      <span>Difficulty</span>
                      {sortConfig?.key === 'difficulty' && <span className="text-xs opacity-70">{sortConfig.direction === 'asc' ? 'Easy→Hard' : 'Hard→Easy'}</span>}
                    </button>
                    <button onClick={() => handleSort('title')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
                      <span>Title</span>
                      {sortConfig?.key === 'title' && <span className="text-xs opacity-70">{sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'}</span>}
                    </button>
                    {sortConfig && (
                      <>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2" />
                        <button onClick={() => { setSortConfig(null); setShowSortMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
                          <X size={14} /> Reset Sort
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tags Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${selectedTags.length > 0
                    ? 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400'
                    : 'bg-gray-50 dark:bg-[#161b22] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <ListFilter size={18} />
                <span className="text-sm font-medium hidden sm:inline">Tags</span>
                {selectedTags.length > 0 && (
                  <span className="bg-gray-900 dark:bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {selectedTags.length}
                  </span>
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1e232a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-3">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filter by Tags</span>
                    {selectedTags.length > 0 && (
                      <button onClick={() => setSelectedTags([])} className="text-xs text-gray-400 hover:underline">Clear All</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-all ${selectedTags.includes(tag)
                            ? 'bg-gray-900 dark:bg-gray-800 border-gray-700 dark:border-gray-400 text-white shadow-sm'
                            : 'bg-gray-50 dark:bg-[#161b22] border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
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
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600/50">
                <Tag size={12} />
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Problems Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117]/50 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="px-6 py-4 font-medium w-16 text-center">Status</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium w-32">Difficulty</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="loading loading-spinner loading-lg text-gray-400"></span>
                        <span className="text-gray-500 text-sm">Loading problems...</span>
                      </div>
                    </td>
                  </tr>
                ) : processedProblems.length > 0 ? (
                  processedProblems.map((prob, index) => (
                    <tr
                      key={prob._id}
                      className="group transition-colors hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                    >
                      <td className="px-6 py-4 text-center">
                        {isSolved(prob._id) ? (
                          <CheckCircle2 className="inline-block w-5 h-5 text-emerald-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700 inline-block group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/problem/${prob._id}`)}
                          className="text-gray-900 dark:text-gray-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base text-left"
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
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                              {tag}
                            </span>
                          ))}
                          {prob.tags.length > 3 && (
                            <span className="text-xs text-gray-400 self-center">+{prob.tags.length - 3}</span>
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
                          onClick={() => { setSearch(''); setDifficultyFilter('All'); setSelectedTags([]); setSelectedCompany('All'); setSortConfig(null); }}
                          className="text-blue-500 hover:underline text-sm mt-2"
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

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({totalProblems} problems)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${currentPage === page
                      ? 'bg-gray-900 dark:bg-gray-700 text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {!loading && totalPages <= 1 && (
          <div className="mt-4 text-xs text-gray-500 text-right">
            Showing {processedProblems.length} of {totalProblems} problems
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;