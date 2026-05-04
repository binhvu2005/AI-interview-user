import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/base/RichTextEditor';
import { API_ENDPOINTS } from '../../services/api.config';

const ForumListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sortBy, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchPosts();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises)
      .then(base64Images => {
        setNewPostImages(prev => [...prev, ...base64Images]);
        setIsUploading(false);
      })
      .catch(() => {
        toast.error('Failed to upload some images');
        setIsUploading(false);
      });
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ENDPOINTS.FORUM.GET_POSTS}?sort=${sortBy}&page=${page}&search=${search}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1 });
      }
    } catch (error) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.FORUM.CREATE_POST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          tags: newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          images: newPostImages
        })
      });

      if (res.ok) {
        toast.success('Discussion posted!');
        setIsModalOpen(false);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostTags('');
        setNewPostImages([]);
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to create discussion');
    }
  };

  const filteredPosts = posts;

  const stripHtml = (html: string) => {
    if (!html) return "";
    // Remove HTML tags
    let stripped = html.replace(/<[^>]*>?/gm, '');
    // Decode common entities
    stripped = stripped
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return stripped.trim();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2">{t('forum.title')}</h1>
          <p className="text-sm text-on-surface-variant font-medium opacity-70">{t('forum.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined">add_comment</span>
          {t('forum.new_post')}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-3 mb-8 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/15 shadow-sm">
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tiêu đề hoặc hashtag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium placeholder:opacity-50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setSortBy('newest'); setPage(1); }}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${sortBy === 'newest' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant/20'}`}
          >
            {t('forum.sort_newest')}
          </button>
          <button 
            onClick={() => { setSortBy('popular'); setPage(1); }}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${sortBy === 'popular' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-highest text-on-surface-variant hover:bg-outline-variant/20'}`}
          >
            {t('forum.sort_popular')}
          </button>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => navigate(`/forum/${post.id}`)}
              className="bg-surface-container-lowest border border-outline-variant/15 rounded-[28px] p-5 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-6 hover:border-primary/40 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-outline-variant/20 group-hover:scale-105 transition-transform">
                  <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                      {tag}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold text-on-surface-variant opacity-40 ml-auto">
                    {new Date(post.date).toLocaleDateString()} {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-tight">{post.title}</h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 opacity-80 mb-4 font-medium leading-relaxed">{stripHtml(post.content)}</p>
                
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-hidden">
                    {post.images.slice(0, 3).map((img: string, idx: number) => (
                      <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm shrink-0">
                        <img src={img} alt="post-img" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {post.images.length > 3 && (
                      <div className="w-16 h-16 rounded-xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-[10px] font-black text-on-surface-variant shrink-0">
                        +{post.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/5">
                  <div className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-red-500' : 'text-on-surface-variant/60 group-hover:text-primary'}`}>
                    <span className={`material-symbols-outlined text-[20px] font-bold ${post.isLiked ? 'material-symbols-fill' : ''}`}>favorite</span>
                    <span className="text-xs font-black">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-[20px] font-bold">chat_bubble</span>
                    <span className="text-xs font-black">{post.replies}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-[20px] font-bold">visibility</span>
                    <span className="text-xs font-black">{post.views}</span>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50">{t('forum.posted_by')}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-on-surface">{post.author.name}</span>
                      {post.author.isVip && (
                        <span className="material-symbols-outlined text-[14px] text-[#ffc107]" title="VIP Member">workspace_premium</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-surface-container-low border border-dashed border-outline-variant/20 rounded-[40px] flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">forum</span>
            <p className="text-sm font-bold text-on-surface-variant/40 uppercase tracking-widest">{t('forum.no_discussions')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-outline-variant/20 disabled:opacity-30 transition-all"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          {(() => {
            const pages = [];
            const { totalPages, currentPage } = pagination;
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', currentPage, '...', totalPages);
              }
            }
            return pages.map((p, idx) => (
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-on-surface-variant opacity-40 font-bold">...</span>
              ) : (
                <button 
                  key={p}
                  onClick={() => setPage(Number(p))}
                  className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${p === currentPage ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high text-on-surface hover:bg-outline-variant/20'}`}
                >
                  {p}
                </button>
              )
            ));
          })()}

          <button 
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-outline-variant/20 disabled:opacity-30 transition-all"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-surface-container-low w-full max-w-2xl rounded-[40px] shadow-2xl border border-outline-variant/15 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
             <div className="px-10 py-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
               <div>
                  <h2 className="text-2xl font-black text-on-surface tracking-tight">{t('forum.create_title')}</h2>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{t('forum.create_guidelines')}</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:rotate-90 transition-all duration-300">
                 <span className="material-symbols-outlined text-2xl">close</span>
               </button>
             </div>
             
             <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('forum.create_title_label')}</label>
                  <input 
                    type="text" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder={t('forum.create_placeholder_title')} 
                    className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('forum.create_content_label')}</label>
                  <RichTextEditor 
                    value={newPostContent}
                    onChange={setNewPostContent}
                    placeholder={t('forum.create_placeholder_content')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('forum.create_tags')}</label>
                    <input 
                      type="text" 
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                      placeholder="e.g. React, Career" 
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('forum.create_media_label')}</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <label className="flex-1 bg-surface-container-highest border border-dashed border-outline-variant/30 rounded-2xl py-3 flex items-center justify-center gap-2 text-on-surface-variant hover:border-primary/40 transition-all group cursor-pointer">
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                          <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">
                            {isUploading ? 'progress_activity' : 'add_photo_alternate'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isUploading ? 'Uploading...' : t('forum.create_add_image')}
                          </span>
                        </label>
                      </div>
                      
                      {newPostImages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newPostImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant/20">
                              <img src={img} alt="preview" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-error transition-colors"
                              >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
             </div>
             
             <div className="px-10 py-8 border-t border-outline-variant/10 bg-surface-container-lowest flex justify-end gap-4">
                <button onClick={() => setIsModalOpen(false)} className="bg-surface-container-high text-on-surface px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-all">{t('profile_page.pwd_modal.cancel')}</button>
                <button 
                  onClick={handleCreatePost} 
                  className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {t('forum.create_submit')}
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ForumListPage;
