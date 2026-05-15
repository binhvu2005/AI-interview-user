import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../services/api.config';
import * as NotificationService from '../services/NotificationService';
import { socketService } from '../services/socket.service';
import type { AppNotification } from '../services/NotificationService';

const UserHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userAvatar, setUserAvatar] = useState<string | null>(localStorage.getItem('userAvatar'));
  const [isVip, setIsVip] = useState<boolean>(localStorage.getItem('isVip') === 'true');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiOpen, setNotiOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName'));
      setUserAvatar(localStorage.getItem('userAvatar'));
      setIsVip(localStorage.getItem('isVip') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdate', handleStorageChange);

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
    initNotifications().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdate', handleStorageChange);
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
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl text-primary font-manrope tracking-tight shadow-sm border-b border-outline-variant/5 flex justify-between items-center px-8 h-16">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">psychiatry</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-on-surface">
              {t('app_name') || 'Obsidian AI'}
            </span>
          </div>
        </div>
        <div className="flex gap-8 items-center ml-4">
          <a onClick={() => navigate('/dashboard')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer font-bold text-sm uppercase tracking-widest">{t('nav.dashboard')}</a>
          <a onClick={() => navigate('/preparation')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer font-bold text-sm uppercase tracking-widest">{t('nav.preparation')}</a>
          <a onClick={() => navigate('/forum')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer font-bold text-sm uppercase tracking-widest">{t('forum.title')}</a>
          <a onClick={() => navigate('/showcase')} className="text-on-surface-variant hover:text-on-surface transition-colors duration-300 cursor-pointer font-bold text-sm uppercase tracking-widest">{t('showcase.title')}</a>
          <a onClick={() => navigate('/upgrade')} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-on-primary transition-all duration-300 flex items-center gap-1.5 group cursor-pointer">
            <span className="material-symbols-outlined text-[16px] animate-pulse">workspace_premium</span>
            {t('nav.upgrade')}
          </a>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="sm:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-all focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="material-symbols-outlined text-[24px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setNotiOpen(!notiOpen); setDropdownOpen(false); }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${notiOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${unreadCount > 0 ? 'animate-pulse' : ''}`}>notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[10px] font-black rounded-full flex items-center justify-center border-2 border-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
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
          <div className="flex flex-col items-end mr-1 justify-center">
            <span className="text-sm font-bold text-on-surface leading-tight max-w-[120px] truncate mb-1">
              {userName || 'User'}
            </span>
            {isVip ? (
              <span className="text-[9px] uppercase tracking-widest badge-vip-animated px-2 py-0.5 rounded-full flex items-center gap-0.5 leading-none shadow-sm shadow-yellow-500/20">
                <span className="material-symbols-outlined text-[10px] material-symbols-fill">workspace_premium</span> VIP MEMBER
              </span>
            ) : (
              <span className="text-[9px] uppercase tracking-widest badge-normal-animated px-2 py-0.5 rounded-full flex items-center leading-none shadow-sm">
                NORMAL
              </span>
            )}
          </div>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-10 h-10 rounded-2xl overflow-hidden border border-outline-variant/30 hover:border-primary transition-all focus:outline-none bg-surface-container-high ring-2 ring-transparent hover:ring-primary/20 shadow-lg">
            <img src={userAvatar || `https://ui-avatars.com/api/?name=${userName || 'U'}&background=6366f1&color=fff`} alt="avatar" className="w-full h-full object-cover" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute top-14 right-0 w-56 bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-outline-variant/10 mb-1">
                  <p className="text-xs font-bold text-on-surface truncate mb-1">{userName}</p>
                  {isVip ? (
                    <span className="text-[9px] uppercase tracking-widest badge-vip-animated px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 leading-none">
                      <span className="material-symbols-outlined text-[10px] material-symbols-fill">workspace_premium</span> VIP
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase tracking-widest badge-normal-animated px-2 py-0.5 rounded-full inline-flex leading-none">
                      NORMAL
                    </span>
                  )}
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

      {/* Mobile Menu Drawer (Left Side) */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] sm:hidden" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 w-[280px] h-full bg-surface-container-low border-r border-outline-variant/15 flex flex-col p-6 z-[70] sm:hidden animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-outline-variant/10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">psychiatry</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-on-surface">
                {t('app_name') || 'Obsidian AI'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <a onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className={`flex items-center gap-4 py-4 px-4 rounded-2xl font-bold transition-all ${location.pathname === '/dashboard' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface hover:bg-surface-container-high'}`}>
                <span className="material-symbols-outlined">dashboard</span> {t('nav.dashboard')}
              </a>
              <a onClick={() => { navigate('/preparation'); setMobileMenuOpen(false); }} className={`flex items-center gap-4 py-4 px-4 rounded-2xl font-bold transition-all ${location.pathname === '/preparation' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface hover:bg-surface-container-high'}`}>
                <span className="material-symbols-outlined">rocket_launch</span> {t('nav.preparation')}
              </a>
              <a onClick={() => { navigate('/forum'); setMobileMenuOpen(false); }} className={`flex items-center gap-4 py-4 px-4 rounded-2xl font-bold transition-all ${location.pathname.startsWith('/forum') ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface hover:bg-surface-container-high'}`}>
                <span className="material-symbols-outlined">forum</span> {t('forum.title')}
              </a>
              <a onClick={() => { navigate('/showcase'); setMobileMenuOpen(false); }} className={`flex items-center gap-4 py-4 px-4 rounded-2xl font-bold transition-all ${location.pathname === '/showcase' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface hover:bg-surface-container-high'}`}>
                <span className="material-symbols-outlined">military_tech</span> {t('showcase.title')}
              </a>
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/10">
              <a onClick={() => { navigate('/upgrade'); setMobileMenuOpen(false); }} className="flex items-center gap-3 py-5 px-4 bg-primary/10 text-primary rounded-2xl font-black uppercase tracking-widest text-[11px] border border-primary/20">
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                {t('nav.upgrade')}
              </a>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default UserHeader;
