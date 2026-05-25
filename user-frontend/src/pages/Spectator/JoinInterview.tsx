import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const JoinInterview = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  // Get current user info from localStorage
  const userName = localStorage.getItem('userName');
  const userAvatar = localStorage.getItem('userAvatar');

  useEffect(() => {
    // If not logged in, redirect to login as we need user info to join as spectator
    if (!userName) {
      toast.error('Vui lòng đăng nhập để tham gia xem phỏng vấn');
      navigate('/login');
    }
  }, [userName, navigate]);

  const handleJoin = () => {
    if (code.length !== 6) {
      toast.error(t('join.err_code'));
      return;
    }

    // Use the existing user name
    localStorage.setItem('spectator_name', userName || 'User');
    navigate(`/watch/${code.toUpperCase()}`);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-6 bg-transparent">
      <div className="max-w-md w-full bg-surface border border-outline-variant/60 rounded-xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 mx-auto bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center mb-6 shadow-sm overflow-hidden text-primary">
          {userAvatar ? (
             <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-3xl text-primary">visibility</span>
          )}
        </div>
        
        <h1 className="text-2xl font-semibold text-on-surface text-center tracking-tight mb-1.5">{t('join.title')}</h1>
        <p className="text-center text-on-surface-variant/70 text-xs font-medium mb-8">
          {t('nav.hi')}, <span className="text-primary font-semibold">{userName}</span>. {t('join.subtitle')}
        </p>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60 text-center block mb-1.5">{t('join.code_label')}</label>
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('join.code_placeholder')}
              className="form-input w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.2em] focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/20"
            />
          </div>

          <button 
            onClick={handleJoin}
            className="btn-primary w-full py-3 text-xs uppercase tracking-wider shadow-sm mt-4"
          >
            {t('join.btn_join')}
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-2.5 text-on-surface-variant/60 font-semibold text-[11px] uppercase tracking-wider hover:text-on-surface transition-colors"
          >
            {t('join.btn_back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinInterview;
