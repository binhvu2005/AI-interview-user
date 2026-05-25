import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  id: number;
  category: 'prep' | 'ai' | 'update';
  date: string;
  image: string;
}

const BlogPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const posts: BlogPost[] = [
    {
      id: 1,
      category: 'ai',
      date: '2026-05-20',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      category: 'prep',
      date: '2026-05-15',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      category: 'update',
      date: '2026-05-10',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      category: 'prep',
      date: '2026-05-05',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const categories = [
    { value: 'all', label: t('blog_page.categories.all') },
    { value: 'prep', label: t('blog_page.categories.prep') },
    { value: 'ai', label: t('blog_page.categories.ai') },
    { value: 'update', label: t('blog_page.categories.update') }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  // Let's take the first post as the featured post if we are showing all
  const featuredPost = posts[0];
  const displayGridPosts = selectedCategory === 'all' 
    ? filteredPosts.slice(1) 
    : filteredPosts;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="text-center mb-16 relative overflow-hidden p-8 sm:p-12 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">rss_feed</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {t('blog_page.title')}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {t('blog_page.desc')}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedCategory === cat.value
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/25 border border-primary'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Post (only when 'all' is selected) */}
      {selectedCategory === 'all' && featuredPost && (
        <div className="mb-12">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-6">
            {t('blog_page.featured')}
          </h2>
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] overflow-hidden shadow-sm hover:border-primary/20 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-full relative overflow-hidden group">
              <img 
                src={featuredPost.image} 
                alt={t(`blog_page.posts.${featuredPost.id}.title`)} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-primary/95 text-on-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                {t(`blog_page.categories.${featuredPost.category}`)}
              </div>
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-on-surface-variant/60 font-semibold">
                  <span>{featuredPost.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30"></span>
                  <span>{t(`blog_page.posts.${featuredPost.id}.readTime`)}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-on-surface leading-tight hover:text-primary transition-colors cursor-pointer">
                  {t(`blog_page.posts.${featuredPost.id}.title`)}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {t(`blog_page.posts.${featuredPost.id}.excerpt`)}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                    {t(`blog_page.posts.${featuredPost.id}.author`).charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-on-surface">
                    {t(`blog_page.posts.${featuredPost.id}.author`)}
                  </span>
                </div>
                <button className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:translate-x-1 transition-transform">
                  {t('blog_page.read_article')}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Posts */}
      <div>
        {selectedCategory === 'all' && (
          <h2 className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest mb-6">
            {t('blog_page.all_articles')}
          </h2>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low border border-outline-variant/10 rounded-[32px]">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium text-sm">
              {t('blog_page.no_articles')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayGridPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-surface-container-low border border-outline-variant/15 rounded-[28px] overflow-hidden flex flex-col justify-between shadow-sm hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="h-48 relative overflow-hidden group">
                    <img 
                      src={post.image} 
                      alt={t(`blog_page.posts.${post.id}.title`)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-outline-variant/10">
                      {t(`blog_page.categories.${post.category}`)}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/60 font-semibold">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
                      <span>{t(`blog_page.posts.${post.id}.readTime`)}</span>
                    </div>
                    <h3 className="text-lg font-black text-on-surface leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {t(`blog_page.posts.${post.id}.title`)}
                    </h3>
                    <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-3">
                      {t(`blog_page.posts.${post.id}.excerpt`)}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant">
                    By {t(`blog_page.posts.${post.id}.author`)}
                  </span>
                  <button className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-0.5 hover:translate-x-0.5 transition-transform">
                    {t('blog_page.read')}
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
