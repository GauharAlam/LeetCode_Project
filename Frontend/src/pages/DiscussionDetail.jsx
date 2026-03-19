import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { 
  ChevronUp, MessageCircle, Share2, ArrowLeft, Send, 
  Loader2, Clock, User
} from 'lucide-react';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      // In our controller, getDiscussions fetches by problemId. 
      // We might need a generic getDiscussionById or handle it carefully.
      // For now, let's assume we can fetch it. 
      // (Actually, our controller doesn't have getPostById, I should add it or use find logic)
      const { data } = await axiosClient.get(`/problem/discussions/global`);
      const found = data.find(p => p._id === id);
      setPost(found);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await axiosClient.post(`/problem/discussion/${id}/reply`, { content: reply });
      setReply('');
      fetchPost();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <button onClick={() => navigate('/community')} className="text-blue-500 font-bold flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Community
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <button 
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold transition-colors"
        >
          <ArrowLeft size={18} />
          Community
        </button>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          
          {/* Post Content */}
          <div className="p-8 border-b border-gray-100 dark:border-neutral-800">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                  <Clock size={12} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
             </div>

             <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
               {post.title}
             </h1>

             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">
                   {post.userId?.firstName?.[0] || 'A'}
                </div>
                <div>
                   <p className="text-sm font-black text-gray-900 dark:text-white">
                      {post.userId?.firstName || 'Anonymous'}
                   </p>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Developer</p>
                </div>
             </div>

             <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {post.content.split('\n').map((para, i) => para ? <p key={i} className="mb-4">{para}</p> : <br key={i} />)}
             </div>

             <div className="flex items-center gap-6 mt-10 pt-6 border-t border-gray-100 dark:border-neutral-800">
                <button className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-sm">
                   <ChevronUp size={20} className="text-gray-400" />
                   {post.upvotes?.length || 0} Upvotes
                </button>
                <div className="flex items-center gap-2 text-gray-400 font-black text-sm">
                   <MessageCircle size={20} />
                   {post.replies?.length || 0} Comments
                </div>
                <button className="flex items-center gap-2 text-gray-400 font-black text-sm hover:text-gray-900 dark:hover:text-white transition-colors ml-auto">
                   <Share2 size={18} />
                   Share
                </button>
             </div>
          </div>

          {/* Comment Section */}
          <div className="bg-gray-50/50 dark:bg-neutral-900/50 p-8">
             <h3 className="text-lg font-black mb-6">Comments</h3>
             
             {/* Reply Box */}
             <form onSubmit={handleReply} className="mb-10">
                <div className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-neutral-800 transition-all">
                   <textarea 
                     rows={3}
                     placeholder="Share your thoughts..."
                     className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none"
                     value={reply}
                     onChange={(e) => setReply(e.target.value)}
                   />
                   <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50 dark:border-neutral-900">
                      <button 
                        type="submit"
                        disabled={!reply.trim() || submitting}
                        className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-black shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                         {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                         Post Comment
                      </button>
                   </div>
                </div>
             </form>

             <div className="space-y-6">
                {post.replies?.map((r, i) => (
                  <div key={i} className="flex gap-4 group">
                     <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <User size={14} className="text-gray-400" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-black text-gray-900 dark:text-white">
                              {r.userId?.firstName || 'User'}
                           </span>
                           <span className="text-[10px] text-gray-400 font-bold">
                              • {new Date(r.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                           {r.content}
                        </p>
                        <button className="mt-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                           Reply
                        </button>
                     </div>
                  </div>
                ))}
                {(!post.replies || post.replies.length === 0) && (
                  <p className="text-center text-gray-400 text-sm font-medium py-10 italic">
                    No comments yet. Start the conversation!
                  </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;
