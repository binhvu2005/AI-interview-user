import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TalentPoolPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [userName, setUserName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (token && name) {
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => { const next = !isDark; setIsDark(next); localStorage.setItem('theme', next ? 'dark' : 'light'); };
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUserName(null);
    navigate('/login');
  };

  const firstName = userName ? userName.split(' ')[userName.split(' ').length - 1] : '';

  const candidates = [
    { id: 1, name: 'Alex Johnson', role: 'Senior React Developer', match: 96, status: 'Top 1%' },
    { id: 2, name: 'Sarah Chen', role: 'Backend Engineer', match: 92, status: 'Top 5%' },
    { id: 3, name: 'Marcus Miller', role: 'Fullstack Dev', match: 88, status: 'Top 10%' },
    { id: 4, name: 'Emma Watson', role: 'DevOps Engineer', match: 85, status: 'Top 15%' },
  ];

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl text-primary font-manrope tracking-tight shadow-md border-b border-outline-variant/15 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-on-surface">{t('app_name')}</span>
          <div className="flex gap-6 items-center">
            <a onClick={() => navigate('/dashboard')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.dashboard')}</a>
            <a onClick={() => navigate('/preparation')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.preparation')}</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="text-on-surface-variant hover:text-primary font-bold transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 ml-2 uppercase text-xs" title="Toggle Language">
            {i18n.language === 'en' ? 'EN' : 'VI'}
          </button>
          <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 ml-2" title="Toggle Theme">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {userName && (
            <div className="flex items-center gap-4 relative">
              <span className="text-on-surface font-medium">{t('nav.hi')}, {firstName}</span>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors focus:outline-none">
                <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyPz5x4PBhVYD5STvbLUInbycvf3EdIahvnESGHsxcPGIF9PHdXIIIBJvfxOqHtDcZzIlJv2cA_6kyzGlHRQSY5qTvUpeZYggo3oEKTThgygxp6ENEjUQZnHFVveDB2F2GwYuw35Wm6bu_2vVzRvsJ9CJNgOCA8f1pQxGt3GTiFc6R6_krBDrEeW79qWCq6Az9RfjVah7lfgRr_EJTMkwz5cHVwNlksNcZbu9ATdvBnbshnw57luJiGy1HbKg-0vqi7Qq3F-IhvqbK" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-12 right-0 w-48 bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-lg py-2 flex flex-col z-50">
                  <a onClick={() => navigate('/settings')} className="px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">settings</span> {t('nav.settings')}
                  </a>
                  <div className="h-px bg-outline-variant/15 my-1"></div>
                  <button onClick={handleLogout} className="px-4 py-2 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-2 w-full text-left">
                    <span className="material-symbols-outlined text-[18px]">logout</span> {t('sidebar.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 pt-16">
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] sticky left-0 top-16 bg-background text-primary font-manrope text-sm w-64 border-r border-outline-variant/15">
          <div className="px-6 py-8 flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-xl">psychiatry</span>
            </div>
            <h2 className="text-lg font-black text-on-surface tracking-tight">{t('sidebar.title')}</h2>
            <span className="text-on-surface-variant text-xs">{t('sidebar.subtitle')}</span>
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>{t('sidebar.overview')}</span>
            </a>
            <a onClick={() => navigate('/preparation')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">psychiatry</span>
              <span>{t('sidebar.interview_prep')}</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary border-r-4 border-primary transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px] material-symbols-fill">groups</span>
              <span className="font-medium">{t('sidebar.talent_pool')}</span>
            </a>
            <a onClick={() => navigate('/settings')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all ease-out duration-200 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span>{t('nav.settings')}</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto min-h-screen">
          <div className="max-w-6xl mx-auto px-8 py-16 lg:py-24">
            
            <div className="mb-12 flex justify-between items-end">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-4 border border-primary/20">
                  <span className="material-symbols-outlined text-[14px]">public</span>
                  {t('talent.tag')}
                </div>
                <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2 font-headline">
                  {t('talent.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dim to-secondary">{t('talent.title_highlight')}</span>
                </h1>
                <p className="text-on-surface-variant text-base max-w-xl">
                  {t('talent.desc')}
                </p>
              </div>
              
              <div className="hidden md:flex relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input className="bg-surface-container-highest border border-outline-variant/15 text-on-surface text-sm rounded-full pl-9 pr-4 py-2 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none w-64 placeholder:text-on-surface-variant/50" placeholder={t('talent.search')} type="text" />
              </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-3xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
                <span className="material-symbols-outlined text-primary mb-2 text-[32px]">military_tech</span>
                <div className="text-3xl font-black text-on-surface font-headline mb-1">{t('talent.stat1_val')}</div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('talent.stat1_lbl')}</h4>
              </div>
              <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/15 shadow-sm">
                <span className="material-symbols-outlined text-secondary mb-2 text-[32px]">trending_up</span>
                <div className="text-3xl font-black text-on-surface font-headline mb-1">{t('talent.stat2_val')}</div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('talent.stat2_lbl')}</h4>
              </div>
              <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/15 shadow-sm">
                <span className="material-symbols-outlined text-tertiary mb-2 text-[32px]">visibility</span>
                <div className="text-3xl font-black text-on-surface font-headline mb-1">{t('talent.stat3_val')}</div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('talent.stat3_lbl')}</h4>
              </div>
            </div>

            {/* Candidate List */}
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/15 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="font-bold text-on-surface font-headline">{t('talent.list_title')}</h3>
                <button className="text-xs font-bold text-primary hover:text-primary-dim transition-colors uppercase tracking-widest flex items-center gap-1">
                  {t('talent.view_all')} <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                </button>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {candidates.map(candidate => (
                  <div key={candidate.id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-surface-container-highest transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline-variant/20 flex flex-shrink-0 items-center justify-center text-xl font-bold text-primary">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{candidate.name}</h4>
                      <p className="text-sm text-on-surface-variant">{candidate.role}</p>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto justify-center md:justify-end">
                      <div className="text-center">
                        <div className="text-xs text-on-surface-variant mb-1">{t('talent.ai_match')}</div>
                        <div className="font-bold text-secondary text-lg">{candidate.match}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-on-surface-variant mb-1">{t('talent.percentile')}</div>
                        <div className="font-bold text-tertiary text-sm px-2 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/20">{candidate.status}</div>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default TalentPoolPage;
