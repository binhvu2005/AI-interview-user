import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const UserHeader = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const avatar = localStorage.getItem('userAvatar');
    if (name) setUserName(name);
    if (avatar) setUserAvatar(avatar);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('en') ? 'vi' : 'en');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    navigate('/login');
  };

  const firstName = userName ? userName.trim().split(/\s+/).pop() : '';

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl text-primary font-manrope tracking-tight shadow-md border-b border-outline-variant/15 flex justify-between items-center px-8 h-16">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-on-surface cursor-pointer" onClick={() => navigate('/')}>{t('app_name') || 'Obsidian AI'}</span>
        <div className="flex gap-6 items-center">
          <a onClick={() => navigate('/dashboard')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.dashboard')}</a>
          <a onClick={() => navigate('/preparation')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.preparation')}</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 ml-2 w-10 h-10" title="Toggle Theme">
          <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <div className="flex items-center gap-4 relative ml-2">
          <span className="text-on-surface font-medium hidden md:block">
            {firstName ? `${t('nav.hi')}, ${firstName}` : t('nav.hi')}
          </span>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors focus:outline-none">
            <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName || 'U'}&background=6366f1&color=fff`} alt="avatar" className="w-full h-full object-cover" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-12 right-0 w-52 bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-lg py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
              <a onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer font-medium">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span> {t('nav.profile')}
              </a>
              <a onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer font-medium">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span> Cài đặt
              </a>
              <div className="h-px bg-outline-variant/15 my-1"></div>
              <button onClick={handleLogout} className="px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2 w-full text-left font-medium">
                <span className="material-symbols-outlined text-[18px]">logout</span> {t('sidebar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
