import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const AuthLayout = () => {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
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
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <Toaster position="top-right" />

      {/* Navbar for Auth pages */}
      <nav className="w-full bg-surface/80 backdrop-blur-2xl text-primary font-manrope tracking-tight shadow-sm border-b border-outline-variant/15 flex justify-between items-center px-8 h-16">
        <span className="text-xl font-bold tracking-tighter text-on-surface">{t('app_name')}</span>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="text-on-surface-variant hover:text-primary font-bold transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 uppercase text-xs w-10 h-10" title="Toggle Language">
            {i18n.language === 'en' ? 'EN' : 'VI'}
          </button>
          <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors duration-300 p-2 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 w-10 h-10" title="Toggle Theme">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
