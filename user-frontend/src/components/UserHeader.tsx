import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const UserHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userAvatar, setUserAvatar] = useState<string | null>(localStorage.getItem('userAvatar'));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName'));
      setUserAvatar(localStorage.getItem('userAvatar'));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdate', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdate', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl text-primary font-manrope tracking-tight shadow-sm border-b border-outline-variant/5 flex justify-between items-center px-8 h-16">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-primary text-2xl group-hover:rotate-12 transition-transform duration-300">seedling</span>
          <span className="text-xl font-bold tracking-tighter text-on-surface">AI Interview</span>
        </div>
        <div className="flex gap-6 items-center">
          <a onClick={() => navigate('/dashboard')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.dashboard')}</a>
          <a onClick={() => navigate('/preparation')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer">{t('nav.preparation')}</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-3 relative ml-4">
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50 leading-none mb-1">
              {t('nav.greeting')}
            </span>
            <span className="text-sm font-bold text-on-surface leading-none max-w-[120px] truncate">
              {userName || 'User'}
            </span>
          </div>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-10 h-10 rounded-2xl overflow-hidden border border-outline-variant/30 hover:border-primary transition-all focus:outline-none bg-surface-container-high ring-2 ring-transparent hover:ring-primary/20 shadow-lg">
            <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName || 'U'}&background=6366f1&color=fff`} alt="avatar" className="w-full h-full object-cover" />
          </button>
          
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute top-14 right-0 w-56 bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-outline-variant/10 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mb-1">{t('nav.greeting')}</p>
                  <p className="text-xs font-bold text-on-surface truncate">{userName}</p>
                </div>
                <a onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="px-4 py-2.5 text-xs text-on-surface hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span> {t('nav.profile')}
                </a>
                <a onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="px-4 py-2.5 text-xs text-on-surface hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 cursor-pointer font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[20px]">tune</span> {t('nav.settings')}
                </a>
                <div className="h-px bg-outline-variant/10 my-1 mx-4"></div>
                <button onClick={handleLogout} className="px-4 py-2.5 text-xs text-error hover:bg-error/10 transition-colors flex items-center gap-3 w-full text-left font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[20px]">logout</span> {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
