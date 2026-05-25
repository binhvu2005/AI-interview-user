import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  id: number;
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
  category: 'start' | 'interview' | 'vip' | 'tech';
}

const HelpPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs = [
    { id: 1, category: 'start' as const },
    { id: 2, category: 'interview' as const },
    { id: 3, category: 'vip' as const },
    { id: 4, category: 'interview' as const },
    { id: 5, category: 'tech' as const },
    { id: 6, category: 'start' as const }
  ];

  const categories = [
    { value: 'all' },
    { value: 'start' },
    { value: 'interview' },
    { value: 'vip' },
    { value: 'tech' }
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const qText = t(`help_page.faqs.${faq.id}.question`);
    const aText = t(`help_page.faqs.${faq.id}.answer`);
    const matchesSearch = qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          aText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="text-center mb-12 relative overflow-hidden p-8 sm:p-12 rounded-[40px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">help_center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 text-on-surface">
            {t('help_page.title')}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg max-w-xl mx-auto leading-relaxed">
            {t('help_page.desc')}
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto mt-8 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('help_page.search_placeholder')}
              className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-colors shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setSelectedCategory(cat.value);
              setExpandedId(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedCategory === cat.value
                ? 'bg-primary text-on-primary border border-primary'
                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container'
            }`}
          >
            {t(`help_page.categories.${cat.value}`)}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-low border border-outline-variant/10 rounded-[32px]">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-3">search_off</span>
            <p className="text-on-surface-variant font-medium text-sm">
              {t('help_page.no_questions')}
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id} 
                className={`bg-surface-container-low border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'border-primary/30 shadow-sm' : 'border-outline-variant/15 hover:border-outline-variant/30'
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-on-surface text-sm sm:text-base"
                >
                  <span>{t(`help_page.faqs.${faq.id}.question`)}</span>
                  <span className={`material-symbols-outlined text-primary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-60 border-t border-outline-variant/10' : 'max-h-0'
                  }`}
                >
                  <p className="p-6 text-sm text-on-surface-variant leading-relaxed">
                    {t(`help_page.faqs.${faq.id}.answer`)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Support CTA */}
      <div className="mt-16 text-center p-8 bg-gradient-to-tr from-primary/5 to-transparent rounded-[32px] border border-outline-variant/10">
        <h3 className="font-black text-on-surface text-lg mb-2">
          {t('help_page.still_questions_title')}
        </h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6">
          {t('help_page.still_questions_desc')}
        </p>
        <a 
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 transition-colors shadow-md shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[16px]">contact_support</span>
          {t('help_page.get_in_touch')}
        </a>
      </div>
    </div>
  );
};

export default HelpPage;
