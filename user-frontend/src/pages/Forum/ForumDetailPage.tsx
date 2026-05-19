import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import RichTextEditor from '../../components/base/RichTextEditor';

import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';


const ForumDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [replyPage, setReplyPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [subReplyText, setSubReplyText] = useState('');
  const userAvatar = localStorage.getItem('userAvatar');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchPost(replyPage);
  }, [id, sortBy, replyPage]);

  const fetchPost = async (page: number = replyPage) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(`${API_ENDPOINTS.FORUM.GET_POST(id!)}?sort=${sortBy}&replyPage=${page}&replyLimit=5`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      toast.error('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.FORUM.LIKE_POST(id!), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({ ...prev, likes: data.likes }));
        toast.success('Liked discussion');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.FORUM.REPLY(id!), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText })
      });
      if (res.ok) {
        toast.success('Bình luận thành công!');
        setReplyText('');
        fetchPost(replyPage);
      }
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handlePostSubReply = async (parentReplyId: string) => {
    if (!subReplyText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.FORUM.REPLY(id!), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: subReplyText, parentReplyId })
      });
      if (res.ok) {
        toast.success('Phản hồi thành công!');
        setSubReplyText('');
        setActiveReplyId(null);
        fetchPost(replyPage);
      }
    } catch (error) {
      toast.error('Gửi phản hồi thất bại');
    }
  };

  const handleLikeReply = async (replyId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.FORUM.LIKE_REPLY(id!, replyId), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPost(replyPage);
        toast.success('Liked reply');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  );

  if (!post) return (
    <div className="text-center py-20">
      <p className="text-on-surface-variant font-bold">Discussion not found</p>
      <button onClick={() => navigate('/forum')} className="text-primary mt-4 font-bold">Go back</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/forum')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-black text-[10px] uppercase tracking-[0.3em] mb-10 group"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        {t('forum.back_to_list')}
      </button>

      {/* Main Post */}
      <article className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 shadow-xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>
        
        <header className="flex items-center justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div 
               className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-surface-container-high transition-all shadow-md ${
                 post.author.isVip
                   ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(245,158,11,0.55)] border-none'
                   : 'border-2 border-primary/20'
               }`}
             >
               {post.author.isVip && (
                 <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 blur-[1px] animate-pulse pointer-events-none"></span>
               )}
               <div className={`relative w-full h-full rounded-2xl overflow-hidden ${post.author.isVip ? 'p-[1px] bg-background' : ''}`}>
                 <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover rounded-2xl" />
               </div>
             </div>
             <div>
                <h4 className="font-black text-on-surface tracking-tight">{post.author.name}</h4>
                {post.author.isVip ? (
                  <span className="text-[9px] uppercase tracking-widest badge-vip-animated px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 leading-none mt-1 shadow-sm shadow-yellow-500/20">
                    <span className="material-symbols-outlined text-[10px] material-symbols-fill">workspace_premium</span> VIP
                  </span>
                ) : (
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">{t('forum.user_role_premium')}</p>
                )}
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">{new Date(post.date).toLocaleDateString()}</p>
             <p className="text-[10px] font-bold text-on-surface-variant opacity-30">{new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </header>

        <div className="relative z-10 mb-8">
          <div className="flex gap-2 mb-4">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-lg bg-surface-container-highest text-on-surface-variant text-[10px] font-black uppercase tracking-widest border border-outline-variant/20">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-6 leading-[1.2]">{post.title}</h1>
          <div 
            className="text-on-surface-variant text-lg leading-relaxed font-medium opacity-90 mb-8 rich-text-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
          
          {post.images && post.images.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              {post.images.map((img: string, idx: number) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-outline-variant/10 shadow-md max-w-full sm:max-w-[48%] flex-1 min-w-[200px]">
                  <img 
                    src={img} 
                    alt={`post-img-${idx}`} 
                    className="w-full h-auto object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500" 
                    onClick={() => window.open(img, '_blank')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 pt-8 border-t border-outline-variant/10 relative z-10">
          <button 
            onClick={handleLikePost}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
              post.isLiked 
                ? 'bg-red-500/20 text-red-500 shadow-red-500/10' 
                : 'bg-primary/10 text-primary shadow-primary/5 hover:bg-primary hover:text-on-primary'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] font-bold ${post.isLiked ? 'material-symbols-fill' : ''}`}>favorite</span>
            {post.likes}
          </button>
          <button className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-all">
            <span className="material-symbols-outlined text-[20px] font-bold">bookmark</span>
            {t('forum.save')}
          </button>
          <div className="ml-auto flex items-center gap-2 text-on-surface-variant/40">
             <span className="material-symbols-outlined text-[20px]">visibility</span>
             <span className="text-xs font-black">{t('forum.views_count', { count: post.views })}</span>
          </div>
        </div>
      </article>

      {/* Replies Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-3">
          {t('forum.replies')}
          <span className="text-xs bg-surface-container-highest text-on-surface-variant px-2.5 py-1 rounded-full font-black">
            {pagination ? pagination.totalReplies : post.replies.length}
          </span>
        </h3>
        <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10">
           <button onClick={() => setSortBy('newest')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'newest' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-outline-variant/10'}`}>{t('forum.sort_newest')}</button>
           <button onClick={() => setSortBy('popular')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'popular' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-outline-variant/10'}`}>{t('forum.sort_popular')}</button>
        </div>
      </div>

      {/* Reply Input */}
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 mb-12 shadow-inner">
        <div className="flex gap-4">
           <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-outline-variant/30">
               <img 
                 src={userAvatar || `https://ui-avatars.com/api/?name=${userName || 'User'}&background=6366f1&color=fff`} 
                 alt="You" 
                 className="w-full h-full object-cover"
               />
           </div>
           <div className="flex-1 space-y-4">
              <RichTextEditor 
                value={replyText}
                onChange={setReplyText}
                placeholder={t('forum.reply_placeholder')}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handlePostReply}
                  disabled={!replyText.trim()}
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {t('forum.reply_btn')}
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Reply List */}
      <div className="space-y-6">
        {post.replies.map((reply: any) => (
          <div key={reply.id} className="space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-[32px] p-8 shadow-sm hover:border-primary/20 transition-colors">
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-high transition-all shadow-sm ${
                      reply.author.isVip
                        ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(245,158,11,0.55)] border-none'
                        : 'border border-outline-variant/20'
                    }`}
                  >
                    {reply.author.isVip && (
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 blur-[1px] animate-pulse pointer-events-none"></span>
                    )}
                    <div className={`relative w-full h-full rounded-xl overflow-hidden ${reply.author.isVip ? 'p-[1px] bg-background' : ''}`}>
                      <img src={reply.author.avatar} alt={reply.author.name} className="w-full h-full object-cover rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-on-surface">{reply.author.name}</h5>
                      {reply.author.isVip && (
                        <span className="text-[8px] uppercase tracking-widest badge-vip-animated px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 leading-none shadow-sm shadow-yellow-500/20">
                          <span className="material-symbols-outlined text-[8px] material-symbols-fill">workspace_premium</span> VIP
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">
                      {new Date(reply.date).toLocaleDateString()} — {new Date(reply.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleLikeReply(reply.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reply.isLiked ? 'bg-red-500/10 text-red-500' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  <span className={`material-symbols-outlined text-[16px] ${reply.isLiked ? 'material-symbols-fill' : ''}`}>favorite</span>
                  {reply.likes}
                </button>
              </header>
              
              <div 
                className="text-sm text-on-surface-variant leading-relaxed font-medium opacity-80 pl-13 mb-4 rich-text-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.content) }}
              />
              
              <div className="pl-13">
                 <button 
                   onClick={() => {
                     setActiveReplyId(activeReplyId === reply.id ? null : reply.id);
                     setSubReplyText('');
                   }}
                   className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                 >
                    <span className="material-symbols-outlined text-[16px]">reply</span>
                    {t('forum.reply_btn')}
                 </button>
              </div>
            </div>

            {/* Inline Sub-Reply Editor */}
            {activeReplyId === reply.id && (
              <div className="ml-16 bg-surface-container-low border border-outline-variant/15 rounded-[24px] p-6 shadow-inner animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30">
                    <img 
                      src={userAvatar || `https://ui-avatars.com/api/?name=${userName || 'User'}&background=6366f1&color=fff`} 
                      alt="You" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <RichTextEditor 
                      value={subReplyText}
                      onChange={setSubReplyText}
                      placeholder="Viết phản hồi..."
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setActiveReplyId(null)}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-outline-variant/10 transition-colors"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={() => handlePostSubReply(reply.id)}
                        disabled={!subReplyText.trim()}
                        className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Gửi phản hồi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Nested Replies */}
            {reply.replies && reply.replies.map((sub: any) => (
              <div key={sub.id} className="ml-16 bg-surface-container-low/50 border border-outline-variant/10 rounded-[24px] p-6 shadow-sm border-l-4 border-l-primary/30 animate-in slide-in-from-left-4 duration-500">
                <header className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`relative w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-high transition-all shadow-sm ${
                        sub.author?.isVip
                          ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background shadow-[0_0_8px_rgba(245,158,11,0.55)] border-none'
                          : 'border border-outline-variant/20'
                      }`}
                    >
                      {sub.author?.isVip && (
                        <span className="absolute inset-0 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 blur-[1px] animate-pulse pointer-events-none"></span>
                      )}
                      <div className={`relative w-full h-full rounded-lg overflow-hidden ${sub.author?.isVip ? 'p-[1px] bg-background' : ''}`}>
                        <img src={sub.author?.avatar} alt={sub.author?.name} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h6 className="text-xs font-bold text-on-surface">{sub.author?.name}</h6>
                        {sub.author?.isVip && (
                          <span className="text-[7px] uppercase tracking-widest badge-vip-animated px-1 py-0.5 rounded-full inline-flex items-center gap-0.5 leading-none shadow-sm shadow-yellow-500/20">
                            <span className="material-symbols-outlined text-[8px] material-symbols-fill">workspace_premium</span> VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-bold text-on-surface-variant opacity-40">{new Date(sub.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </header>
                <div 
                  className="text-xs text-on-surface-variant leading-relaxed font-medium opacity-80 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sub.content) }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Comments Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-12">
          <button
            onClick={() => setReplyPage(prev => Math.max(prev - 1, 1))}
            disabled={replyPage === 1}
            className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline-variant/15 text-on-surface flex items-center justify-center disabled:opacity-40 transition-colors hover:bg-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          
          {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((p) => (
            <button
              key={p}
              onClick={() => setReplyPage(p)}
              className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                replyPage === p
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-105'
                  : 'bg-surface-container-low border border-outline-variant/15 text-on-surface hover:bg-outline-variant/10'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setReplyPage(prev => Math.min(prev + 1, pagination.totalPages))}
            disabled={replyPage === pagination.totalPages}
            className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline-variant/15 text-on-surface flex items-center justify-center disabled:opacity-40 transition-colors hover:bg-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ForumDetailPage;
