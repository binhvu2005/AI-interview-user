import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language.startsWith('vi');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24 mt-4">
        {/* Text Side */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {t('dashboard.tag')}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-on-surface tracking-tighter leading-[1.05] mb-6 font-headline">
            {t('dashboard.title1')} <br /> {t('dashboard.title2')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dim to-secondary">{t('dashboard.title3')}</span> <br />
            {t('dashboard.title4')}
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-8">
            {t('dashboard.desc')}
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/preparation')} className="bg-primary text-on-primary font-bold px-8 py-4 rounded-xl hover:bg-primary-dim transition-colors shadow-[0_0_20px_rgba(163,166,255,0.2)] flex items-center gap-2">
              {t('dashboard.btn_start')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button className="bg-surface-container-high text-on-surface border border-outline-variant/20 font-bold px-8 py-4 rounded-xl hover:bg-surface-container-highest transition-colors">
              {t('dashboard.btn_demo')}
            </button>
          </div>
        </div>

        {/* Image Side */}
        <div className="relative lg:h-[500px]">
          {/* Glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10 w-full h-full bg-surface-container-lowest border border-outline-variant/15 rounded-3xl shadow-2xl overflow-hidden p-2">
            <div className="w-full h-full bg-surface-container-low rounded-2xl overflow-hidden relative border border-outline-variant/10">
              {/* Fake Browser Interface */}
              <div className="absolute inset-0 bg-background flex flex-col">
                <div className="h-10 border-b border-outline-variant/10 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5"></div>
                  <img alt="App Interface Demo" className="w-[120%] opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD32B3zsG7GlRzewrExD_1b0nFeHX8LOCFNWFWhyXhMQ9H-ZgG4l_fjlUIFHoCZo4PHeZKmPhBKU4-cRKl6nYxpfXaFxK2YM9Q-7zsCBvm_CTT-1vZLMrAFpievj5nGDc7FarPZDMF1fcR4HJuazMmJrHiTJZDpZpdX2uEra0sSZWPlNC34-8VIXlYfY6g8lQ-JC77jcRcckAMqvbfFpVY3nkcRpB1oYWqiA0tDgcv3xWbCUudreSOGbVn24EYDRqLN1Wi13_UabU57" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -bottom-6 -left-6 bg-surface-container-high border border-outline-variant/20 rounded-2xl p-4 shadow-xl flex items-center gap-4 z-20 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">mic</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">{t('dashboard.score_title')}</h4>
              <p className="text-xs text-on-surface-variant font-medium"><span className="text-primary">94%</span> — {t('dashboard.score_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Precision Engineering Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-black text-on-surface tracking-tight mb-4 font-headline">{t('dashboard.section_title')}</h2>
        <p className="text-on-surface-variant text-base max-w-2xl mx-auto">
          {t('dashboard.section_desc')}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/15 hover:border-primary/30 transition-colors shadow-sm group">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-6 text-on-surface-variant group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">forum</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3 font-headline">{t('dashboard.card1_title')}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8">{t('dashboard.card1_desc')}</p>
          <div className="flex items-end gap-1.5 h-12">
            <div className="w-2 bg-primary/30 rounded-full animate-pulse" style={{ height: '40%' }}></div>
            <div className="w-2 bg-primary/50 rounded-full animate-pulse" style={{ height: '70%' }}></div>
            <div className="w-2 bg-primary/70 rounded-full animate-pulse" style={{ height: '100%' }}></div>
            <div className="w-2 bg-secondary/50 rounded-full animate-pulse" style={{ height: '60%' }}></div>
            <div className="w-2 bg-secondary/30 rounded-full animate-pulse" style={{ height: '80%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/15 hover:border-primary/30 transition-colors shadow-sm flex flex-col group">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-6 text-on-surface-variant group-hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[24px]">document_scanner</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3 font-headline">{t('dashboard.card2_title')}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8">{t('dashboard.card2_desc')}</p>
          <div className="mt-auto bg-surface-container-highest rounded-xl p-4 flex justify-between items-center border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Match Score</span>
            <span className="text-2xl font-black text-secondary font-headline">87%</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/15 hover:border-primary/30 transition-colors shadow-sm flex flex-col md:flex-row items-center gap-8 group">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-tertiary text-[28px]">auto_graph</span>
              <h3 className="text-xl font-bold text-on-surface font-headline">{t('dashboard.card3_title')}</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">{t('dashboard.card3_desc')}</p>
          </div>
          <div className="w-full md:w-80 bg-background border border-outline-variant/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
            <span className="text-[10px] font-black text-secondary tracking-widest uppercase mb-2 block">{t('dashboard.insight_title')}</span>
            <p className="text-xs text-on-surface-variant italic">{t('dashboard.insight_desc')}</p>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="flex justify-between items-center mb-12">
        <h3 className="text-2xl font-black text-on-surface tracking-tight font-headline">{isVi ? 'Hoạt động của bạn' : 'Your Activity'}</h3>
        <button onClick={() => navigate('/results')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
          {isVi ? 'Xem toàn bộ lịch sử' : 'View full history'}
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </button>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DashboardPage;
