import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';

import type { ShowcaseInterview } from '../../types';
import { fetchWithAuth } from '../../services/fetchClient';

const ShowcasePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language.startsWith('vi');

  const [interviews, setInterviews] = useState<ShowcaseInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  // Filters
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchSetupOptions();
  }, []);

  useEffect(() => {
    fetchShowcase();
  }, [selectedPosition, selectedLevel]);

  const fetchSetupOptions = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.DATA.SETUP_OPTIONS);
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
        setLevels(data.levels || []);
      }
    } catch (err) {
      console.error('Failed to fetch setup options', err);
    }
  };

  const fetchShowcase = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedPosition) queryParams.append('position', selectedPosition);
      if (selectedLevel) queryParams.append('level', selectedLevel);
      
      // We will construct the path manually using GET_ALL base
      const baseUrl = API_ENDPOINTS.INTERVIEWS.GET_ALL;
      const url = `${baseUrl}/showcase?${queryParams.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.data || []);
      } else {
        throw new Error('Failed to fetch showcase');
      }
    } catch (err: any) {
      toast.error(isVi ? 'Không thể tải danh sách Showcase' : 'Failed to load Showcase');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedPosition('');
    setSelectedLevel('');
  };

  const getScoreBadgeStyles = (score: number) => {
    if (score >= 90) return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25';
    if (score >= 70) return 'bg-green-500/10 text-green-400 border border-green-500/25';
    if (score >= 50) return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
    return 'bg-red-500/10 text-red-400 border border-red-500/25';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <header className="mb-12 relative overflow-hidden rounded-[40px] bg-gradient-to-r from-primary/10 via-surface-container-low to-secondary/10 border border-outline-variant/10 p-8 sm:p-12 shadow-lg">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-amber-500/10 flex items-center justify-center mb-6 shadow-inner border border-yellow-500/30">
            <span className="material-symbols-outlined text-4xl text-yellow-500 font-bold">military_tech</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-primary via-on-surface to-secondary leading-none">
            {isVi ? 'Hội Trường Danh Vọng' : 'Hall of Fame Showcase'}
          </h1>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed text-sm sm:text-base opacity-80 font-medium">
            {isVi 
              ? 'Khám phá những bài phỏng vấn xuất sắc nhất từ cộng đồng. Học hỏi từ cách trả lời của các ứng viên hàng đầu theo từng vị trí và cấp độ.' 
              : 'Discover top-rated interviews from the community. Learn from the best responses across various roles and levels.'}
          </p>
        </div>
      </header>

      {/* Filter Section */}
      <section className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-5 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group w-full md:min-w-[220px]">
            <select 
              value={selectedPosition} 
              onChange={(e) => setSelectedPosition(e.target.value)} 
              className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-3.5 text-on-surface appearance-none text-sm font-semibold focus:border-primary/50 outline-none transition-all cursor-pointer"
            >
                <option value="">{isVi ? 'Tất cả vị trí' : 'All Positions'}</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
          </div>
          
          <div className="relative group w-full md:min-w-[220px]">
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)} 
              className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl px-5 py-3.5 text-on-surface appearance-none text-sm font-semibold focus:border-primary/50 outline-none transition-all cursor-pointer"
            >
              <option value="">{isVi ? 'Tất cả cấp độ' : 'All Levels'}</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
          </div>
        </div>

        {(selectedPosition || selectedLevel) && (
          <button 
            onClick={clearFilters}
            className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 self-end md:self-auto py-2 px-4 rounded-xl bg-primary/5 border border-primary/10"
          >
            <span className="material-symbols-outlined text-sm font-bold">close</span>
            {isVi ? 'Xóa bộ lọc' : 'Clear Filters'}
          </button>
        )}
      </section>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
           <span className="material-symbols-outlined text-5xl animate-spin mb-4">progress_activity</span>
           <p className="text-sm tracking-widest uppercase font-bold text-on-surface-variant">{isVi ? 'Đang tải...' : 'Loading...'}</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low rounded-[40px] border border-outline-variant/10 border-dashed">
           <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 mb-4">inbox</span>
           <h3 className="text-xl font-bold text-on-surface mb-2">{isVi ? 'Chưa có dữ liệu' : 'No Interviews Found'}</h3>
           <p className="text-on-surface-variant text-sm">
             {isVi ? 'Chưa có bài phỏng vấn nào phù hợp với tiêu chí lọc.' : 'No interviews match your criteria.'}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => {
            const score = interview.evaluation?.totalScore || 0;
            const isHighScore = score >= 90;
            return (
              <div 
                key={interview._id} 
                className={`group relative border rounded-[32px] p-6 transition-all duration-500 overflow-hidden flex flex-col ${
                  isHighScore 
                    ? 'bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/60 shadow-md hover:shadow-yellow-500/5' 
                    : 'bg-gradient-to-br from-surface-container-low to-surface-container-lowest border-outline-variant/10 hover:border-primary/40 shadow-sm hover:shadow-primary/5 hover:shadow-2xl'
                } hover:-translate-y-1`}
              >
                {/* Background spotlight on card hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
                  isHighScore 
                    ? 'bg-gradient-to-tr from-yellow-500/5 via-transparent to-amber-500/5' 
                    : 'bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5'
                }`}></div>

                {/* Highlight Badge for High Score */}
                {isHighScore && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-4 -right-8 w-28 bg-yellow-500 text-white text-[8px] font-black uppercase tracking-widest text-center py-1 rotate-45 shadow-sm">
                      {isVi ? 'ĐỈNH CAO' : 'ELITE'}
                    </div>
                  </div>
                )}

                {/* Top Section */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`relative w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-high transition-all ${
                        interview.userId?.isVip
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(245,158,11,0.55)] border-none'
                          : 'border border-outline-variant/20'
                      }`}
                    >
                      {interview.userId?.isVip && (
                        <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 opacity-90 blur-[1px] animate-pulse pointer-events-none"></span>
                      )}
                      <div className={`relative w-full h-full rounded-xl overflow-hidden ${interview.userId?.isVip ? 'p-[1px] bg-background' : ''}`}>
                        {interview.userId?.avatar ? (
                          <img src={interview.userId.avatar} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface leading-none mb-1 group-hover:text-primary transition-colors">
                        {interview.userId?.fullName || (isVi ? 'Ứng viên ẩn danh' : 'Anonymous')}
                      </h4>
                      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant opacity-50">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${getScoreBadgeStyles(score)}`}>
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span className="text-xs font-black">{score}</span>
                  </div>
                </div>

                {/* Role Details */}
                <div className="mb-8 flex-1 relative z-10">
                  <h3 className="text-lg font-black text-on-surface mb-2 group-hover:text-primary transition-colors tracking-tight leading-snug">
                    {interview.position}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span className="bg-surface-container-highest px-2.5 py-1 rounded-md">{interview.level}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                    <span className="flex items-center gap-1 opacity-70">
                      <span className="material-symbols-outlined text-[12px]">timer</span>
                      {interview.duration} {isVi ? 'phút' : 'mins'}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => navigate(`/results/${interview._id}`)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative z-10 ${
                    isHighScore
                      ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-yellow-500/20'
                      : 'bg-surface-container-high text-on-surface border border-outline-variant/10 group-hover:bg-primary group-hover:text-on-primary group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-primary/20'
                  }`}
                >
                  {isVi ? 'Xem chi tiết' : 'View Details'}
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowcasePage;
