import React, { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
  MessageSquare, Search, Filter, Plus, TrendingUp, Clock, 
  ChevronUp, MessageCircle, Share2, Tag, Loader2, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-3">Community</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl">
              Get support, share interview insights, and connect with fellow developers across the globe.
            </p>
          </div>
          <button 
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm sticky top-20 z-10 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setFilter('newest')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'newest' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Clock size={16} />
                  Newest
                </button>
                <button 
                  onClick={() => setFilter('popular')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'popular' ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <TrendingUp size={16} />
                  Popular
                </button>
              </div>

              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search threads..."
                  className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-800 w-64 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Loading community feed...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-neutral-800 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-950 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                   <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">The forum is quiet...</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Be the one to spark the conversation. Start a discussion or share your latest achievement!</p>
                <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold">
                  Create First Post
                </button>
              </div>
            ) : (
              discussions.map((post) => (
                <div key={post._id} className="group bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 hover:shadow-xl hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-300">
                  <div className="flex gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-1 px-2 py-3 bg-gray-50 dark:bg-neutral-950 rounded-2xl self-start min-w-[48px]">
                      <button 
                        onClick={() => handleUpvote(post._id)}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <ChevronUp size={24} />
                      </button>
                      <span className="text-sm font-black">{post.upvotes?.length || 0}</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                           {post.category}
                         </span>
                         <span className="text-xs text-gray-400 flex items-center gap-1">
                           <Clock size={12} />
                           {new Date(post.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      <Link to={`/community/post/${post._id}`}>
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800">
                         <div className="flex items-center gap-4 text-gray-400 text-xs font-bold">
                            <span className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                               <MessageCircle size={16} />
                               {post.replies?.length || 0} Comments
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                               <Share2 size={16} />
                               Share
                            </span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold">
                               {post.userId?.firstName?.[0] || 'A'}
                            </div>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
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
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <Tag size={18} />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${category === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-gray-900 dark:bg-white rounded-3xl p-6 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 dark:bg-gray-100 rounded-full -mr-10 -mt-10 opacity-20 blur-2xl" />
               <h3 className="text-white dark:text-gray-900 text-lg font-black mb-4 relative z-10">Trending Now</h3>
               <div className="space-y-4 relative z-10">
                  <p className="text-gray-400 dark:text-gray-500 text-xs font-bold leading-relaxed">
                    Join the most active discussions of the week.
                  </p>
                  {/* Empty state or placeholders */}
                  <div className="space-y-3 pt-2">
                     <div className="h-px bg-gray-800 dark:bg-gray-200" />
                     <p className="text-gray-300 dark:text-gray-700 text-xs font-bold truncate">Meta Interview Experience 2024</p>
                     <p className="text-gray-300 dark:text-gray-700 text-xs font-bold truncate">Tips for Hard DP problems</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewPost(false)} />
          <div className="relative bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8">
                <h2 className="text-2xl font-black mb-6">Create New Discussion</h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="What's on your mind?"
                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-800 transition-all focus:outline-none"
                        value={newPostData.title}
                        onChange={(e) => setNewPostData({...newPostData, title: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Category</label>
                        <select 
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                          value={newPostData.category}
                          onChange={(e) => setNewPostData({...newPostData, category: e.target.value})}
                        >
                           {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Content</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder="Write your discussion details here..."
                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-800 transition-all focus:outline-none resize-none"
                        value={newPostData.content}
                        onChange={(e) => setNewPostData({...newPostData, content: e.target.value})}
                      />
                   </div>
                   <div className="flex items-center justify-end gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowNewPost(false)}
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
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
