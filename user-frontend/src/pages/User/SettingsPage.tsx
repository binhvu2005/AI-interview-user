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
    <div className="max-w-4xl pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/[0.01] blur-[80px] rounded-full pointer-events-none"></div>
        <h1 className="text-3xl font-semibold text-on-surface tracking-tight mb-2 font-sans">{t('settings.title')}</h1>
        <p className="text-sm text-on-surface-variant/70 font-medium max-w-xl leading-relaxed">{t('settings.desc')}</p>
      </header>

      <div className="space-y-6">
        {/* Appearance Group */}
        <div className="bg-[#09090b]/40 backdrop-blur-md border border-white/[0.06] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-3.5 border-b border-white/[0.06] bg-[#121214]/30">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/60">{isVi ? 'GIAO DIỆN' : 'APPEARANCE'}</h3>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {/* Theme Toggle Card */}
            <div className="flex items-center justify-between p-5 bg-transparent group transition-all duration-300 hover:bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${isDark ? 'bg-white/[0.04] text-white border-white/[0.08]' : 'bg-amber-400/5 text-amber-500 border-amber-500/10'}`}>
                  <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
                    {isDark ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-on-surface">{t('settings.darkmode')}</h4>
                  <p className="text-[11px] text-on-surface-variant/60 mt-0.5 font-medium">{t('settings.darkmode_desc')}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-9 h-5 rounded-full relative transition-all duration-200 border border-transparent ${isDark ? 'bg-white' : 'bg-white/[0.08] border-white/[0.08]'}`}
              >
                <div className={`w-4 h-4 rounded-full absolute top-[2px] transition-transform duration-200 ${isDark ? 'translate-x-[18px] bg-black' : 'translate-x-[2px] bg-white/60'}`} />
              </button>
            </div>

            {/* Language Selection Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-transparent group transition-all duration-300 hover:bg-white/[0.01] gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-xl">language</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-on-surface">{t('settings.language')}</h4>
                  <p className="text-[11px] text-on-surface-variant/60 mt-0.5 font-medium">{t('settings.language_desc')}</p>
                </div>
              </div>
              <div className="flex bg-[#121214] p-1 rounded-lg border border-white/[0.06]">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`px-3 py-1 text-[11px] font-semibold tracking-wide rounded-md transition-all flex items-center gap-1.5 ${currentLang === 'vi'
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'text-on-surface-variant/50 hover:text-on-surface'
                    }`}
                >
                  <span className="text-sm">🇻🇳</span>
                  TIẾNG VIỆT
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-[11px] font-semibold tracking-wide rounded-md transition-all flex items-center gap-1.5 ${currentLang === 'en'
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'text-on-surface-variant/50 hover:text-on-surface'
                    }`}
                >
                  <span className="text-sm">🇬🇧</span>
                  ENGLISH
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Group */}
        <div className="bg-[#09090b]/40 backdrop-blur-md border border-white/[0.06] rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-3.5 border-b border-white/[0.06] bg-[#121214]/30">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/60">{isVi ? 'THÔNG BÁO' : 'NOTIFICATIONS'}</h3>
          </div>

          <div className="p-5">
            <div className={`flex items-center justify-between bg-transparent transition-all duration-300 ${!isVip ? 'opacity-50 cursor-not-allowed grayscale' : 'group'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${emailNotifications ? 'bg-white/[0.04] text-white border-white/[0.08]' : 'bg-white/[0.01] text-on-surface-variant/60 border-white/[0.04]'}`}>
                  <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">notifications_active</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-on-surface flex items-center gap-2">
                    {t('settings.email_notif')}
                    {!isVip && <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold tracking-wider">VIP ONLY</span>}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant/60 mt-0.5 font-medium">{t('settings.email_notif_desc')}</p>
                </div>
              </div>
              <button
                onClick={toggleEmailNotifications}
                disabled={!isVip}
                className={`w-9 h-5 rounded-full relative transition-all duration-200 border border-transparent ${emailNotifications ? 'bg-white' : 'bg-white/[0.08] border-white/[0.08]'}`}
              >
                <div className={`w-4 h-4 rounded-full absolute top-[2px] transition-transform duration-200 ${emailNotifications ? 'translate-x-[18px] bg-black' : 'translate-x-[2px] bg-white/60'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Account Safety Info */}
        <div className="p-6 bg-[#09090b]/30 border border-white/[0.06] rounded-xl flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-white">
            <span className="material-symbols-outlined text-xl">security</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-on-surface mb-1">{isVi ? 'Bảo mật tài khoản' : 'Account Security'}</h4>
            <p className="text-xs text-on-surface-variant/60 leading-relaxed">
              {isVi
                ? 'Chúng tôi sử dụng mã hóa đầu cuối để bảo vệ dữ liệu phỏng vấn và thông tin cá nhân của bạn. Bạn có thể đổi mật khẩu trong mục Hồ sơ.'
                : 'We use end-to-end encryption to protect your interview data and personal info. Change your password in the Profile section.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="md:ml-auto px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap active:scale-[0.98]"
          >
            {isVi ? 'ĐẾN HỒ SƠ' : 'GO TO PROFILE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
