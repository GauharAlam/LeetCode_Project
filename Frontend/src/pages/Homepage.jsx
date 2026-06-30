import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Search, CheckCircle2, Filter, ArrowUpDown, X, ListFilter, ChevronLeft, ChevronRight, Building2, Tag } from 'lucide-react';
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
    problems.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  const processedProblems = useMemo(() => {
    let result = [...problems];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)));
    }
    if (difficultyFilter !== 'All') result = result.filter(p => p.difficulty === difficultyFilter);
    if (selectedTags.length > 0) result = result.filter(p => selectedTags.every(tag => p.tags?.includes(tag)));
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

  const getDifficultyBadge = (diff) => {
    const classes = {
      easy: 'badge-easy',
      medium: 'badge-medium',
      hard: 'badge-hard',
    };
    return classes[diff] || '';
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
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DailyChallenge />

        {/* Controls Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted group-focus-within:text-ember-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search problems or tags..."
              className="input-af pl-10 pr-3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* Difficulty Tabs */}
            <div className="bg-surface p-1 rounded-control border border-border-subtle flex items-center">
              {['All', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${difficultyFilter === diff
                      ? 'bg-elevated text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
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
                className={`flex items-center gap-2 px-3 py-2 rounded-control border transition-all text-sm ${selectedCompany !== 'All'
                    ? 'bg-elevated border-border-default text-text-primary'
                    : 'bg-surface border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary'
                  }`}
              >
                <Building2 size={16} />
                <span className="font-medium hidden sm:inline">
                  {selectedCompany === 'All' ? 'Company' : selectedCompany.charAt(0).toUpperCase() + selectedCompany.slice(1)}
                </span>
              </button>

              {showCompanyMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-subtle rounded-card shadow-xl shadow-black/20 z-50 overflow-hidden max-h-72 overflow-y-auto animate-fade-in-up">
                  <div className="p-1">
                    {companies.map(company => (
                      <button
                        key={company}
                        onClick={() => { setSelectedCompany(company); setShowCompanyMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCompany === company
                            ? 'bg-elevated text-text-primary'
                            : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
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
                className={`flex items-center gap-2 px-3 py-2 rounded-control border transition-all text-sm ${sortConfig
                    ? 'bg-elevated border-border-default text-text-primary'
                    : 'bg-surface border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary'
                  }`}
              >
                <ArrowUpDown size={16} />
                <span className="font-medium hidden sm:inline">Sort</span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-subtle rounded-card shadow-xl shadow-black/20 z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-1">
                    <button onClick={() => handleSort('difficulty')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:bg-elevated hover:text-text-primary rounded-lg transition-colors">
                      <span>Difficulty</span>
                      {sortConfig?.key === 'difficulty' && <span className="text-xs text-text-muted">{sortConfig.direction === 'asc' ? 'Easy→Hard' : 'Hard→Easy'}</span>}
                    </button>
                    <button onClick={() => handleSort('title')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:bg-elevated hover:text-text-primary rounded-lg transition-colors">
                      <span>Title</span>
                      {sortConfig?.key === 'title' && <span className="text-xs text-text-muted">{sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'}</span>}
                    </button>
                    {sortConfig && (
                      <>
                        <div className="h-px bg-border-subtle my-1 mx-2" />
                        <button onClick={() => { setSortConfig(null); setShowSortMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-text-muted hover:bg-elevated rounded-lg transition-colors flex items-center gap-2">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-control border transition-all text-sm ${selectedTags.length > 0
                    ? 'bg-elevated border-border-default text-text-primary'
                    : 'bg-surface border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary'
                  }`}
              >
                <ListFilter size={16} />
                <span className="font-medium hidden sm:inline">Tags</span>
                {selectedTags.length > 0 && (
                  <span className="bg-ember-400 text-canvas text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold">
                    {selectedTags.length}
                  </span>
                )}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-surface border border-border-subtle rounded-card shadow-xl shadow-black/20 z-50 p-3 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="micro-label">Filter by Tags</span>
                    {selectedTags.length > 0 && (
                      <button onClick={() => setSelectedTags([])} className="text-xs text-ember-400 hover:text-ember-300 transition-colors">Clear All</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-chip transition-all ${selectedTags.includes(tag)
                            ? '!bg-ember-400/15 !border-ember-400/30 !text-ember-300'
                            : ''
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {uniqueTags.length === 0 && <span className="text-sm text-text-muted italic w-full text-center py-2">No tags found</span>}
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
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-ember-400/10 text-ember-300 border border-ember-400/20">
                <Tag size={12} />
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:text-hard transition-colors"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Problems Table */}
        <div className="overflow-hidden rounded-card border border-border-subtle bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-af">
              <thead>
                <tr className="bg-elevated/50">
                  <th className="w-16 text-center">Status</th>
                  <th>Title</th>
                  <th className="w-32">Difficulty</th>
                  <th>Tags</th>
                  <th className="w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="loading loading-spinner loading-lg text-ember-400"></span>
                        <span className="text-text-muted text-sm">Loading problems...</span>
                      </div>
                    </td>
                  </tr>
                ) : processedProblems.length > 0 ? (
                  processedProblems.map((prob) => (
                    <tr
                      key={prob._id}
                      className="group"
                    >
                      <td className="text-center">
                        {isSolved(prob._id) ? (
                          <CheckCircle2 className="inline-block w-5 h-5 text-ember-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-border-default inline-block group-hover:border-text-muted transition-colors" />
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/problem/${prob._id}`)}
                          className="text-text-primary font-medium hover:text-ember-300 transition-colors text-base text-left"
                        >
                          {prob.title}
                        </button>
                      </td>
                      <td>
                        <span className={getDifficultyBadge(prob.difficulty)}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          {prob.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="tag-chip">
                              {tag}
                            </span>
                          ))}
                          {prob.tags?.length > 3 && (
                            <span className="text-xs text-text-muted self-center font-mono">+{prob.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/problem/${prob._id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-all btn-ember px-4 py-1.5 text-xs"
                        >
                          Solve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter className="w-8 h-8 opacity-20" />
                        <p>No problems match your filters.</p>
                        <button
                          onClick={() => { setSearch(''); setDifficultyFilter('All'); setSelectedTags([]); setSelectedCompany('All'); setSortConfig(null); }}
                          className="text-ember-400 hover:text-ember-300 text-sm mt-2 transition-colors"
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
            <span className="text-sm text-text-muted font-mono">
              Page {currentPage} of {totalPages} ({totalProblems} problems)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-text-muted hover:bg-elevated hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium font-mono transition-all ${currentPage === page
                      ? 'bg-ember-400 text-canvas'
                      : 'text-text-muted hover:bg-elevated hover:text-text-primary'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-text-muted hover:bg-elevated hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {!loading && totalPages <= 1 && (
          <div className="mt-4 text-xs text-text-muted text-right font-mono">
            Showing {processedProblems.length} of {totalProblems} problems
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;