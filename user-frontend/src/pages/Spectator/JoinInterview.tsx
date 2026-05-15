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
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-surface-container-low border border-outline-variant/20 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-primary to-secondary rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 overflow-hidden">
          {userAvatar ? (
             <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-4xl text-white">visibility</span>
          )}
        </div>
        
        <h1 className="text-3xl font-black text-on-surface text-center tracking-tighter mb-2">{t('join.title')}</h1>
        <p className="text-center text-on-surface-variant text-sm font-medium opacity-70 mb-10">
          {t('nav.hi')}, <span className="text-primary font-black">{userName}</span>. {t('join.subtitle')}
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">{t('join.code_label')}</label>
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('join.code_placeholder')}
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-6 py-4 text-center text-3xl font-black tracking-[0.3em] text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface-variant/20"
            />
          </div>

          <button 
            onClick={handleJoin}
            className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 shadow-lg shadow-primary/20 mt-4"
          >
            {t('join.btn_join')}
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:text-on-surface transition-colors"
          >
            {t('join.btn_back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinInterview;
