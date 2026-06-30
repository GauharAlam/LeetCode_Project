import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { 
  ChevronUp, ChevronDown, MessageCircle, Share2, ArrowLeft, Send, 
  Loader2, Clock, User
} from 'lucide-react';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <Loader2 className="animate-spin text-ember-400" size={32} />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4 text-center">
      <h1 className="text-2xl font-bold mb-4 text-text-primary font-display">Post not found</h1>
      <button onClick={() => navigate('/community')} className="text-ember-400 hover:text-ember-300 font-bold flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Community
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <button 
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center gap-2 text-text-muted hover:text-text-primary font-medium transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          Back to Community
        </button>

        <div className="card-af p-0 overflow-hidden">
          
          {/* Post Content */}
          <div className="p-8 border-b border-border-subtle bg-surface">
             <div className="flex items-center gap-3 mb-4">
                <span className="micro-label text-xs bg-elevated px-2 py-0.5 rounded-md">
                  {post.category}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
                  <Clock size={12} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
             </div>

             <h1 className="text-3xl font-bold text-text-primary mb-6 leading-tight font-display">
               {post.title}
             </h1>

             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-ember-600 flex items-center justify-center text-text-primary font-bold">
                   {post.userId?.firstName?.[0] || 'A'}
                </div>
                <div>
                   <p className="text-sm font-bold text-text-primary">
                      {post.userId?.firstName || 'Anonymous'}
                   </p>
                   <p className="text-[10px] text-text-muted font-mono uppercase tracking-wide">Developer</p>
                </div>
             </div>

             <div className="text-text-secondary leading-relaxed text-base space-y-4">
                {post.content.split('\n').map((para, i) => para ? <p key={i}>{para}</p> : <div key={i} className="h-2" />)}
             </div>

             <div className="flex items-center gap-6 mt-10 pt-6 border-t border-border-subtle">
                <button className="flex items-center gap-1.5 text-text-primary hover:text-ember-400 transition-colors font-bold text-sm">
                   <ChevronUp size={20} className="text-text-muted hover:text-ember-400" />
                   {post.upvotes?.length || 0} Upvotes
                </button>
                <div className="flex items-center gap-1.5 text-text-muted font-bold text-sm">
                   <MessageCircle size={20} />
                   {post.replies?.length || 0} Comments
                </div>
                <button className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm ml-auto">
                   <Share2 size={16} />
                   Share
                </button>
             </div>
          </div>

          {/* Comment Section */}
          <div className="bg-surface/50 p-8 border-t border-border-subtle">
             <h3 className="text-lg font-bold mb-6 text-text-primary font-display">Comments</h3>
             
             {/* Reply Box */}
             <form onSubmit={handleReply} className="mb-10">
                <div className="bg-inset border border-border-subtle rounded-card p-4 focus-within:border-ember-400 transition-all">
                   <textarea 
                     rows={3}
                     placeholder="Share your thoughts..."
                     className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm resize-none text-text-primary placeholder-text-muted"
                     value={reply}
                     onChange={(e) => setReply(e.target.value)}
                   />
                   <div className="flex items-center justify-end mt-2 pt-2 border-t border-border-subtle/50">
                      <button 
                        type="submit"
                        disabled={!reply.trim() || submitting}
                        className="btn-ember px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
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
                     <div className="w-8 h-8 rounded-lg bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                        <User size={14} className="text-text-muted" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-bold text-text-primary">
                              {r.userId?.firstName || 'User'}
                           </span>
                           <span className="text-[10px] text-text-muted font-mono">
                              • {new Date(r.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                           {r.content}
                        </p>
                     </div>
                  </div>
                ))}
                {(!post.replies || post.replies.length === 0) && (
                  <p className="text-center text-text-muted text-sm font-medium py-10 italic">
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
