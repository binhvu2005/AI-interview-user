import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';

import type { ShowcaseInterview } from '../../types';
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
      const res = await fetch(API_ENDPOINTS.DATA.SETUP_OPTIONS);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-primary';
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <header className="mb-12 relative overflow-hidden rounded-[40px] bg-gradient-to-r from-primary/10 via-surface to-secondary/10 border border-primary/10 p-12">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 shadow-inner border border-primary/30">
            <span className="material-symbols-outlined text-4xl text-primary font-light">military_tech</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-on-surface bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {isVi ? 'Hội Trường Danh Vọng' : 'Hall of Fame Showcase'}
          </h1>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed text-base opacity-80">
            {isVi 
              ? 'Khám phá những bài phỏng vấn xuất sắc nhất từ cộng đồng. Học hỏi từ cách trả lời của các ứng viên hàng đầu theo từng vị trí và cấp độ.' 
              : 'Discover top-rated interviews from the community. Learn from the best responses across various roles and levels.'}
          </p>
        </div>
      </header>

      {/* Filter Section */}
      <section className="bg-surface-container border border-outline-variant/15 rounded-3xl p-6 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group min-w-[200px]">
            <select 
              value={selectedPosition} 
              onChange={(e) => setSelectedPosition(e.target.value)} 
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all cursor-pointer"
            >
                <option value="">{isVi ? 'Tất cả vị trí' : 'All Positions'}</option>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
          </div>
          
          <div className="relative group min-w-[200px]">
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)} 
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all cursor-pointer"
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
            className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">close</span>
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
          {interviews.map((interview) => (
            <div 
              key={interview._id} 
              className="group bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              {/* Top Section */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden flex items-center justify-center">
                     {interview.userId?.avatar ? (
                       <img src={interview.userId.avatar} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                       <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                     )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface leading-none mb-1">
                      {interview.userId?.fullName || (isVi ? 'Ứng viên ẩn danh' : 'Anonymous')}
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full ${getScoreColor(interview.evaluation?.totalScore || 0)}`}>
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span className="text-xs font-black">{interview.evaluation?.totalScore || 0}</span>
                </div>
              </div>

              {/* Role Details */}
              <div className="mb-8 flex-1">
                <h3 className="text-lg font-black text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {interview.position}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <span className="bg-surface-container-highest px-2.5 py-1 rounded-md">{interview.level}</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">timer</span>
                    {interview.duration} {isVi ? 'phút' : 'mins'}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={() => navigate(`/results/${interview._id}`)}
                className="w-full py-3.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-on-primary transition-colors"
              >
                {isVi ? 'Xem chi tiết' : 'View Details'}
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowcasePage;
