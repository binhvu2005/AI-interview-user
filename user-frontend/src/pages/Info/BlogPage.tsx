import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  id: number;
  titleVi: string;
  titleEn: string;
  category: 'prep' | 'ai' | 'update';
  categoryLabelVi: string;
  categoryLabelEn: string;
  date: string;
  authorVi: string;
  authorEn: string;
  excerptVi: string;
  excerptEn: string;
  image: string;
  readTimeVi: string;
  readTimeEn: string;
}

const BlogPage = () => {
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const posts: BlogPost[] = [
    {
      id: 1,
      titleVi: 'Cách AI Đang Cách Mạng Hóa Phỏng Vấn Kỹ Thuật',
      titleEn: 'How AI is Revolutionizing Technical Interviews',
      category: 'ai',
      categoryLabelVi: 'Công nghệ AI',
      categoryLabelEn: 'AI Technology',
      date: '2026-05-20',
      authorVi: 'Vũ Thanh Bình',
      authorEn: 'Vinh Vu',
      excerptVi: 'Khám phá cách các mô hình ngôn ngữ lớn (LLM) và tổng hợp giọng nói thời gian thực thay đổi cách lập trình viên chuẩn bị cho các kỳ thi kỹ thuật đầy thử thách.',
      excerptEn: 'Explore how large language models (LLMs) and real-time voice synthesis are changing the way developers prepare for high-stakes technical assessments.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      readTimeVi: '5 phút đọc',
      readTimeEn: '5 min read'
    },
    {
      id: 2,
      titleVi: 'Chinh Phục Thiết Kế Hệ Thống: Các Chủ Đề Trọng Tâm',
      titleEn: 'Mastering System Design: Key Topics to Study',
      category: 'prep',
      categoryLabelVi: 'Luyện phỏng vấn',
      categoryLabelEn: 'Interview Prep',
      date: '2026-05-15',
      authorVi: 'Obsidian Assistant',
      authorEn: 'Obsidian Assistant',
      excerptVi: 'Danh sách các khái niệm thiết kế hệ thống cốt lõi cần nắm vững, từ phân mảnh cơ sở dữ liệu (sharding) đến hàng đợi tin nhắn (message queues) và bộ nhớ đệm (caching).',
      excerptEn: 'A curated checklist of essential system design concepts to master, from database sharding and partitioning to message queues and custom caching layers.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      readTimeVi: '8 phút đọc',
      readTimeEn: '8 min read'
    },
    {
      id: 3,
      titleVi: 'Thông Tin Bản Cập Nhật Obsidian AI v2.0',
      titleEn: 'Obsidian AI v2.0 Release Notes',
      category: 'update',
      categoryLabelVi: 'Bản cập nhật',
      categoryLabelEn: 'Product Updates',
      date: '2026-05-10',
      authorVi: 'Vũ Thanh Bình',
      authorEn: 'Vinh Vu',
      excerptVi: 'Giới thiệu chế độ quan sát trực tiếp (live spectator mode), phân tích hồ sơ CV tự động theo mẫu mô tả công việc (JD), và cải tiến hệ thống câu hỏi truy vấn của AI.',
      excerptEn: 'Introducing live spectator room codes, automated resume ATS analysis matching against job descriptions (JD), and enhanced AI cognitive follow-up questions.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
      readTimeVi: '3 phút đọc',
      readTimeEn: '3 min read'
    },
    {
      id: 4,
      titleVi: 'Top 5 Kỹ Năng Mềm Quan Trọng Cho Kỹ Sư Trưởng / Leader',
      titleEn: 'Top 5 Essential Soft Skills for Lead Engineer Interviews',
      category: 'prep',
      categoryLabelVi: 'Luyện phỏng vấn',
      categoryLabelEn: 'Interview Prep',
      date: '2026-05-05',
      authorVi: 'Obsidian Assistant',
      authorEn: 'Obsidian Assistant',
      excerptVi: 'Tại sao khả năng giao tiếp truyền đạt, giải quyết xung đột và phương pháp lãnh đạo lại quan trọng ngang hàng với trình độ code trong phỏng vấn vị trí quản lý.',
      excerptEn: 'Why structured communication, conflict resolution, and leadership paradigms matter just as much as code proficiency during engineering management interviews.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
      readTimeVi: '6 phút đọc',
      readTimeEn: '6 min read'
    }
  ];

  const categories = [
    { value: 'all', labelVi: 'Tất cả bài viết', labelEn: 'All Posts' },
    { value: 'prep', labelVi: 'Luyện phỏng vấn', labelEn: 'Interview Prep' },
    { value: 'ai', labelVi: 'Công nghệ AI', labelEn: 'AI Technology' },
    { value: 'update', labelVi: 'Bản cập nhật', labelEn: 'Product Updates' }
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
            {isVi ? 'Nhật Ký Phát Triển' : 'Obsidian DevBlog'}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {isVi 
              ? 'Nơi chia sẻ kiến thức phỏng vấn, cập nhật công nghệ AI và hướng dẫn lập trình từ đội ngũ Obsidian AI.'
              : 'Insights on technical interviews, AI assessments, and engineering tips from the Obsidian AI team.'}
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
            {isVi ? cat.labelVi : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Featured Post (only when 'all' is selected) */}
      {selectedCategory === 'all' && featuredPost && (
        <div className="mb-12">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest mb-6">
            {isVi ? 'Bài viết nổi bật' : 'Featured Post'}
          </h2>
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] overflow-hidden shadow-sm hover:border-primary/20 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-full relative overflow-hidden group">
              <img 
                src={featuredPost.image} 
                alt={isVi ? featuredPost.titleVi : featuredPost.titleEn} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-primary/95 text-on-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                {isVi ? featuredPost.categoryLabelVi : featuredPost.categoryLabelEn}
              </div>
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-on-surface-variant/60 font-semibold">
                  <span>{featuredPost.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30"></span>
                  <span>{isVi ? featuredPost.readTimeVi : featuredPost.readTimeEn}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-on-surface leading-tight hover:text-primary transition-colors cursor-pointer">
                  {isVi ? featuredPost.titleVi : featuredPost.titleEn}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {isVi ? featuredPost.excerptVi : featuredPost.excerptEn}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                    {featuredPost.authorEn.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-on-surface">
                    {isVi ? featuredPost.authorVi : featuredPost.authorEn}
                  </span>
                </div>
                <button className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:translate-x-1 transition-transform">
                  {isVi ? 'Đọc tiếp' : 'Read Article'}
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
            {isVi ? 'Tất cả bài viết khác' : 'All Articles'}
          </h2>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low border border-outline-variant/10 rounded-[32px]">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium text-sm">
              {isVi ? 'Không tìm thấy bài viết nào.' : 'No articles found in this category.'}
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
                      alt={isVi ? post.titleVi : post.titleEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-outline-variant/10">
                      {isVi ? post.categoryLabelVi : post.categoryLabelEn}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/60 font-semibold">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
                      <span>{isVi ? post.readTimeVi : post.readTimeEn}</span>
                    </div>
                    <h3 className="text-lg font-black text-on-surface leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {isVi ? post.titleVi : post.titleEn}
                    </h3>
                    <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-3">
                      {isVi ? post.excerptVi : post.excerptEn}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant">
                    By {isVi ? post.authorVi : post.authorEn}
                  </span>
                  <button className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-0.5 hover:translate-x-0.5 transition-transform">
                    {isVi ? 'Đọc tiếp' : 'Read'}
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
