import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const currentLang = i18n.language.startsWith('vi') ? 'vi' : 'en';

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2">Cài đặt hệ thống</h1>
        <p className="text-sm text-on-surface-variant font-medium opacity-70">Tùy chỉnh trải nghiệm sử dụng ứng dụng của bạn.</p>
      </header>

      <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 shadow-xl space-y-4">

        {/* Theme */}
        <div className="flex items-center justify-between p-6 bg-surface-container rounded-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-2xl">{isDark ? 'dark_mode' : 'light_mode'}</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Chế độ hiển thị</h4>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">Chuyển đổi giữa giao diện Sáng và Tối.</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner ${isDark ? 'bg-primary' : 'bg-surface-container-highest'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white absolute top-1 shadow-md transition-all duration-500 transform ${isDark ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between p-6 bg-surface-container rounded-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-2xl">language</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Ngôn ngữ</h4>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">Chọn ngôn ngữ hiển thị cho toàn bộ ứng dụng.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('vi')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                currentLang === 'vi'
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                currentLang === 'en'
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Notifications (disabled) */}
        <div className="flex items-center justify-between p-6 bg-surface-container rounded-2xl border border-outline-variant/10 opacity-40 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Thông báo email</h4>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">Nhận thông báo về kết quả phỏng vấn qua email.</p>
            </div>
          </div>
          <div className="w-14 h-8 rounded-full bg-surface-container-highest flex items-center px-1">
            <div className="w-6 h-6 rounded-full bg-white/50"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
