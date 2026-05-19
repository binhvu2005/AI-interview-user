import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../services/api.config';
import type { Interview } from '../../types';
import { fetchWithAuth } from '../../services/fetchClient';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

const ShowcaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);

  const fetchVipStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsVip(data.isVip || false);
      }
    } catch (err) {
      console.error('Failed to fetch VIP status:', err);
    }
  };

  useEffect(() => {
    fetchVipStatus();
  }, []);

  useEffect(() => {
    if (id) {
      fetchDetail(id);
    }
  }, [id]);

  const fetchDetail = async (resultId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth(API_ENDPOINTS.INTERVIEWS.GET_ONE(resultId), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setInterview(data);
      } else {
        toast.error(isVi ? 'Không thể tải chi tiết bài phỏng vấn' : 'Failed to load interview details');
        navigate('/showcase');
      }
    } catch (err) {
      console.error(err);
      toast.error(isVi ? 'Đã xảy ra lỗi' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          <p className="text-on-surface-variant font-medium">{isVi ? 'Đang tải chi tiết phỏng vấn...' : 'Loading interview details...'}</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;
  const { evaluation } = interview;
  const candidate = (interview as any).userId;

  return (
    <div className="max-w-6xl mx-auto pb-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button 
            onClick={() => navigate('/showcase')} 
            className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-4 hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {isVi ? 'Quay lại Hội Trường Danh Vọng' : 'Back to Hall of Fame'}
          </button>
          <h1 className="text-5xl font-black tracking-tighter mb-2 text-on-surface">
            {isVi ? 'Bài Phỏng Vấn Tiêu Biểu' : 'Featured Interview Showcase'}
          </h1>
          <p className="text-on-surface-variant opacity-70">
            {interview.position} • {interview.level} • {new Date(interview.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm material-symbols-fill animate-pulse">workspace_premium</span>
            {isVi ? 'Được vinh danh trên Showcase' : 'Honored on Showcase'}
          </div>
        </div>
      </header>

      {/* Candidate Profile Highlight Card */}
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div 
            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center bg-surface-container-high transition-all shadow-sm ${
              candidate?.isVip
                ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-background shadow-[0_0_16px_rgba(245,158,11,0.55)] border-none'
                : 'border border-outline-variant/20'
            }`}
          >
            {candidate?.isVip && (
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 blur-[1px] animate-pulse pointer-events-none"></span>
            )}
            <div className={`relative w-full h-full rounded-2xl overflow-hidden ${candidate?.isVip ? 'p-[2px] bg-background' : ''}`}>
              {candidate?.avatar ? (
                <img src={candidate.avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">person</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-on-surface leading-none">
                {candidate?.fullName || (isVi ? 'Ứng viên ẩn danh' : 'Anonymous Candidate')}
              </h3>
              {candidate?.isVip && (
                <span className="text-[9px] uppercase tracking-widest badge-vip-animated px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 leading-none shadow-sm shadow-yellow-500/20">
                  <span className="material-symbols-outlined text-[10px] material-symbols-fill">workspace_premium</span> VIP
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              {isVi ? 'Ứng viên xuất sắc đã chia sẻ bài phỏng vấn này để cùng chia sẻ kiến thức học hỏi.' : 'Outstanding candidate shared this interview for community learning.'}
            </p>
          </div>
        </div>
      </div>

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
          {isVip && evaluation?.breakdown && (
            <div className="mt-6 pt-6 border-t border-outline-variant/10">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Technical', A: evaluation.breakdown.technical, fullMark: 10 },
                    { subject: 'Problem Solving', A: evaluation.breakdown.problemSolving, fullMark: 10 },
                    { subject: 'Coding', A: evaluation.breakdown.coding, fullMark: 10 },
                    { subject: 'Communication', A: evaluation.breakdown.communication, fullMark: 10 },
                    { subject: 'Architecture', A: evaluation.breakdown.architectureAndFit, fullMark: 10 },
                  ]}>
                    <PolarGrid stroke="var(--color-outline-variant)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10, fontWeight: '800' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(evaluation.breakdown).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    technical: 'Technical',
                    problemSolving: 'Problem Solving',
                    coding: 'Coding',
                    communication: 'Communication',
                    architectureAndFit: 'Architecture'
                  };
                  return (
                    <div key={key} className="flex justify-between items-center bg-surface-container-high/50 px-3 py-2 rounded-lg border border-outline-variant/5">
                      <span className="text-[9px] font-bold uppercase opacity-50">{labels[key] || key}</span>
                      <span className="text-[10px] font-black text-primary">{val}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions and Breakdown Sections - Blocker for non-VIPs */}
      {!isVip ? (
        <div className="relative mt-12">
          <div className="filter blur-md pointer-events-none select-none opacity-20">
            <section className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 mb-12 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                <h3 className="text-2xl font-black text-on-surface">Mock Plan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 h-28"></div>
                <div className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 h-28"></div>
                <div className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 h-28"></div>
              </div>
            </section>
            <section className="space-y-6">
              <h3 className="text-2xl font-black text-on-surface ml-4">Mock Breakdown</h3>
              <div className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-8 shadow-sm h-64"></div>
            </section>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/30 rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent opacity-50"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#FBBF24] to-[#F59E0B] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 badge-vip-animated border-none">
                  <span className="material-symbols-outlined text-4xl text-black material-symbols-fill">workspace_premium</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tighter mb-4">
                  Mở khóa Advanced Analytics VIP
                </h3>
                <p className="text-on-surface-variant font-medium text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
                  Nâng cấp lên tài khoản Premium VIP để truy cập biểu đồ Radar Chart năng lực chuyên sâu, bản kế hoạch phát triển cá nhân và nhận phản hồi chi tiết từ chuyên gia AI cho từng câu hỏi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-10 text-left">
                  <div className="flex items-center gap-3 bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[20px]">donut_large</span>
                    <span className="text-xs font-bold text-on-surface">Radar Chart năng lực chuyên sâu</span>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
                    <span className="text-xs font-bold text-on-surface">Đánh giá chi tiết từng câu trả lời</span>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-green-400 text-[20px]">tips_and_updates</span>
                    <span className="text-xs font-bold text-on-surface">Kế hoạch phát triển sự nghiệp</span>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">history_edu</span>
                    <span className="text-xs font-bold text-on-surface">Insight sửa lỗi từ chuyên gia AI</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/upgrade')}
                  className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  Nâng cấp VIP ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ShowcaseDetailPage;
