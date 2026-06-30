import React, { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Search, Plus, TrendingUp, Clock, 
  ChevronUp, ChevronDown, MessageCircle, Share2, Tag, Loader2, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';

const CommunityPage = () => {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('newest');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: '', content: '', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', 'General', 'Interview Experience', 'Career Advice', 'Feedback', 'Problem Solving'];

  useEffect(() => {
    fetchDiscussions();
  }, [filter, category]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const url = `/problem/discussions/global?sort=${filter}${category !== 'All' ? `&category=${category}` : ''}`;
      const { data } = await axiosClient.get(url);
      setDiscussions(data);
    } catch (error) {
      console.error("Failed to fetch discussions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.content.trim()) return;
    setIsSubmitting(true);
    try {
      await axiosClient.post('/problem/discussion', {
        ...newPostData,
        isGlobal: true
      });
      setShowNewPost(false);
      setNewPostData({ title: '', content: '', category: 'General' });
      fetchDiscussions();
    } catch (e) {
      console.error("Failed to create post", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      await axiosClient.post(`/problem/discussion/${id}/upvote`);
      fetchDiscussions();
    } catch (e) {
      console.error("Upvote failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1 text-text-primary font-display">Community</h1>
            <p className="text-text-secondary font-medium max-w-xl">
              Get support, share interview insights, and connect with fellow developers.
            </p>
          </div>
          <button 
            onClick={() => setShowNewPost(true)}
            className="btn-ember px-6 py-3 flex items-center gap-2 text-sm font-semibold"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between bg-surface p-2 rounded-card border border-border-subtle sticky top-14 z-10">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setFilter('newest')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'newest' ? 'bg-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <Clock size={16} />
                  Newest
                </button>
                <button 
                  onClick={() => setFilter('popular')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'popular' ? 'bg-elevated text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <TrendingUp size={16} />
                  Popular
                </button>
              </div>

              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search threads..."
                  className="input-af pl-10 pr-4 py-2 w-64 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-ember-400 mb-4" />
                <p className="text-text-muted font-medium">Loading community feed...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="card-af p-12 text-center">
                <div className="w-20 h-20 bg-inset rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-muted">
                   <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-text-primary font-display">The forum is quiet...</h3>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">Be the one to spark the conversation. Start a discussion or share your latest achievement!</p>
                <button onClick={() => setShowNewPost(true)} className="btn-ember px-8 py-3 text-sm font-semibold">
                  Create First Post
                </button>
              </div>
            ) : (
              discussions.map((post) => (
                <div key={post._id} className="group card-af card-af-interactive p-6">
                  <div className="flex gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-0.5 p-2 bg-inset rounded-xl self-start min-w-[48px]">
                      <button 
                        onClick={() => handleUpvote(post._id)}
                        className="text-text-muted hover:text-ember-400 transition-colors p-1"
                      >
                        <ChevronUp size={20} />
                      </button>
                      <span className="text-sm font-bold text-text-primary font-mono">{post.upvotes?.length || 0}</span>
                      <button className="text-text-muted hover:text-text-secondary transition-colors p-1">
                        <ChevronDown size={20} />
                      </button>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="micro-label text-xs bg-elevated px-2 py-0.5 rounded-md">
                           {post.category}
                         </span>
                         <span className="text-xs text-text-muted flex items-center gap-1">
                           <Clock size={12} />
                           {new Date(post.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      <Link to={`/community/post/${post._id}`}>
                        <h2 className="text-lg font-bold text-text-primary group-hover:text-ember-300 transition-colors line-clamp-2 mb-2 font-display">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-text-secondary text-sm line-clamp-2 mb-4 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                         <div className="flex items-center gap-4 text-text-muted text-xs font-medium">
                            <span className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer">
                               <MessageCircle size={14} />
                               {post.replies?.length || 0} Comments
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer">
                               <Share2 size={14} />
                               Share
                            </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-ember-600 flex items-center justify-center text-[10px] font-bold text-text-primary">
                               {post.userId?.firstName?.[0] || 'A'}
                            </div>
                            <span className="text-xs font-medium text-text-secondary">
                               {post.userId?.firstName || 'Anonymous'}
                            </span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Categories */}
            <div className="card-af">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-primary font-display">
                <Tag size={18} className="text-ember-400" />
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${category === cat ? 'bg-elevated text-ember-400 border-l-2 border-ember-400' : 'text-text-secondary hover:bg-elevated hover:text-text-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="card-af !bg-elevated overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-ember-400/5 rounded-full -mr-10 -mt-10 blur-2xl" />
               <h3 className="text-text-primary text-lg font-bold mb-4 relative z-10 font-display">Trending Now</h3>
               <div className="space-y-3 relative z-10">
                  <p className="text-text-muted text-xs leading-relaxed">
                    Join the most active discussions of the week.
                  </p>
                  <div className="space-y-3 pt-2">
                     <div className="h-px bg-border-subtle" />
                     <p className="text-text-secondary text-xs font-medium truncate">Meta Interview Experience 2024</p>
                     <p className="text-text-secondary text-xs font-medium truncate">Tips for Hard DP problems</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewPost(false)} />
          <div className="relative bg-surface w-full max-w-2xl rounded-card shadow-2xl shadow-black/30 overflow-hidden border border-border-subtle animate-fade-in-up">
             <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-text-primary font-display">Create New Discussion</h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                   <div>
                      <label className="micro-label mb-1.5 block">Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="What's on your mind?"
                        className="input-af"
                        value={newPostData.title}
                        onChange={(e) => setNewPostData({...newPostData, title: e.target.value})}
                      />
                   </div>
                   <div>
                     <label className="micro-label mb-1.5 block">Category</label>
                     <select 
                       className="input-af"
                       value={newPostData.category}
                       onChange={(e) => setNewPostData({...newPostData, category: e.target.value})}
                     >
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                   <div>
                      <label className="micro-label mb-1.5 block">Content</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder="Write your discussion details here..."
                        className="input-af resize-none"
                        value={newPostData.content}
                        onChange={(e) => setNewPostData({...newPostData, content: e.target.value})}
                      />
                   </div>
                   <div className="flex items-center justify-end gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowNewPost(false)}
                        className="btn-ghost-af px-6 py-2.5 text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-ember px-8 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Post Discussion
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
