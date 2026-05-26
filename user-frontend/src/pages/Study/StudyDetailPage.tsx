import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../services/api.config';
import { fetchWithAuth } from '../../services/fetchClient';

interface Section { id: string; title: string; content: string; order: number; }
interface Resource { title: string; url: string; }

interface StudyDetail {
  _id: string; name: string; slug: string; category: string;
  bannerImage: string; shortDescription: string; overview: string;
  keyFeatures: string[]; installation: string; directoryStructure: string;
  sections: Section[]; resources: Resource[]; tags: string[];
}

const CAT_COLORS: Record<string, string> = {
  Frontend: '#818CF8', Backend: '#34D399', Database: '#F59E0B',
  DevOps: '#F472B6', Mobile: '#60A5FA', Other: '#A78BFA'
};

export default function StudyDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<StudyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [highScore, setHighScore] = useState<number | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  interface TOCItem { id: string; text: string; level: number; }
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.STUDY_MATERIALS.GET_ONE(slug || ''));
        if (res.ok) { const data = await res.json(); setMaterial(data); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
    fetchHighScore();
  }, [slug]);

  const fetchHighScore = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.QUIZ.HIGH_SCORES);
      if (res.ok) {
        const scores = await res.json();
        const match = scores.find((s: any) => s.tag === slug?.toLowerCase());
        if (match) setHighScore(match.highestScore);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!material) return;
    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      const headingElements = contentRef.current.querySelectorAll('h2, h3, h4');
      const items: TOCItem[] = [];
      headingElements.forEach((el, index) => {
        const text = el.textContent?.trim() || '';
        if (!text) return;
        const tagName = el.tagName.toLowerCase();
        let id = '';
        if (tagName === 'h2') {
          const parentSection = el.closest('section');
          if (parentSection && parentSection.id) {
            id = parentSection.id;
          } else {
            id = el.id || `h2-${index}`;
            el.id = id;
          }
        } else {
          if (el.id) {
            id = el.id;
          } else {
            const slugified = text
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-');
            id = slugified ? `h-${slugified}-${index}` : `h-${tagName}-${index}`;
            el.id = id;
          }
        }
        el.classList.add('scroll-mt-24');
        items.push({ id, text, level: parseInt(tagName.substring(1)) || 2 });
      });
      setTocItems(items);
    }, 50);
    return () => clearTimeout(timer);
  }, [material]);

  useEffect(() => {
    if (tocItems.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-100px 0px -75% 0px', threshold: 0 });
    tocItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocItems]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setTocOpen(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 animate-pulse bg-background text-on-surface">
      <div className="h-64 bg-surface-container rounded-2xl mb-8" />
      <div className="h-8 bg-surface-container rounded w-1/3 mb-4" />
      <div className="h-4 bg-surface-container rounded w-2/3" />
    </div>
  );

  if (!material) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center bg-background text-on-surface">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4">error</span>
      <p className="text-on-surface-variant">{t('study.no_materials')}</p>
      <button onClick={() => navigate('/study')} className="mt-4 text-primary text-sm font-semibold hover:underline cursor-pointer">← {t('study.back')}</button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 animate-fade-in bg-background text-on-surface">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden bg-surface-container-high">
        {material.bannerImage ? (
          <img src={material.bannerImage} alt={material.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CAT_COLORS[material.category] || '#818CF8'}20, transparent)` }}>
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/10">menu_book</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3">
            <button onClick={() => navigate('/study')} className="hover:text-primary transition-colors cursor-pointer">{t('study.center')}</button>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-on-surface font-medium">{material.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight mb-2">{material.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: CAT_COLORS[material.category] || '#818CF8' }}>
                {material.category === 'Other' ? (t('study.other') || 'Khác') : material.category}
              </span>
              {material.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/30 text-[10px] font-semibold text-on-surface-variant">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {highScore !== null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px] text-amber-400">emoji_events</span>
                <div>
                  <div className="text-[9px] font-semibold text-on-surface-variant uppercase tracking-wider">{t('study.highest_score')}</div>
                  <div className="text-sm font-bold text-on-surface">{highScore}%</div>
                </div>
              </div>
            )}
            <button onClick={() => navigate(`/study/quiz?tags=${material.tags[0] || material.slug}`)}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-dim transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]">
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              {t('study.practice_now')}
            </button>
          </div>
        </div>

        <div className="flex gap-8 relative">
          {/* Content */}
          <div ref={contentRef} className="flex-1 min-w-0 space-y-10">
            {/* Overview */}
            <section id="overview" data-section className="scroll-mt-20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <h2 className="text-lg font-bold text-on-surface tracking-tight">{t('study.overview')}</h2>
              </div>
              <div className="bento-card p-6">
                <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: material.overview || material.shortDescription }} />
              </div>
            </section>

            {/* Key Features */}
            {material.keyFeatures.length > 0 && (
              <section id="features" data-section className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">star</span>
                  <h2 className="text-lg font-bold text-on-surface tracking-tight">{t('study.key_features')}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {material.keyFeatures.map((f, i) => (
                    <div key={i} className="bento-card p-4 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-[10px] font-bold">{i + 1}</span>
                      </div>
                      <span className="text-sm text-on-surface-variant leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dynamic Sections */}
            {material.sections.sort((a, b) => a.order - b.order).map(section => (
              <section key={section.id} id={`section-${section.id}`} data-section className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#34D399] text-[20px]">article</span>
                  <h2 className="text-lg font-bold text-on-surface tracking-tight">{section.title}</h2>
                </div>
                <div className="bento-card p-6">
                  <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed text-sm study-content"
                    dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              </section>
            ))}

            {/* Directory Structure */}
            {material.directoryStructure && (
              <section id="directory" data-section className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">folder</span>
                  <h2 className="text-lg font-bold text-on-surface tracking-tight">{t('study.directory_structure')}</h2>
                </div>
                <div className="bento-card p-6">
                  <pre className="text-xs text-on-surface-variant font-mono leading-relaxed whitespace-pre-wrap bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 overflow-x-auto">
                    {material.directoryStructure}
                  </pre>
                </div>
              </section>
            )}

            {/* Installation */}
            {material.installation && (
              <section id="installation" data-section className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#F472B6] text-[20px]">terminal</span>
                  <h2 className="text-lg font-bold text-on-surface tracking-tight">{t('study.installation')}</h2>
                </div>
                <div className="bento-card p-6">
                  <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed text-sm study-content"
                    dangerouslySetInnerHTML={{ __html: material.installation }} />
                </div>
              </section>
            )}

            {/* Resources */}
            {material.resources.length > 0 && (
              <section id="resources" data-section className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#60A5FA] text-[20px]">link</span>
                  <h2 className="text-lg font-bold text-on-surface tracking-tight">{t('study.resources')}</h2>
                </div>
                <div className="space-y-2">
                  {material.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="bento-card p-4 flex items-center gap-3 hover:bg-surface-container-high transition-colors group cursor-pointer block">
                      <span className="material-symbols-outlined text-[#60A5FA] text-[18px]">open_in_new</span>
                      <div>
                        <div className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{r.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate max-w-md">{r.url}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-outline-variant/30">
              <button onClick={() => navigate('/study')}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                {t('study.back_to_list')}
              </button>
              <button onClick={() => navigate(`/study/quiz?tags=${material.tags[0] || material.slug}`)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-dim transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                {t('study.practice_now')}
              </button>
            </div>
          </div>

          {/* TOC - Desktop Sticky Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin">
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-3">
                {t('study.toc') || 'Mục lục'}
              </div>
              <nav className="relative border-l border-outline-variant/30 flex flex-col gap-1">
                {tocItems.map(item => {
                  const isActive = activeSection === item.id;
                  const indentClass = item.level === 3 ? 'pl-6' : item.level === 4 ? 'pl-9' : 'pl-3';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`group flex items-center py-1.5 pr-2 -ml-[1px] border-l transition-all text-left cursor-pointer text-xs ${indentClass} ${
                        isActive
                          ? 'border-primary text-primary font-semibold'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                      }`}
                    >
                      <span className="truncate leading-relaxed">{item.text}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating TOC Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary-dim transition-transform duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined">{tocOpen ? 'close' : 'menu_book'}</span>
        </button>
      </div>

      {/* Mobile TOC Drawer Overlay */}
      {tocOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setTocOpen(false)}>
          <div
            className="fixed right-0 top-0 bottom-0 w-72 bg-surface-container shadow-2xl p-6 flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold uppercase tracking-wider text-on-surface">{t('study.toc') || 'Mục lục'}</span>
              <button onClick={() => setTocOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto border-l border-outline-variant/30 flex flex-col gap-1 pr-2">
              {tocItems.map(item => {
                const isActive = activeSection === item.id;
                const indentClass = item.level === 3 ? 'pl-6' : item.level === 4 ? 'pl-9' : 'pl-3';
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`group flex items-center py-2 pr-2 -ml-[1px] border-l transition-all text-left cursor-pointer text-xs ${indentClass} ${
                      isActive
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="truncate leading-relaxed">{item.text}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
