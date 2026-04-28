import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('notifications.register_error'));
      }

      toast.success(t('notifications.register_success'));
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || t('notifications.register_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface-container-low rounded-3xl p-8 shadow-xl border border-outline-variant/15 relative overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-dim/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="relative z-10 text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-4 shadow-lg">
          <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
        </div>
        <h2 className="text-3xl font-black text-on-surface tracking-tight font-headline">{t('register.title')}</h2>
        <p className="text-on-surface-variant text-sm mt-2">{t('register.subtitle')}</p>
      </div>

      <form onSubmit={handleRegister} className="relative z-10 space-y-6">
        <div>
          <label className="font-headline text-sm font-semibold text-on-surface-variant mb-2 block">{t('register.fullname')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">person</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-12 pr-4 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:bg-primary/5 transition-all outline-none placeholder:text-on-surface-variant/30"
              placeholder={t('register.fullname_placeholder')}
            />
          </div>
        </div>

        <div>
          <label className="font-headline text-sm font-semibold text-on-surface-variant mb-2 block">{t('register.email')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">mail</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-12 pr-4 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:bg-primary/5 transition-all outline-none placeholder:text-on-surface-variant/30"
              placeholder={t('register.email_placeholder')}
            />
          </div>
        </div>

        <div>
          <label className="font-headline text-sm font-semibold text-on-surface-variant mb-2 block">{t('register.password')}</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] group-focus-within:text-primary transition-colors">lock</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/15 text-on-surface text-sm rounded-xl pl-12 pr-4 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:bg-primary/5 transition-all outline-none placeholder:text-on-surface-variant/30"
              placeholder="••••••••"
            />
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
              {t('register.btn')}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <p className="relative z-10 text-center text-sm text-on-surface-variant mt-8">
        {t('register.has_account')} <Link to="/login" className="text-primary hover:underline font-semibold transition-colors ml-1">{t('register.signin')}</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
