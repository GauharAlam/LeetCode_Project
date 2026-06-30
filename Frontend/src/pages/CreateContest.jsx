import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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
      setProblems(data.problems || data || []);
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

  const getDifficultyBadge = (diff) => {
    const classes = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
    return classes[diff] || '';
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-4">
          <button 
            onClick={() => navigate('/admin')}
            className="btn-ghost-af p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-display text-text-primary">Create New Contest</h1>
            <p className="text-text-secondary text-sm mt-1">Configure competition details and select challenging problems.</p>
          </div>
        </div>

        <div className="card-af p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-4 border-b border-border-subtle">
              <button 
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-secondary-af px-5 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="btn-ember px-5 py-2.5 text-sm flex items-center gap-2 font-semibold disabled:opacity-50"
              >
                {loading ? <span className="loading loading-spinner text-canvas"></span> : <Save size={18} />}
                Create Contest
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contest Title */}
              <div className="md:col-span-2">
                <label className="micro-label block mb-1.5">Contest Title</label>
                <input 
                  {...register("title", { required: "Title is required" })}
                  className="input-af text-sm" 
                  placeholder="e.g. Weekly Coding Challenge #1" 
                />
                {errors.title && <span className="text-hard text-xs mt-1 block font-mono">{errors.title.message}</span>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="micro-label block mb-1.5">Description</label>
                <textarea 
                  {...register("description")}
                  className="input-af text-sm h-24 resize-none" 
                  placeholder="Describe the rules or theme..."
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="micro-label block mb-1.5">Start Time</label>
                <input 
                  type="datetime-local"
                  {...register("startTime", { required: "Start time is required" })}
                  className="input-af text-sm" 
                />
                {errors.startTime && <span className="text-hard text-xs mt-1 block font-mono">{errors.startTime.message}</span>}
              </div>

              {/* End Time */}
              <div>
                <label className="micro-label block mb-1.5">End Time</label>
                <input 
                  type="datetime-local"
                  {...register("endTime", { required: "End time is required" })}
                  className="input-af text-sm" 
                />
                {errors.endTime && <span className="text-hard text-xs mt-1 block font-mono">{errors.endTime.message}</span>}
              </div>

              {/* Duration */}
              <div>
                <label className="micro-label block mb-1.5">Duration (minutes)</label>
                <input 
                  type="number"
                  min="1"
                  {...register("duration", { required: "Duration is required", min: 1 })}
                  className="input-af text-sm" 
                  placeholder="120"
                />
                {errors.duration && <span className="text-hard text-xs mt-1 block font-mono">{errors.duration.message}</span>}
              </div>
            </div>

            {/* Problem Selection */}
            <div className="pt-6 border-t border-border-subtle mt-8">
              <h3 className="text-xl font-bold font-display text-text-primary mb-4">
                Select Problems for this Contest 
                <span className="text-sm font-normal text-text-muted font-mono ml-2">({selectedProblems.length} selected)</span>
              </h3>
              
              <div className="bg-inset rounded-control p-3 max-h-96 overflow-y-auto border border-border-subtle">
                {fetchLoading ? (
                  <div className="flex justify-center p-8"><span className="loading loading-spinner text-ember-400"></span></div>
                ) : problems.length === 0 ? (
                  <p className="text-center p-4 text-text-muted italic">No problems available. Please create some problems first.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {problems.map((prob) => (
                      <label 
                        key={prob._id} 
                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors border ${
                          selectedProblems.includes(prob._id) 
                            ? 'bg-elevated border-border-default' 
                            : 'bg-surface border-border-subtle hover:border-border-default'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-ember-400 focus:ring-ember-400 border-border-subtle bg-canvas"
                          checked={selectedProblems.includes(prob._id)}
                          onChange={() => toggleProblemSelection(prob._id)}
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-semibold text-text-primary text-sm">{prob.title}</span>
                          <span className={getDifficultyBadge(prob.difficulty)}>
                            {prob.difficulty}
                          </span>
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
