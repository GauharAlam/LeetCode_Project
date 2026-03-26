import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Plus, Trash2, Edit, AlertCircle, Loader2 } from 'lucide-react';

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
      setProblems(data);
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
      // Remove from local state to update UI immediately
      setProblems(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete problem");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage coding problems and system settings</p>
          </div>
          {activeTab === 'problems' ? (
            <Link to="/admin/create" className="btn btn-primary gap-2">
              <Plus size={20} /> Create Problem
            </Link>
          ) : (
            <Link to="/admin/contest/create" className="btn bg-gray-700 hover:bg-gray-800 text-white border-none gap-2">
              <Plus size={20} /> Create Contest
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-lg w-fit mb-6">
          <button 
            className={`tab px-6 transition-all ${activeTab === 'problems' ? 'tab-active bg-white dark:bg-gray-700 font-bold shadow-sm' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            Problems
          </button>
          <button 
            className={`tab px-6 transition-all ${activeTab === 'contests' ? 'tab-active bg-white dark:bg-gray-700 font-bold shadow-sm' : ''}`}
            onClick={() => setActiveTab('contests')}
          >
            Contests
          </button>
        </div>

        {/* Stats & Content */}
        {activeTab === 'problems' ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden mb-8">
          <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="badge badge-primary">{problems.length}</span> Total Problems
            </h2>
          </div>

          {/* Problem List Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-gray-600 dark:text-gray-400 bg-gray-100/30 dark:bg-gray-800/30">
                  <th className="w-1/3">Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10"><span className="loading loading-dots loading-lg text-primary"></span></td></tr>
                ) : problems.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-gray-500">No problems found. Create one!</td></tr>
                ) : problems.map((prob) => (
                  <tr key={prob._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="font-medium text-gray-900 dark:text-white text-lg">{prob.title}</td>
                    <td>
                      <div className={`badge ${
                        prob.difficulty === 'hard' ? 'badge-error' : 
                        prob.difficulty === 'medium' ? 'badge-warning' : 'badge-success'
                      } badge-outline font-bold`}>
                        {prob.difficulty.toUpperCase()}
                      </div>
                    </td>
                    <td className="text-gray-600 dark:text-gray-400 text-sm">
                        <div className="flex flex-wrap gap-1">
                            {prob.tags.slice(0, 3).map(tag => <span key={tag} className="badge badge-ghost badge-sm">{tag}</span>)}
                        </div>
                    </td>
                    <td className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/edit/${prob._id}`)}
                        className="btn btn-sm btn-ghost text-gray-400 hover:bg-gray-200 dark:bg-neutral-800"
                        title="Edit Problem"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prob._id)}
                        className="btn btn-sm btn-ghost text-gray-400 hover:bg-gray-200"
                        title="Delete Problem"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden mb-8">
            <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="badge bg-gray-700 text-white border-none">{contests.length}</span> Total Contests
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-gray-600 dark:text-gray-400 bg-gray-100/30 dark:bg-gray-800/30">
                    <th className="w-1/3">Title</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Participants</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10"><span className="loading loading-dots loading-lg text-primary"></span></td></tr>
                  ) : contests.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No contests found. Create one!</td></tr>
                  ) : contests.map((contest) => (
                    <tr key={contest._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="font-medium text-gray-900 dark:text-white text-lg">{contest.title}</td>
                      <td>
                        <div className={`badge ${
                          contest.status === 'live' ? 'badge-error' : 
                          contest.status === 'upcoming' ? 'badge-warning' : 'badge-ghost'
                        } badge-outline font-bold uppercase`}>
                          {contest.status}
                        </div>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(contest.startTime).toLocaleDateString()}
                      </td>
                      <td className="text-gray-600 dark:text-gray-400 text-sm">
                        {contest.participants?.length || 0}
                      </td>
                      <td className="flex justify-end gap-2">
                        <button className="btn btn-sm btn-ghost text-gray-400 cursor-not-allowed" title="Editing disabled for now">
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