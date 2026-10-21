import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

// File này: Thanh menu bên trái (Sidebar) của ứng dụng Obsidian AI.
// Vai trò: Điều hướng giữa các phân khu (Tổng quan, Chuẩn bị phỏng vấn, Ôn luyện tài liệu/quiz, Phân tích CV, Hồ sơ năng lực, Cài đặt),
//          sử dụng 100% token ngữ nghĩa tự động chuyển đổi mượt mà giữa Light và Dark theme.
// Khi nào dùng: Luôn hiển thị ở cột bên trái trong giao diện chính.
const UserSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'overview',
      label: t('sidebar.overview') || 'Tổng quan',
      icon: 'dashboard',
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      id: 'interview_prep',
      label: t('sidebar.interview_prep') || 'Luyện Phỏng vấn',
      icon: 'mic',
      path: '/preparation',
      active: location.pathname === '/preparation'
    },
    {
      id: 'study',
      label: t('sidebar.study') || 'Trung tâm Ôn luyện',
      icon: 'menu_book',
      path: '/study',
      active: location.pathname.startsWith('/study')
    },
    {
      id: 'cv_analysis',
      label: t('sidebar.cv_analysis') || 'Hồ sơ CV',
      icon: 'description',
      path: '/vault',
      active: location.pathname === '/vault'
    },
    {
      id: 'talent_pool',
      label: t('sidebar.talent_pool') || 'Kho Nhân tài',
      icon: 'groups',
      path: '/showcase',
      active: location.pathname.startsWith('/showcase') || location.pathname.startsWith('/forum')
    },
    {
      id: 'results',
      label: t('sidebar.results') || 'Kết quả & Radar',
      icon: 'insights',
      path: '/results',
      active: location.pathname.startsWith('/results')
    },
    {
      id: 'settings',
      label: t('sidebar.settings') || 'Cài đặt',
      icon: 'settings',
      path: '/settings',
      active: location.pathname === '/settings'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-surface text-on-surface font-manrope text-sm w-full select-none transition-colors duration-200">
      {/* Brand / Cognitive Sanctuary Header */}
      <div className="px-6 py-6 flex flex-col gap-1 border-b border-outline-variant">
        <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-center mb-3 text-primary shadow-xs">
          <span className="material-symbols-outlined text-primary text-xl">psychiatry</span>
        </div>
        <h2 className="text-base font-black text-on-surface tracking-tight font-headline">
          {t('sidebar.title') || 'Thánh địa Nhận thức'}
        </h2>
        <span className="text-on-surface-variant text-xs font-medium">
          {t('sidebar.subtitle') || 'Hiệu suất Tối đa'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 mt-5 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => {
          const isActive = item.active;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm group cursor-pointer ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                  isActive ? 'text-primary material-symbols-fill' : 'text-on-surface-variant group-hover:text-on-surface group-hover:scale-105'
                }`}
              >
                {item.icon}
              </span>
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions & Support */}
      <div className="px-4 pb-6 pt-4 border-t border-outline-variant space-y-3">
        <button
          onClick={() => navigate('/preparation')}
          className="w-full bg-gradient-to-r from-primary-dim to-primary text-white font-bold py-3 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-md shadow-primary/20 hover:opacity-95 active:scale-98 group cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-white group-hover:scale-110 transition-transform">
            play_arrow
          </span>
          <span className="text-xs tracking-wider uppercase font-bold">
            {t('sidebar.start_interview') || 'Bắt đầu Phỏng vấn'}
          </span>
        </button>

        <div className="space-y-1 pt-1">
          <button
            onClick={() => navigate('/help')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all text-xs font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>{t('sidebar.help') || 'Trợ giúp & Tài liệu'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-container/20 transition-all text-xs font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>{t('sidebar.logout') || 'Đăng xuất'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
