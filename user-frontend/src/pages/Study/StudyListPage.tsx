import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';

const CATEGORIES = ['', 'Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other'];
const CAT_COLORS: Record<string, string> = {
  Frontend: '#818CF8', Backend: '#34D399', Database: '#F59E0B',
  DevOps: '#F472B6', Mobile: '#60A5FA', Other: '#A78BFA'
};

interface StudyItem {
  _id: string; name: string; slug: string; category: string;
  bannerImage: string; shortDescription: string; tags: string[];
}

interface HighScore { tag: string; highestScore: number; }

export default function StudyListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<StudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => { fetchHighScores(); }, []);
  useEffect(() => { fetchMaterials(); }, [page, category, search]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12', search, category });
      const res = await fetch(`${API_ENDPOINTS.STUDY_MATERIALS.GET_ALL}?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchHighScores = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.QUIZ.HIGH_SCORES);
      if (res.ok) { const data = await res.json(); setHighScores(data); }
    } catch (err) { console.error(err); }
  };

  const getScore = (tags: string[]) => {
    for (const t of tags) {
      const hs = highScores.find(h => h.tag === t.toLowerCase());
      if (hs) return hs.highestScore;
    }
    return null;
  };

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleCategory = (cat: string) => { setCategory(cat); setPage(1); };

  return (
    <div className="min-h-screen pb-20 animate-fade-in bg-background text-on-surface">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-8">
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <span className="material-symbols-outlined text-[12px]">menu_book</span>
          {t('study.center')}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-3">
          {t('study.title')} <span className="text-primary">{t('study.title_highlight')}</span>
        </h1>
        <p className="text-on-surface-variant text-sm max-w-lg leading-relaxed">
          {t('study.desc')}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Search */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder={t('study.search_placeholder')}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant/50 text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                category === cat
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/25'
                  : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}>
              {cat === '' ? t('study.difficulty_all') : cat === 'Other' ? (t('study.other') || 'Khác') : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface-container border border-outline-variant/30 overflow-hidden animate-pulse">
                <div className="h-40 bg-surface-container-high" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4" />
                  <div className="h-3 bg-surface-container-high rounded w-full" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-20">search_off</span>
            <p className="text-sm font-medium opacity-50">{t('study.no_materials')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              const score = getScore(item.tags);
              return (
                <div key={item._id}
                  onClick={() => navigate(`/study/${item.slug}`)}
                  className="group rounded-2xl bg-surface-container border border-outline-variant/30 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
                >
                  {/* Banner */}
                  <div className="relative h-40 overflow-hidden bg-surface-container-high">
                    {item.bannerImage ? (
                      <img
                        src={item.bannerImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">menu_book</span>
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
                      style={{ background: `${CAT_COLORS[item.category] || '#818CF8'}CC` }}>
                      {item.category === 'Other' ? (t('study.other') || 'Khác') : item.category}
                    </div>
                    {/* Score Badge */}
                    {score !== null && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center gap-1"
                        style={{ background: score >= 70 ? '#34D39980' : score >= 40 ? '#F59E0B80' : '#EF444480', color: '#fff' }}>
                        <span className="material-symbols-outlined text-[12px]">emoji_events</span>
                        {score}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-3 line-clamp-2">{item.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {item.tags.slice(0, 3).map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-surface-container-high text-[9px] font-semibold text-on-surface-variant">{t}</span>
                        ))}
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/50 text-xs font-semibold text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-high transition-all cursor-pointer disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  page === i + 1 ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high'
                }`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/50 text-xs font-semibold text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-high transition-all cursor-pointer disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
