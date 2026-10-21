import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../services/api.config';
import * as NotificationService from '../services/NotificationService';
import { socketService } from '../services/socket.service';
import type { AppNotification } from '../services/NotificationService';
import { fetchWithAuth } from '../services/fetchClient';
import { Badge } from '../components/base/Badge';

const UserHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userAvatar, setUserAvatar] = useState<string | null>(localStorage.getItem('userAvatar'));
  const [isVip, setIsVip] = useState<boolean>(localStorage.getItem('isVip') === 'true');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiOpen, setNotiOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const theme = localStorage.getItem('theme');
    return theme !== 'light';
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('themeChange'));
  };

  useEffect(() => {
    const handleThemeChange = () => {
      const theme = localStorage.getItem('theme');
      setIsDark(theme === 'dark');
    };
    window.addEventListener('themeChange', handleThemeChange);
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName'));
      setUserAvatar(localStorage.getItem('userAvatar'));
      setIsVip(localStorage.getItem('isVip') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdate', handleStorageChange);

    // Sync fresh user profile state from database
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const user = data.user;
            localStorage.setItem('userName', user.fullName || '');
            localStorage.setItem('userAvatar', user.avatar || '');
            localStorage.setItem('isVip', String(user.isVip || false));
            localStorage.setItem('userId', user.id || user._id || '');
            
            // Sync with local state
            setUserName(user.fullName || '');
            setUserAvatar(user.avatar || '');
            setIsVip(user.isVip || false);
          }
        }
      } catch (err) {
        console.error('Failed to sync user profile:', err);
      }
    };

    // Initial Fetch Notifications
    const fetchNotis = async () => {
      try {
        const { notifications, unreadCount } = await NotificationService.getNotifications();
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    
    const initNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetchNotis();
      
      let userId = localStorage.getItem('userId');
      
      // Fallback: Nếu thiếu userId nhưng có token (do cache cũ), fetch lại profile
      if (!userId) {
        try {
          const res = await fetch(API_ENDPOINTS.AUTH.ME, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.user) {
            userId = data.user.id || data.user._id;
            localStorage.setItem('userId', userId!);
          }
        } catch (err) {
          console.error('Error fetching userId fallback:', err);
        }
      }

      if (userId) {
        socketService.connect();
        socketService.joinNotifications(userId);
        const cleanup = socketService.onNewNotification((newNoti) => {
          setNotifications(prev => [newNoti, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
        return cleanup;
      }
    };

    let cleanupFn: (() => void) | undefined;
    fetchUserProfile();
    initNotifications().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdate', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotiClick = async (noti: AppNotification) => {
    try {
      if (!noti.isRead) {
        await NotificationService.markAsRead(noti._id);
        setNotifications(prev => prev.map(n => n._id === noti._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotiOpen(false);
      navigate(noti.link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, { // Or use fetchWithAuth if imported
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('isVip');
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-2xl text-on-surface font-manrope border-b border-outline-variant flex justify-between items-center px-4 sm:px-8 h-16 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-dim to-primary flex items-center justify-center text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-[18px]">psychiatry</span>
          </div>
          <span className="text-lg font-black tracking-tight text-on-surface font-headline whitespace-nowrap">
            Obsidian AI
          </span>
        </div>

        {/* Primary Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              location.pathname === '/dashboard'
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">dashboard</span>
            <span>{t('nav.dashboard') || 'Tổng quan'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/preparation')}
            className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              location.pathname === '/preparation'
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">rocket_launch</span>
            <span>{t('nav.preparation') || 'Luyện phỏng vấn'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/study')}
            className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              location.pathname.startsWith('/study')
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">menu_book</span>
            <span>{t('nav.study') || 'Ôn luyện'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/forum')}
            className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              location.pathname.startsWith('/forum')
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">forum</span>
            <span>{t('forum.title') || 'Diễn đàn'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/join')}
            className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              location.pathname === '/join' || location.pathname.startsWith('/watch')
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">groups</span>
            <span>{t('nav.watch') || 'Xem phỏng vấn'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/showcase')}
            className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              location.pathname.startsWith('/showcase')
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">military_tech</span>
            <span>{t('showcase.title') || 'Kho nhân tài'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-[20px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
        {/* Search Input Bar */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            className="bg-surface-container border border-outline-variant text-on-surface text-xs rounded-full pl-9 pr-4 py-1.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none w-44 placeholder:text-on-surface-variant/50"
            placeholder={t('nav.search_placeholder') || 'Tìm kiếm vai trò, kỹ năng...'}
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/preparation?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }
            }}
          />
        </div>

        {/* Settings button */}
        <button
          onClick={() => navigate('/settings')}
          className="hidden sm:inline-flex text-on-surface-variant hover:text-on-surface transition-colors duration-200 px-2.5 py-1 text-xs font-semibold cursor-pointer"
        >
          {t('nav.settings') || 'Cài đặt'}
        </button>

        {/* Upgrade Glow Button */}
        <button
          onClick={() => navigate('/upgrade')}
          className="bg-gradient-to-r from-primary-dim to-primary text-white font-bold px-3.5 py-1.5 rounded-lg text-xs hover:scale-[1.02] active:scale-95 transition-transform duration-200 shadow-sm cursor-pointer"
        >
          {t('nav.upgrade') || 'Nâng cấp'}
        </button>

        {/* Quick Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all focus:outline-none cursor-pointer ${
            isDark
              ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setNotiOpen(!notiOpen); setDropdownOpen(false); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${notiOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${unreadCount > 0 ? 'animate-pulse' : ''}`}>notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-error text-on-error text-[8px] font-bold rounded-full flex items-center justify-center border border-background">
                {unreadCount > 9 ? '9' : unreadCount}
              </span>
            )}
          </button>

          {notiOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotiOpen(false)}></div>
              <div className="absolute top-14 right-[-60px] sm:right-0 w-[320px] sm:w-[380px] bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">{t('nav.notifications') || 'Thông báo'}</h3>
                  <button onClick={handleMarkAllRead} className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
                    {t('nav.mark_all_read') || 'Đánh dấu đã đọc tất cả'}
                  </button>
                </div>

                <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(noti => (
                      <div 
                        key={noti._id} 
                        onClick={() => handleNotiClick(noti)}
                        className={`px-5 py-4 border-b border-outline-variant/5 hover:bg-surface-container-high transition-colors cursor-pointer flex gap-4 ${!noti.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                          noti.type === 'LIKE' ? 'bg-pink-100 text-pink-500' :
                          noti.type === 'REPLY' ? 'bg-blue-100 text-blue-500' :
                          noti.type === 'INTERVIEW_COMPLETE' ? 'bg-green-100 text-green-500' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {noti.type === 'LIKE' ? 'favorite' :
                             noti.type === 'REPLY' ? 'chat' :
                             noti.type === 'INTERVIEW_COMPLETE' ? 'military_tech' : 'info'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-normal mb-1 ${noti.isRead ? 'text-on-surface-variant' : 'text-on-surface font-bold'}`}>
                            {noti.message}
                          </p>
                          <p className="text-[9px] font-medium text-on-surface-variant opacity-50 uppercase tracking-wider">
                            {new Date(noti.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!noti.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant opacity-30">
                      <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">{t('nav.no_notifications') || 'Không có thông báo'}</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-surface-container-highest/30 text-center">
                   <p className="text-[9px] font-black text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">Obsidian AI Notifications</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="hidden sm:flex flex-col items-end mr-1 justify-center">
            <span className="text-xs font-headline font-bold text-on-surface leading-tight max-w-[120px] truncate mb-1">
              {userName || 'User'}
            </span>
            {isVip ? (
              <Badge variant="vip" size="sm" icon="workspace_premium">
                VIP
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                NORMAL
              </Badge>
            )}
          </div>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 focus:outline-none bg-surface-container-high ${
              isVip 
                ? 'ring-1 ring-amber-400/40 shadow-[0_0_10px_rgba(212,175,55,0.2)] border-none' 
                : 'border border-outline-variant/25 hover:border-primary'
            }`}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName || 'U'}&background=818cf8&color=fff`} alt="avatar" className="w-full h-full object-cover rounded-lg" />
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute top-11 right-0 w-48 bg-surface-container border border-outline-variant/10 rounded-xl shadow-xl py-1.5 flex flex-col z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 border-b border-outline-variant/10 mb-1">
                  <p className="text-xs font-medium text-on-surface truncate mb-0.5">{userName}</p>
                  {isVip ? (
                    <span className="text-[8px] uppercase tracking-widest badge-vip-animated px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 leading-none">
                      <span className="material-symbols-outlined text-[9px] material-symbols-fill">workspace_premium</span> VIP
                    </span>
                  ) : (
                    <span className="text-[8px] uppercase tracking-widest badge-normal-animated px-1.5 py-0.5 rounded inline-flex leading-none">
                      NORMAL
                    </span>
                  )}
                </div>
                <a onClick={() => { setDropdownOpen(false); navigate('/profile'); }} className="px-4 py-2 text-xs text-on-surface hover:bg-white/[0.04] transition-colors flex items-center gap-2.5 cursor-pointer font-medium">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">account_circle</span> {t('nav.profile')}
                </a>
                <a onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="px-4 py-2 text-xs text-on-surface hover:bg-white/[0.04] transition-colors flex items-center gap-2.5 cursor-pointer font-medium">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">tune</span> {t('nav.settings')}
                </a>
                <div className="h-px bg-outline-variant/10 my-1 mx-4"></div>
                <button onClick={handleLogout} className="px-4 py-2 text-xs text-error hover:bg-error/10 transition-colors flex items-center gap-2.5 w-full text-left font-medium">
                  <span className="material-symbols-outlined text-[16px]">logout</span> {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </nav>

    {/* Mobile Menu Drawer (Left Side) */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-[100] md:hidden">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="fixed top-0 left-0 w-[290px] h-full bg-surface border-r border-outline-variant flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-300 z-10">
          <div className="flex items-center justify-between gap-3 mb-8 pb-5 border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">psychiatry</span>
              </div>
              <span className="text-xl font-black tracking-tight text-on-surface font-headline">
                {t('app_name') || 'Obsidian AI'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${
                location.pathname === '/dashboard' ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>{t('nav.dashboard') || 'Tổng quan'}</span>
            </button>

            <button
              type="button"
              onClick={() => { navigate('/preparation'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${
                location.pathname === '/preparation' ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              <span>{t('nav.preparation') || 'Luyện phỏng vấn'}</span>
            </button>

            <button
              type="button"
              onClick={() => { navigate('/study'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${
                location.pathname.startsWith('/study') ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span>{t('nav.study') || 'Ôn luyện'}</span>
            </button>

            <button
              type="button"
              onClick={() => { navigate('/forum'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${
                location.pathname.startsWith('/forum') ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">forum</span>
              <span>{t('forum.title') || 'Diễn đàn'}</span>
            </button>

            <button
              type="button"
              onClick={() => { navigate('/join'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${
                location.pathname === '/join' || location.pathname.startsWith('/watch') ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">groups</span>
              <span>{t('nav.watch') || 'Xem phỏng vấn'}</span>
            </button>

            <button
              type="button"
              onClick={() => { navigate('/showcase'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${
                location.pathname.startsWith('/showcase') ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
              <span>{t('showcase.title') || 'Kho nhân tài'}</span>
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => { navigate('/upgrade'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-gradient-to-r from-primary to-primary-dim text-white rounded-xl font-extrabold uppercase tracking-wider text-xs shadow-md shadow-primary/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              <span>{t('nav.upgrade') || 'Nâng cấp'}</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default UserHeader;
