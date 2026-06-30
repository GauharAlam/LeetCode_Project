import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [activeTab, setActiveTab] = useState('problems');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
    fetchContests();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data.problems || data || []);
    } catch (error) {
      console.error("Error fetching problems", error);
    } finally {
      if (activeTab === 'problems') setLoading(false);
    }
  };

  const fetchContests = async () => {
    try {
      const { data } = await axiosClient.get('/problem/contests');
      setContests(data);
    } catch (error) {
      console.error("Error fetching contests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete problem");
    }
  };

  const getDifficultyBadge = (diff) => {
    const classes = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
    return classes[diff] || '';
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-border-subtle pb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-display">Admin Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage coding problems and system settings</p>
          </div>
          {activeTab === 'problems' ? (
            <Link to="/admin/create" className="btn-ember px-5 py-2.5 text-sm flex items-center gap-2">
              <Plus size={18} /> Create Problem
            </Link>
          ) : (
            <Link to="/admin/contest/create" className="btn-secondary-af px-5 py-2.5 text-sm flex items-center gap-2">
              <Plus size={18} /> Create Contest
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-surface p-1 rounded-control border border-border-subtle w-fit mb-6 flex">
          <button 
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'problems' ? 'bg-elevated text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('problems')}
          >
            Problems
          </button>
          <button 
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'contests' ? 'bg-elevated text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('contests')}
          >
            Contests
          </button>
        </div>

        {/* Content */}
        {activeTab === 'problems' ? (
        <div className="card-af p-0 overflow-hidden">
          <div className="p-4 bg-elevated/50 border-b border-border-subtle">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-text-primary font-display">
              <span className="bg-ember-400 text-canvas text-xs font-bold font-mono px-2 py-0.5 rounded-full">{problems.length}</span> Total Problems
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-af">
              <thead>
                <tr>
                  <th className="w-1/3">Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10"><span className="loading loading-spinner loading-lg text-ember-400"></span></td></tr>
                ) : problems.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-text-muted">No problems found. Create one!</td></tr>
                ) : problems.map((prob) => (
                  <tr key={prob._id}>
                    <td className="font-medium text-text-primary text-base">{prob.title}</td>
                    <td>
                      <span className={getDifficultyBadge(prob.difficulty)}>
                        {prob.difficulty?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                        <div className="flex flex-wrap gap-1.5">
                            {prob.tags?.slice(0, 3).map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                        </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/edit/${prob._id}`)}
                          className="btn-ghost-af p-2 rounded-lg hover:!bg-steel-500/10 hover:!text-steel-300 transition-colors"
                          title="Edit Problem"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(prob._id)}
                          className="btn-ghost-af p-2 rounded-lg hover:!bg-hard/10 hover:!text-hard transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="card-af p-0 overflow-hidden">
            <div className="p-4 bg-elevated/50 border-b border-border-subtle">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-text-primary font-display">
                <span className="bg-text-secondary text-canvas text-xs font-bold font-mono px-2 py-0.5 rounded-full">{contests.length}</span> Total Contests
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-af">
                <thead>
                  <tr>
                    <th className="w-1/3">Title</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Participants</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10"><span className="loading loading-spinner loading-lg text-ember-400"></span></td></tr>
                  ) : contests.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-text-muted">No contests found. Create one!</td></tr>
                  ) : contests.map((contest) => (
                    <tr key={contest._id}>
                      <td className="font-medium text-text-primary text-base">{contest.title}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 ${
                          contest.status === 'live' ? 'badge-live' : 
                          contest.status === 'upcoming' ? 'badge-steel' : 'text-text-muted bg-elevated border border-border-subtle rounded-full text-xs px-2.5 py-0.5'
                        } font-mono`}>
                          {contest.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />}
                          {contest.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-text-secondary text-sm font-mono">
                        {new Date(contest.startTime).toLocaleDateString()}
                      </td>
                      <td className="text-text-secondary text-sm font-mono">
                        {contest.participants?.length || 0}
                      </td>
                      <td className="flex justify-end gap-2">
                        <button className="btn-ghost-af p-2 rounded-lg hover:!bg-steel-500/10 hover:!text-steel-300 cursor-not-allowed opacity-50" title="Editing disabled for now">
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;