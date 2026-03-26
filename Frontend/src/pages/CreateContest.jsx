import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';

const CreateContest = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const toggleProblemSelection = (probId) => {
    if (selectedProblems.includes(probId)) {
      setSelectedProblems(prev => prev.filter(id => id !== probId));
    } else {
      setSelectedProblems(prev => [...prev, probId]);
    }
  };

  const onSubmit = async (data) => {
    if (selectedProblems.length === 0) {
      alert("Please select at least one problem for the contest.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        duration: Number(data.duration),
        problems: selectedProblems
      };

      await axiosClient.post('/problem/contest', payload);
      alert("Contest created successfully!");
      navigate('/admin');
    } catch (error) {
      console.error("Failed to create contest", error);
      alert(error.response?.data?.message || "Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-circle btn-ghost text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Contest</h1>
            <p className="text-gray-500 mt-1">Configure competition details and select challenging problems.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => navigate('/admin')}
                className="btn btn-ghost border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="btn bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 border-none gap-2"
              >
                {loading ? <span className="loading loading-spinner"></span> : <Save size={18} />}
                Create Contest
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contest Title */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Contest Title</span>
                </label>
                <input 
                  {...register("title", { required: "Title is required" })}
                  className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-500" 
                  placeholder="e.g. Weekly Weekly Coding Challenge #1" 
                />
                {errors.title && <span className="text-gray-400 text-sm mt-1">{errors.title.message}</span>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Description</span>
                </label>
                <textarea 
                  {...register("description")}
                  className="textarea textarea-bordered w-full h-24 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-500" 
                  placeholder="Describe the rules or theme..."
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Start Time</span>
                </label>
                <input 
                  type="datetime-local"
                  {...register("startTime", { required: "Start time is required" })}
                  className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-gray-400" 
                />
                {errors.startTime && <span className="text-gray-400 text-sm mt-1">{errors.startTime.message}</span>}
              </div>

              {/* End Time */}
              <div>
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">End Time</span>
                </label>
                <input 
                  type="datetime-local"
                  {...register("endTime", { required: "End time is required" })}
                  className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-gray-400" 
                />
                {errors.endTime && <span className="text-gray-400 text-sm mt-1">{errors.endTime.message}</span>}
              </div>

              {/* Duration */}
              <div>
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Duration (minutes)</span>
                </label>
                <input 
                  type="number"
                  min="1"
                  {...register("duration", { required: "Duration is required", min: 1 })}
                  className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-gray-400" 
                  placeholder="120"
                />
                {errors.duration && <span className="text-gray-400 text-sm mt-1">{errors.duration.message}</span>}
              </div>
            </div>

            {/* Problem Selection */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Problems for this Contest <span className="text-sm font-normal text-gray-500">({selectedProblems.length} selected)</span></h3>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
                {fetchLoading ? (
                  <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary"></span></div>
                ) : problems.length === 0 ? (
                  <p className="text-center p-4 text-gray-500">No problems available. Please create some problems first.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {problems.map((prob) => (
                      <label 
                        key={prob._id} 
                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors border ${
                          selectedProblems.includes(prob._id) 
                            ? 'bg-gray-100 border-gray-400 dark:bg-neutral-800 dark:border-neutral-600' 
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary checkbox-sm border-gray-400 dark:border-gray-500"
                          checked={selectedProblems.includes(prob._id)}
                          onChange={() => toggleProblemSelection(prob._id)}
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">{prob.title}</span>
                          <div className={`badge badge-sm uppercase font-bold ${
                            prob.difficulty === 'hard' ? 'badge-error' : 
                            prob.difficulty === 'medium' ? 'badge-warning' : 'badge-success'
                          } badge-outline`}>
                            {prob.difficulty}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateContest;
