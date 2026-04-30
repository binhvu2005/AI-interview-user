import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../services/api.config';

import type { Evaluation, Interview } from '../../types';

const ITEMS_PER_PAGE = 8;

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [page, setPage] = useState(1);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchDetail(id);
    } else {
      fetchList();
    }
  }, [id]);

  const fetchDetail = async (resultId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.INTERVIEWS.GET_ONE(resultId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterview(data);

        // Check if we should show congrats modal
        if (data.evaluation?.totalScore >= 80 && !data.isPublic) {
          const shownKey = `congrats_shown_${data._id}`;
          if (!localStorage.getItem(shownKey)) {
            setShowCongrats(true);
          }
        }
      } else {
        toast.error(t('notifications.error_generic'));
        navigate('/results');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.INTERVIEWS.GET_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (err) {
      toast.error(t('notifications.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!interview) return;
    setIsSharing(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_ENDPOINTS.INTERVIEWS.GET_ALL; 
      const res = await fetch(`${baseUrl}/${interview._id}/share`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setInterview({ ...interview, isPublic: data.isPublic });
        toast.success(data.isPublic 
          ? (t('showcase.shared_success') || 'Đã chia sẻ bài phỏng vấn lên Showcase!') 
          : (t('showcase.unshared_success') || 'Đã gỡ bài phỏng vấn khỏi Showcase!'));
      } else {
        toast.error('Failed to update share status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error sharing interview');
    } finally {
      setIsSharing(false);
    }
  };

  const closeCongratsModal = () => {
    if (interview) {
      localStorage.setItem(`congrats_shown_${interview._id}`, 'true');
    }
    setShowCongrats(false);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSortBy('date_desc');
    setPage(1);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
        <p className="text-on-surface-variant font-medium">{t('results.loading')}</p>
      </div>
    </div>
  );

  // --- LIST VIEW ---
  if (!id || id === 'undefined') {
    // 1. Filter (Search in both Position and Level)
    let processed = interviews.filter(int => {
      const search = searchTerm.toLowerCase();
      return int.position.toLowerCase().includes(search) || int.level.toLowerCase().includes(search);
    });

    // 2. Sort
    processed.sort((a, b) => {
      const totalA = Math.round(((a.matchScore + (a.evaluation?.totalScore || 0)) / 2));
      const totalB = Math.round(((b.matchScore + (b.evaluation?.totalScore || 0)) / 2));

      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'score_desc') return totalB - totalA;
      if (sortBy === 'score_asc') return totalA - totalB;
      return 0;
    });

    const paginated = processed.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);

    // Compute Metrics
    const totalInterviewsCount = interviews.length;
    const avgScore = totalInterviewsCount > 0 
      ? Math.round(interviews.reduce((acc, curr) => acc + (curr.evaluation?.totalScore || 0), 0) / totalInterviewsCount)
      : 0;
    const avgMatchRate = totalInterviewsCount > 0
      ? Math.round(interviews.reduce((acc, curr) => acc + curr.matchScore, 0) / totalInterviewsCount)
      : 0;

    // Dummy values for +x this week or percentile, can be made real later if there's backend logic.
    // For now we just check if there's anything this week to simulate it.
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCount = interviews.filter(i => new Date(i.createdAt) > oneWeekAgo).length;

    return (
      <div className="max-w-6xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-on-surface tracking-tighter mb-2">
              {t('results.title')}
            </h1>
            <p className="text-sm text-on-surface-variant font-medium opacity-70">
              {t('results.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Unified Search (Position or Level) */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm opacity-50">search</span>
              <input
                type="text"
                placeholder={t('results.search_placeholder')}
                className="pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface focus:border-primary transition-all outline-none min-w-[240px]"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>

            {/* Sorting */}
            <select
              className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface focus:border-primary outline-none transition-all cursor-pointer"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
            >
              <option value="date_desc">{t('results.sort_newest')}</option>
              <option value="date_asc">{t('results.sort_oldest')}</option>
              <option value="score_desc">{t('results.sort_highest')}</option>
              <option value="score_asc">{t('results.sort_lowest')}</option>
            </select>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant border border-outline-variant/10 flex items-center justify-center hover:bg-outline-variant/20 transition-all"
              title={t('results.sort_newest')}
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
          </div>
        </header>

        {/* Dashboard Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Total Interviews */}
          <div className="bg-[#111115] border border-outline-variant/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#2A2B3D] text-[#818CF8] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
              </div>
              <span className="text-[#9CA3AF] text-sm font-medium">{t('results.total_interviews') || 'Total Interviews'}</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">{totalInterviewsCount}</div>
              <div className="flex items-center gap-1 text-[#F472B6] text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +{recentCount} {t('results.this_week') || 'this week'}
              </div>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-[#111115] border border-outline-variant/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#2A2B3D] text-[#60A5FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">psychiatry</span>
              </div>
              <span className="text-[#9CA3AF] text-sm font-medium">{t('results.average_score') || 'Average Score'}</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">{avgScore} <span className="text-xl text-[#6B7280]">/100</span></div>
              <div className="flex items-center gap-1 text-[#60A5FA] text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">show_chart</span>
                {avgScore >= 80 ? 'Top 15% of cohort' : 'Average range'}
              </div>
            </div>
          </div>

          {/* Card 3: Match Rate */}
          <div className="bg-[#19181E] border border-outline-variant/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2D2A43] text-[#A78BFA] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                </div>
                <span className="text-[#9CA3AF] text-sm font-medium">{t('results.match_rate') || 'Match Rate (CV vs JD)'}</span>
              </div>
              <span className="bg-[#2D2A43] text-[#A78BFA] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                CURRENT TARGET
              </span>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-3">{avgMatchRate}%</div>
              <div className="w-full h-1.5 bg-[#2A2B3D] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#A78BFA] rounded-full" 
                  style={{ width: `${avgMatchRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 text-on-surface-variant text-[10px] font-black uppercase tracking-widest border-b border-outline-variant/10">
                  <th className="px-8 py-6">{t('results.table_pos')}</th>
                  <th className="px-6 py-6">{t('results.table_level')}</th>
                  <th className="px-6 py-6 text-center">{t('results.table_cv')}</th>
                  <th className="px-6 py-6 text-center">{t('results.table_int')}</th>
                  <th className="px-6 py-6 text-center">{t('results.table_total')}</th>
                  <th className="px-6 py-6">{t('results.table_date')}</th>
                  <th className="px-8 py-6 text-right">{t('results.table_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginated.length > 0 ? (
                  paginated.map(int => (
                    <tr key={int._id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-on-surface text-sm truncate max-w-[200px]">{int.position}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">{int.level}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-black text-secondary">{int.matchScore}%</span>
                          <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-secondary" style={{ width: `${int.matchScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-black text-on-surface">{int.evaluation?.totalScore || 0}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center text-primary font-black text-sm">
                          {Math.round(((int.matchScore + (int.evaluation?.totalScore || 0)) / 2))}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs text-on-surface-variant font-medium">
                          {new Date(int.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => navigate(`/results/${int._id}`)}
                          className="bg-on-surface text-surface px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                        >
                          {t('results.view_report')}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-on-surface-variant opacity-40 font-bold uppercase tracking-widest text-xs">
                      {t('results.no_data')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-xs font-black tracking-widest uppercase opacity-60">{t('results.page')} {page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (!interview) return null;
  const { evaluation } = interview;

  return (
    <div className="max-w-6xl mx-auto pb-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={() => navigate('/results')} className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-4 hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t('results.back')}
          </button>
          <h1 className="text-5xl font-black tracking-tighter mb-2 text-on-surface">
            {t('results.report_title')}
          </h1>
          <p className="text-on-surface-variant opacity-70">
            {interview.position} • {interview.level} • {new Date(interview.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleShare} 
            disabled={isSharing}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 ${
              interview.isPublic 
                ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:bg-outline-variant/10'
                : 'bg-gradient-to-r from-secondary to-primary text-on-primary hover:shadow-primary/30'
            }`}
          >
            {isSharing ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">{interview.isPublic ? 'visibility_off' : 'military_tech'}</span>}
            {interview.isPublic ? (t('showcase.unshare') || 'Gỡ khỏi Showcase') : (t('showcase.share') || 'Chia sẻ lên Showcase')}
          </button>
          <button onClick={() => navigate('/preparation')} className="bg-surface-container-high text-on-surface px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-outline-variant/20 transition-all border border-outline-variant/10 shadow-sm active:scale-95">
            {t('results.retry')}
          </button>
        </div>
      </header>

      {/* Hero Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 shadow-lg flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="85" fill="none" stroke="currentColor" strokeWidth="12" className="text-outline-variant/10" />
              <circle cx="96" cy="96" r="85" fill="none" stroke="var(--color-primary)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(evaluation?.totalScore || 0) * 5.34} 534`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-on-surface">{evaluation?.totalScore || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{evaluation?.decision || 'Evaluation'}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-black text-on-surface">{t('results.overall')}</h3>
              {evaluation?.decision && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                  evaluation.decision.includes('STRONG') ? 'bg-green-400/20 text-green-400 border-green-400/30' :
                  evaluation.decision.includes('REJECT') ? 'bg-red-400/20 text-red-400 border-red-400/30' :
                  'bg-primary/20 text-primary border-primary/30'
                }`}>
                  {evaluation.decision}
                </span>
              )}
            </div>
            <p className="text-on-surface-variant leading-relaxed italic">"{evaluation?.summary || t('results.loading')}"</p>
            <div className="mt-6 flex items-center gap-4">
              <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-[10px] font-black uppercase text-primary mb-1">CV Match</p>
                <p className="text-xl font-black text-on-surface">{interview?.matchScore || 0}%</p>
              </div>
              <div className="px-4 py-2 bg-secondary/10 rounded-xl border border-secondary/20">
                <p className="text-[10px] font-black uppercase text-secondary mb-1">Interview</p>
                <p className="text-xl font-black text-on-surface">{(evaluation?.totalScore || 0)}/100</p>
              </div>
            </div>
          </div>
        </div>


        <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-6">{t('results.key_highlights')}</h4>
          <div className="space-y-4">
            <div className="p-4 bg-green-400/5 border border-green-400/10 rounded-2xl">
              <p className="text-[10px] font-black text-green-400 uppercase mb-2">{t('results.strengths')}</p>
              <ul className="text-xs space-y-1 text-on-surface opacity-80">
                {evaluation?.pros?.length ? evaluation.pros.map((p, i) => <li key={i}>• {p}</li>) : <li>{t('results.loading')}</li>}
              </ul>
            </div>
            <div className="p-4 bg-amber-400/5 border border-amber-400/10 rounded-2xl">
              <p className="text-[10px] font-black text-amber-400 uppercase mb-2">{t('results.weaknesses')}</p>
              <ul className="text-xs space-y-1 text-on-surface opacity-80">
                {evaluation?.cons?.length ? evaluation.cons.map((c, i) => <li key={i}>• {c}</li>) : <li>{t('results.loading')}</li>}
              </ul>
            </div>
          </div>
          {evaluation?.breakdown && (
            <div className="mt-6 pt-6 border-t border-outline-variant/10 grid grid-cols-2 gap-4">
              {Object.entries(evaluation.breakdown).map(([key, val]) => {
                const labels: Record<string, string> = {
                  technical: 'Technical Skills',
                  problemSolving: 'Problem Solving',
                  coding: 'Coding Ability',
                  communication: 'Communication',
                  architectureAndFit: 'Architecture & Potential'
                };
                return (
                  <div key={key} className="flex justify-between items-center bg-surface-container-high/50 p-3 rounded-xl border border-outline-variant/5">
                    <span className="text-[9px] font-bold uppercase opacity-50">{labels[key] || key}</span>
                    <span className="text-xs font-black text-primary">{val}/10</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Section */}
      <section className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 mb-12 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary">tips_and_updates</span>
          <h3 className="text-2xl font-black text-on-surface">{t('results.growth_plan')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {evaluation?.improvements?.map((imp, i) => (
            <div key={i} className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10">
              <span className="text-2xl font-black text-primary opacity-20 block mb-2">0{i + 1}</span>
              <p className="text-sm font-bold text-on-surface leading-relaxed">{imp}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Chat Analysis */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-on-surface ml-4">{t('results.breakdown')}</h3>
        {evaluation?.detailedFeedback?.map((item, i) => (
          <div key={i} className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-8 shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{t('results.question')} {i + 1}</p>
                <h4 className="text-lg font-bold text-on-surface leading-tight">{item?.question}</h4>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item?.status === 'correct' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                    item?.status === 'partially_correct' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                      'bg-red-400/10 text-red-400 border-red-400/20'
                  }`}>
                  {item?.status?.replace('_', ' ') || 'N/A'}
                </span>
                <span className="text-2xl font-black text-on-surface sm:mt-2">{item?.score || 0}/10</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-outline-variant/10">
              <div>
                <p className="text-[11px] font-black text-on-surface-variant uppercase mb-3">{t('results.your_answer')}</p>
                <p className="text-sm text-on-surface opacity-80 leading-relaxed bg-surface-container-high p-4 rounded-2xl italic">
                  {item?.answer || `[${t('results.skipped')}]`}
                </p>
                <p className="text-xs text-on-surface-variant mt-4 font-medium">{item?.feedback}</p>

                <div className="mt-4 space-y-3">
                  {item?.pros && item.pros.length > 0 && (
                    <div className="p-3 bg-green-400/5 border border-green-400/10 rounded-xl">
                      <p className="text-[9px] font-black text-green-400 uppercase mb-1">{t('results.strengths')}</p>
                      <ul className="text-[11px] space-y-0.5 text-on-surface opacity-80">
                        {item.pros.map((p, idx) => <li key={idx}>• {p}</li>)}
                      </ul>
                    </div>
                  )}
                  {item?.cons && item.cons.length > 0 && (
                    <div className="p-3 bg-amber-400/5 border border-amber-400/10 rounded-xl">
                      <p className="text-[9px] font-black text-amber-400 uppercase mb-1">{t('results.weaknesses')}</p>
                      <ul className="text-[11px] space-y-0.5 text-on-surface opacity-80">
                        {item.cons.map((c, idx) => <li key={idx}>• {c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <p className="text-[11px] font-black text-primary uppercase mb-3">{t('results.expert_insight')}</p>
                <div className="text-sm text-on-surface leading-relaxed font-medium">
                  {item?.correctReview}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
            {/* Simple CSS Confetti Background Effect */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-[-10%] left-[20%] w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '2s' }}></div>
              <div className="absolute top-[-10%] left-[50%] w-4 h-4 bg-secondary rotate-45 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              <div className="absolute top-[-10%] left-[80%] w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '2.2s' }}></div>
              <div className="absolute top-[20%] left-[-10%] w-4 h-4 bg-amber-400 rotate-12 animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '3s' }}></div>
            </div>

            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-4xl text-on-primary">military_tech</span>
            </div>
            
            <h3 className="text-3xl font-black text-on-surface tracking-tighter mb-2">
              {t('results.congrats_title')}
            </h3>
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-8">
              {t('results.congrats_desc', { score: interview?.evaluation?.totalScore })}
            </p>

            <div className="flex gap-4">
              <button 
                onClick={closeCongratsModal}
                className="flex-1 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-widest hover:bg-outline-variant/20 transition-colors"
              >
                {t('results.congrats_later')}
              </button>
              <button 
                onClick={() => {
                  handleShare();
                  closeCongratsModal();
                }}
                disabled={isSharing}
                className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
              >
                {isSharing ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">rocket_launch</span>}
                {t('results.congrats_share')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
