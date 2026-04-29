import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/base/RichTextEditor';

import type { AnalysisResult } from '../../types';

const PreparationPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language.startsWith('vi');
  
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [cvMode, setCvMode] = useState<'upload' | 'vault'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [savedCVs, setSavedCVs] = useState<{ id: string, name: string, content?: string }[]>([]);
  const [selectedCVId, setSelectedCVId] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [positions, setPositions] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  useEffect(() => {
    fetchVault();
    fetchSetupOptions();
  }, []);

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

  const fetchVault = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCVs(data.savedCVs || []);
      }
    } catch (err) {
      console.error('Failed to fetch vault', err);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const getCVData = async () => {
    let cvData = '';
    if (cvMode === 'upload' && cvFile) {
      try {
        // If it's a PDF, we try to read it, but since we don't have a PDF library yet,
        // we'll at least send the filename and some metadata if reading fails.
        const content = await readFileAsText(cvFile);
        if (content.includes('\u0000') || content.length < 10) {
          cvData = `[PDF File: ${cvFile.name}] - Content extraction restricted. Please analyze based on the role and JD.`;
        } else {
          cvData = content;
        }
      } catch {
        cvData = `CV file: ${cvFile.name} (Content could not be read)`;
      }
    } else if (cvMode === 'vault') {
      const selectedCV = savedCVs.find(c => c.id === selectedCVId);
      cvData = selectedCV?.content || `CV: ${selectedCV?.name || 'Unknown'}`;
    }
    return cvData;
  };

  // Step 1: Just Analyze CV Match
  const handleAnalyzeMatch = async () => {
    if (!selectedPosition || !selectedLevel || (cvMode === 'upload' && !cvFile) || (cvMode === 'vault' && !selectedCVId) || !jdText.trim()) {
      toast.error(isVi ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const token = localStorage.getItem('token');
      const cvData = await getCVData();

      const res = await fetch(API_ENDPOINTS.AI.ANALYZE_CV, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cvData,
          jdText: jdText.trim(),
          position: selectedPosition,
          level: selectedLevel,
          lang: i18n.language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        // Save analysis and raw content for the chat context
        localStorage.setItem('last_cv_analysis', JSON.stringify(data));
        localStorage.setItem('last_match_score', data.matchScore.toString());
        localStorage.setItem('last_match_analysis', data.summary);
        localStorage.setItem('last_cv_content', cvData);
        localStorage.setItem('last_jd_content', jdText.trim());
        toast.success(isVi ? 'Phân tích hoàn tất!' : 'Analysis complete!');
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Analysis failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Analysis Service Error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Generate Questions and Start
  const handleStartInterview = async () => {
    if (!analysisResult) return;

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const cvData = await getCVData();

      const res = await fetch(API_ENDPOINTS.AI.GENERATE_QUESTIONS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cvData,
          jdText: jdText.trim(),
          position: selectedPosition,
          level: selectedLevel,
          lang: i18n.language
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Save questions for InterviewPage
        localStorage.setItem('current_interview_plan', JSON.stringify(data));
        localStorage.setItem('interview_position', selectedPosition);
        localStorage.setItem('interview_level', selectedLevel);
        
        toast.success(isVi ? 'Đang khởi tạo phỏng vấn...' : 'Initializing interview...');
        setTimeout(() => navigate('/interview'), 500);
      } else {
        throw new Error('Failed to generate interview questions');
      }
    } catch (err: any) {
      toast.error(err.message || 'Interview Service Error');
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Quick Test without AI (for debugging)
  const handleQuickTest = () => {
    const mockAnalysis = {
      matchScore: 85,
      summary: "This is a MOCK analysis for testing purposes. No tokens were consumed.",
      matchedSkills: ["React", "TypeScript", "Node.js"],
      missingSkills: ["AWS", "Docker"],
      strengths: ["Strong Frontend background", "Clear communication"],
      weaknesses: ["Lack of DevOps experience"],
      improvementSuggestions: ["Add cloud certifications to your CV"],
      experienceAnalysis: {
        required: "3+ years",
        candidate: "2.5 years",
        gap: "Slightly below required years but strong projects."
      },
      interviewRecommendation: { shouldInterview: true, focusAreas: ["Technical", "Behavioral"] }
    };

    const mockPlan = {
      interviewPlan: "Mock Interview Plan",
      technicalQuestions: [
        isVi ? "Bạn hãy giới thiệu về dự án tâm đắc nhất của mình?" : "Can you describe your most proud project?",
        isVi ? "Tại sao bạn lại chọn React thay vì các framework khác?" : "Why did you choose React over other frameworks?",
        isVi ? "Bạn xử lý xung đột trong team như thế nào?" : "How do you handle conflicts in a team?"
      ]
    };

    localStorage.setItem('last_cv_analysis', JSON.stringify(mockAnalysis));
    localStorage.setItem('current_interview_plan', JSON.stringify(mockPlan));
    localStorage.setItem('last_cv_content', "MOCK CV CONTENT: Fullstack Developer with 3 years experience in React and Node.js.");
    localStorage.setItem('last_jd_content', "MOCK JD CONTENT: Looking for a Senior Frontend Developer proficient in TypeScript and system design.");
    localStorage.setItem('interview_position', selectedPosition || 'Software Engineer');
    localStorage.setItem('interview_level', selectedLevel || 'Senior');
    
    toast.success("Quick Test Started (No AI Tokens)");
    navigate('/interview');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Header & Visuals */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 text-[10px] font-black uppercase tracking-widest text-[#818CF8] w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]"></span>
            SESSION CONFIG
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-on-surface leading-[1.1]">
            {isVi ? (
              <>Thiết lập<br/><span className="text-[#818CF8]">Thử thách.</span></>
            ) : (
              <>Define<br/>Your<br/><span className="text-[#818CF8]">Crucible.</span></>
            )}
          </h1>
          
          <p className="text-on-surface-variant max-w-sm leading-relaxed text-sm font-medium mb-12">
            {isVi 
              ? 'Hiệu chỉnh các thông số cho phiên mô phỏng sắp tới. Chọn vai trò, cấp độ và cung cấp CV/JD để đảm bảo bài phỏng vấn sát với thực tế nhất.' 
              : 'Calibrate the parameters of your upcoming simulation. Select role specifics, target skills, and provide context to ensure maximum cognitive adaptation.'}
          </p>

          {/* Portal Visual / Image */}
          <div className="relative w-full max-w-[320px] aspect-video rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface flex items-center justify-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD32B3zsG7GlRzewrExD_1b0nFeHX8LOCFNWFWhyXhMQ9H-ZgG4l_fjlUIFHoCZo4PHeZKmPhBKU4-cRKl6nYxpfXaFxK2YM9Q-7zsCBvm_CTT-1vZLMrAFpievj5nGDc7FarPZDMF1fcR4HJuazMmJrHiTJZDpZpdX2uEra0sSZWPlNC34-8VIXlYfY6g8lQ-JC77jcRcckAMqvbfFpVY3nkcRpB1oYWqiA0tDgcv3xWbCUudreSOGbVn24EYDRqLN1Wi13_UabU57" 
              alt="Preparation Graphic" 
              className="w-full h-full object-cover opacity-80" 
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Form Configs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section: CV Mode (Toggle) */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#818CF8] text-[20px]">badge</span>
              <h3 className="text-base font-bold text-on-surface tracking-tight">{isVi ? 'Hồ sơ Ứng viên (CV)' : 'Candidate Profile (CV)'}</h3>
            </div>
            
            <div className="bg-surface-container border border-outline-variant/20 p-1.5 rounded-2xl flex mb-6">
              <button 
                onClick={() => setCvMode('upload')} 
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${cvMode === 'upload' ? 'bg-surface-container-highest text-on-surface shadow-sm border border-outline-variant/20' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                {isVi ? 'Tải lên CV' : 'Upload CV'}
              </button>
              <button 
                onClick={() => setCvMode('vault')} 
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${cvMode === 'vault' ? 'bg-surface-container-highest text-on-surface shadow-sm border border-outline-variant/20' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                {isVi ? 'Chọn từ Kho (Vault)' : 'Select from Vault'}
              </button>
            </div>

            <div className="min-h-[100px] flex flex-col justify-center">
              {cvMode === 'vault' ? (
                <div className="relative group">
                  <select className="w-full bg-surface border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface appearance-none text-sm font-medium focus:border-[#818CF8]/50 transition-all outline-none" onChange={(e) => setSelectedCVId(e.target.value)} value={selectedCVId}>
                    <option value="" disabled>{isVi ? 'Chọn CV từ kho...' : 'Select CV from vault...'}</option>
                    {savedCVs.map(cv => <option key={cv.id} value={cv.id}>{cv.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${cvFile ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface hover:border-primary/50'}`}>
                  <span className={`material-symbols-outlined text-3xl mb-2 ${cvFile ? 'text-primary' : 'text-on-surface-variant'}`}>{cvFile ? 'check_circle' : 'cloud_upload'}</span>
                  <p className="text-sm font-bold text-on-surface">{cvFile ? cvFile.name : (isVi ? 'Kéo thả PDF hoặc bấm để chọn' : 'Drop PDF or click to browse')}</p>
                  <input type="file" className="hidden" accept=".pdf" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
          </section>

          {/* Section: Role, Level, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Target Role & Level */}
            <section className="bg-surface-container-low border border-outline-variant/20 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant mb-2 block">{isVi ? 'Vị trí Mục tiêu' : 'Target Role'}</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">work</span>
                    <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-12 pr-4 py-3.5 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all outline-none">
                        <option value="" disabled>{isVi ? 'VD: Frontend Developer' : 'e.g. Senior Product Designer'}</option>
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant mb-2 block">{isVi ? 'Cấp độ' : 'Seniority'}</label>
                  <div className="relative group">
                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded-xl px-5 py-3.5 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all outline-none">
                      <option value="" disabled>{isVi ? 'Chọn cấp độ...' : 'Select level'}</option>
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Duration */}
            <section className="bg-surface-container-low border border-outline-variant/20 rounded-[32px] p-8 shadow-sm flex flex-col justify-center">
               <div className="text-center mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center mx-auto mb-4 border border-outline-variant/10 shadow-inner">
                    <span className="material-symbols-outlined text-[#818CF8] text-[24px]">hourglass_empty</span>
                 </div>
                 <h3 className="text-sm font-bold text-on-surface tracking-tight">{isVi ? 'Thời lượng Phỏng vấn' : 'Interview Duration'}</h3>
                 <p className="text-xs text-on-surface-variant mt-1">{isVi ? 'Chọn thời gian làm bài' : 'Set session length'}</p>
               </div>
               
               <div className="relative group">
                  <select 
                    value={localStorage.getItem('interview_duration') || '15'} 
                    onChange={(e) => localStorage.setItem('interview_duration', e.target.value)} 
                    className="w-full bg-surface border border-outline-variant/20 rounded-xl px-5 py-3.5 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all outline-none text-center"
                  >
                    {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m} {isVi ? 'Phút' : 'Minutes'}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
               </div>
            </section>
          </div>

          {/* Section: Job Description */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-[32px] p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-bold text-on-surface-variant block">{isVi ? 'Mô tả Công việc (JD)' : 'Job Description'}</label>
              <span className="text-[10px] text-on-surface-variant opacity-60">Rich Text</span>
            </div>
            
            <div className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden">
              <RichTextEditor 
                value={jdText}
                onChange={setJdText}
                placeholder={isVi ? 'Dán mô tả công việc (Job Description) vào đây...' : 'Paste target job description here...'}
              />
            </div>
          </section>

          {/* Action Button */}
          <div className="flex flex-col items-end mt-4">
            <button 
              onClick={handleAnalyzeMatch} 
              disabled={isAnalyzing} 
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-[#6366F1]/20 transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto"
            >
              {isAnalyzing ? (isVi ? 'Đang phân tích...' : 'Analyzing...') : (isVi ? 'Phân tích Độ khớp' : 'Initialize Sequence')}
              {isAnalyzing ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
            <button 
              onClick={handleQuickTest}
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity mt-4 mr-4"
            >
              [ Quick Test - Bypass AI ]
            </button>
          </div>

        </div>
      </div>

      {/* Results: Detailed View */}
      {analysisResult && (
        <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto">
          {/* Score & Summary */}
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 shadow-lg">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="10" className="text-outline-variant/10" />
                    <circle cx="96" cy="96" r="80" fill="none" stroke="var(--color-primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${analysisResult.matchScore * 5} 502`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-on-surface">{analysisResult.matchScore}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t('analysis.score')}</span>
                  </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-black text-on-surface tracking-tighter">{t('analysis.title')}</h2>
                  {analysisResult?.interviewRecommendation?.shouldInterview ? (
                    <span className="px-3 py-1 bg-green-400/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-400/20 rounded-full">{t('analysis.recommended')}</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-400/20 rounded-full">{t('analysis.caution')}</span>
                  )}
                </div>
                <p className="text-on-surface-variant leading-relaxed text-base italic mb-6">"{analysisResult?.summary}"</p>
              </div>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-outline-variant/10">
              <div className="space-y-6">
                <div>
                  <h5 className="text-[11px] font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span> {isVi ? 'Điểm mạnh' : 'Strengths'}
                  </h5>
                  <div className="space-y-3">
                    {analysisResult?.strengths?.map((s, i) => <div key={i} className="text-sm text-on-surface leading-relaxed flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></span>{s}</div>)}
                  </div>
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span> {isVi ? 'Điểm yếu / Cần cải thiện' : 'Weaknesses'}
                  </h5>
                  <div className="space-y-3">
                    {analysisResult?.weaknesses?.map((s, i) => <div key={i} className="text-sm text-on-surface leading-relaxed flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>{s}</div>)}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                  <div className="p-6 bg-surface-container rounded-[24px] border border-outline-variant/10">
                    <h5 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">{isVi ? 'Phân tích kinh nghiệm' : 'Experience Analysis'}</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs"><span className="opacity-50">Yêu cầu JD:</span><span className="font-bold">{analysisResult?.experienceAnalysis?.required}</span></div>
                      <div className="flex justify-between text-xs"><span className="opacity-50">Ứng viên có:</span><span className="font-bold text-primary">{analysisResult?.experienceAnalysis?.candidate}</span></div>
                      <p className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">{analysisResult?.experienceAnalysis?.gap}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-surface-container rounded-[24px] border border-outline-variant/10">
                    <h5 className="text-[11px] font-black text-secondary uppercase tracking-widest mb-4">{isVi ? 'Gợi ý cải thiện CV' : 'CV Improvement'}</h5>
                    <div className="space-y-3">
                      {analysisResult?.improvementSuggestions?.map((s, i) => (
                        <div key={i} className="text-xs text-on-surface leading-relaxed flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-secondary">tips_and_updates</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            {/* Final Step Action */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10 flex flex-col items-center gap-6">
              <p className="text-sm text-on-surface-variant font-medium text-center max-w-lg">
                {isVi 
                  ? 'Nếu bạn hài lòng với kết quả phân tích, hãy bắt đầu buổi phỏng vấn giả định để AI kiểm tra sâu hơn kỹ năng của bạn.' 
                  : 'Satisfied with the analysis? Start the mock interview for a deep cognitive evaluation.'}
              </p>
              <button 
                onClick={handleStartInterview} 
                disabled={isGenerating}
                className="group bg-on-surface text-surface px-14 py-5 rounded-full font-black text-lg transition-all active:scale-95 shadow-2xl flex items-center gap-4 disabled:opacity-50"
              >
                {isGenerating ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">rocket_launch</span>}
                {isGenerating ? (isVi ? 'Đang chuẩn bị câu hỏi...' : 'Preparing Questions...') : (isVi ? 'Bắt đầu phỏng vấn ngay' : 'Start Interview Now')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreparationPage;
