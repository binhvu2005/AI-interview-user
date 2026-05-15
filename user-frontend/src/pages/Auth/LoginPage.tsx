import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google login failed');

        toast.success(t('notifications.login_success') || 'Login successful!');
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userName', data.user.fullName);
        if (data.user.avatar) localStorage.setItem('userAvatar', data.user.avatar);
        localStorage.setItem('isVip', data.user.isVip ? 'true' : 'false');

        setTimeout(() => navigate('/'), 1000);
      } catch (err: any) {
        toast.error(err.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: errorResponse => console.log(errorResponse),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
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
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userName', data.user.fullName);
      if (data.user.avatar) localStorage.setItem('userAvatar', data.user.avatar);
      localStorage.setItem('isVip', data.user.isVip ? 'true' : 'false');

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || t('notifications.login_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email của bạn');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi gửi yêu cầu, vui lòng thử lại');
      }

      toast.success(data.message || 'Mật khẩu mới đã được gửi đến email của bạn');
      setIsForgotPassword(false); // Quay lại màn hình đăng nhập
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface-container-low rounded-3xl p-6 sm:p-8 shadow-xl border border-outline-variant/15 relative overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-dim/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="relative z-10 text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
          <span className="material-symbols-outlined text-primary text-3xl">
            {isForgotPassword ? 'mark_email_read' : 'psychiatry'}
          </span>
        </div>
        <h2 className="text-3xl font-black text-on-surface tracking-tight font-headline">
          {isForgotPassword ? 'Quên Mật Khẩu' : t('login.title')}
        </h2>
        <p className="text-on-surface-variant text-sm mt-2">
          {isForgotPassword 
            ? 'Nhập email của bạn để nhận mật khẩu mới' 
            : t('login.subtitle')}
        </p>
      </div>

      {!isForgotPassword ? (
        // FORM ĐĂNG NHẬP
        <form onSubmit={handleLogin} className="relative z-10 space-y-6 animate-in slide-in-from-right-4 duration-300">
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
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(true)}
                className="text-xs text-primary hover:text-primary-dim transition-colors font-medium cursor-pointer"
              >
                {t('login.forgot')}
              </button>
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
          
          <div className="flex items-center my-4 before:flex-1 before:border-t before:border-outline-variant/30 after:flex-1 after:border-t after:border-outline-variant/30">
            <span className="px-3 text-xs text-on-surface-variant/70 font-medium">Hoặc</span>
          </div>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => googleLogin()}
            className="w-full bg-surface-container-high border border-outline-variant/20 text-on-surface font-headline font-bold text-base px-6 py-4 rounded-xl hover:bg-surface-container-highest transition-all duration-300 shadow-sm flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Đăng nhập bằng Google
          </button>
        </form>
      ) : (
        // FORM QUÊN MẬT KHẨU
        <form onSubmit={handleForgotPassword} className="relative z-10 space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div>
            <label className="font-headline text-sm font-semibold text-on-surface-variant mb-2 block">Email đăng nhập</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">mail</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-12 pr-4 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:bg-primary/5 transition-all outline-none placeholder:text-on-surface-variant/30"
                placeholder="Nhập email của bạn..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-dim to-primary text-white font-headline font-bold text-base px-6 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  Gửi Mật Khẩu Mới
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              disabled={loading}
              className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-headline font-bold text-base px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Quay Lại Đăng Nhập
            </button>
          </div>
        </form>
      )}

      <p className="relative z-10 text-center text-sm text-on-surface-variant mt-8">
        {t('login.no_account')} <Link to="/register" className="text-primary hover:underline font-semibold transition-colors ml-1">{t('login.signup')}</Link>
      </p>
    </div>
  );
};

export default LoginPage;
