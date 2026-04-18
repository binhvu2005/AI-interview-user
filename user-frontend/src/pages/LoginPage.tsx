import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || t('notifications.login_error'));
      }
      
      toast.success(t('notifications.login_success'));
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.fullName);
      
      // Short delay for user to see the success toast
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || t('notifications.login_error'));
    } finally {
      setLoading(false);
    }
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
        <div className="w-full max-w-md bg-surface-container-low rounded-3xl p-8 shadow-xl border border-outline-variant/15 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-dim/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-primary text-3xl">psychiatry</span>
          </div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight font-headline">{t('login.title')}</h2>
          <p className="text-on-surface-variant text-sm mt-2">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 space-y-6">
          <div>
            <label className="font-headline text-sm font-semibold text-on-surface-variant mb-2 block">{t('login.email')}</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">mail</span>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                required 
                className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-12 pr-4 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:bg-primary/5 transition-all outline-none placeholder:text-on-surface-variant/30" 
                placeholder={t('login.email_placeholder')} 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-headline text-sm font-semibold text-on-surface-variant">{t('login.password')}</label>
              <a href="#" className="text-xs text-primary hover:text-primary-dim transition-colors font-medium">{t('login.forgot')}</a>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">lock</span>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-12 pr-12 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:bg-primary/5 transition-all outline-none placeholder:text-on-surface-variant/30" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-dim to-primary text-white font-headline font-bold text-base px-6 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <>
                {t('login.btn')}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="relative z-10 text-center text-sm text-on-surface-variant mt-8">
          {t('login.no_account')} <Link to="/register" className="text-primary hover:underline font-semibold transition-colors ml-1">{t('login.signup')}</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
