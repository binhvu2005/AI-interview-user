import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isVip, setIsVip] = useState(localStorage.getItem('isVip') === 'true');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(API_ENDPOINTS.AUTH.ME, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmailNotifications(data.emailNotifications || false);
          setIsVip(data.isVip || false);
        }
      } catch (err) {
        console.error('Failed to fetch user settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const toggleEmailNotifications = async () => {
    if (!isVip) {
      toast.error(isVi ? 'Tính năng này chỉ dành cho thành viên VIP' : 'This feature is for VIP members only');
      return;
    }
    const next = !emailNotifications;
    setEmailNotifications(next);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailNotifications: next })
      });
      toast.success(isVi ? 'Đã cập nhật cài đặt thông báo' : 'Notification settings updated');
    } catch (err) {
      toast.error(isVi ? 'Lỗi khi cập nhật cài đặt' : 'Error updating settings');
      setEmailNotifications(!next);
    }
  };




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
  const isVi = currentLang === 'vi';
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
        <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-3 font-headline">{t('settings.title')}</h1>
        <p className="text-sm text-on-surface-variant font-medium opacity-60 max-w-xl leading-relaxed">{t('settings.desc')}</p>
      </header>

      <div className="space-y-6">
        {/* Appearance Group */}
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-2 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">{isVi ? 'GIAO DIỆN' : 'APPEARANCE'}</h3>
          </div>

          <div className="p-4 space-y-2">
            {/* Theme Toggle Card */}
            <div className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDark ? 'bg-primary/10 text-primary' : 'bg-amber-400/10 text-amber-500'}`}>
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
                    {isDark ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{t('settings.darkmode')}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium opacity-70">{t('settings.darkmode_desc')}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${isDark ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white absolute top-1 shadow-md transition-all duration-500 transform flex items-center justify-center ${isDark ? 'translate-x-7' : 'translate-x-1'}`}>
                  <span className="material-symbols-outlined text-[14px] text-primary opacity-0 group-hover/toggle:opacity-100 transition-opacity">
                    {isDark ? 'check' : 'circle'}
                  </span>
                </div>
              </button>
            </div>

            {/* Language Selection Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all duration-300 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-2xl">language</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{t('settings.language')}</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium opacity-70">{t('settings.language_desc')}</p>
                </div>
              </div>
              <div className="flex bg-surface-container-high p-1 rounded-xl border border-outline-variant/10">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${currentLang === 'vi'
                      ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-primary/10'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  <span className="text-base">🇻🇳</span>
                  TIẾNG VIỆT
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${currentLang === 'en'
                      ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-primary/10'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  <span className="text-base">🇬🇧</span>
                  ENGLISH
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Group */}
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-2 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">{isVi ? 'THÔNG BÁO' : 'NOTIFICATIONS'}</h3>
          </div>

          <div className="p-4">
            <div className={`flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 transition-all duration-300 ${!isVip ? 'opacity-70 cursor-not-allowed grayscale' : 'hover:border-primary/30 group'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${emailNotifications ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">notifications_active</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    {t('settings.email_notif')}
                    {!isVip && <span className="text-[9px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter font-black">VIP ONLY</span>}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium opacity-70">{t('settings.email_notif_desc')}</p>
                </div>
              </div>
              <button
                onClick={toggleEmailNotifications}
                disabled={!isVip}
                className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner group/toggle ${emailNotifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white absolute top-1 shadow-md transition-all duration-500 transform flex items-center justify-center ${emailNotifications ? 'translate-x-7' : 'translate-x-1'}`}>
                  <span className="material-symbols-outlined text-[14px] text-primary opacity-0 group-hover/toggle:opacity-100 transition-opacity">
                    {emailNotifications ? 'check' : 'close'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Account Safety Info */}
        <div className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-[32px] flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl text-primary">security</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-1">{isVi ? 'Bảo mật tài khoản' : 'Account Security'}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed opacity-70">
              {isVi
                ? 'Chúng tôi sử dụng mã hóa đầu cuối để bảo vệ dữ liệu phỏng vấn và thông tin cá nhân của bạn. Bạn có thể đổi mật khẩu trong mục Hồ sơ.'
                : 'We use end-to-end encryption to protect your interview data and personal info. Change your password in the Profile section.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="md:ml-auto px-6 py-3 bg-surface-container-high text-on-surface rounded-xl text-[10px] font-black uppercase tracking-widest border border-outline-variant/10 hover:bg-primary hover:text-on-primary transition-all whitespace-nowrap"
          >
            {isVi ? 'ĐẾN HỒ SƠ' : 'GO TO PROFILE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
