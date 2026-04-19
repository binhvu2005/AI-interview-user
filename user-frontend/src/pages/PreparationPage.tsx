import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import toast from 'react-hot-toast';

interface AnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[]; // Added more detail
  improvementSuggestions: string[]; // Added more detail
  experienceAnalysis: {
    required: string;
    candidate: string;
    gap: string;
  };
  interviewRecommendation: {
    shouldInterview: boolean;
    focusAreas: string[];
  };
}

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
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
         <h1 className="text-5xl font-black tracking-tighter mb-4 text-on-surface">{isVi ? 'Chuẩn bị' : 'Preparation'}</h1>
         <p className="text-on-surface-variant max-w-xl leading-relaxed text-base opacity-70">
           {isVi 
            ? 'Phân tích sự phù hợp giữa CV và JD trước khi bắt đầu buổi phỏng vấn giả định.' 
            : 'Analyze CV-JD alignment before starting your mock interview session.'}
         </p>
      </header>

      <div className="space-y-8 pb-20">
        {/* Step 1: Selection Grid */}
        <section className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 shadow-sm">
           <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary">target</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">{isVi ? 'Thiết lập vị trí' : 'Target Role'}</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                 <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">{isVi ? 'Vị trí ứng tuyển' : 'Position'}</label>
                 <div className="relative group">
                    <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all">
                        <option value="" disabled>{isVi ? 'Chọn vị trí...' : 'Select Role...'}</option>
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">{isVi ? 'Cấp độ' : 'Level'}</label>
                 <div className="relative group">
                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all">
                      <option value="" disabled>{isVi ? 'Chọn cấp độ...' : 'Select Level...'}</option>
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">{isVi ? 'Thời lượng phỏng vấn (Phút)' : 'Interview Duration (Mins)'}</label>
                 <div className="relative group">
                    <select 
                      value={localStorage.getItem('interview_duration') || '15'} 
                      onChange={(e) => localStorage.setItem('interview_duration', e.target.value)} 
                      className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface appearance-none text-sm font-medium focus:border-primary/50 transition-all"
                    >
                      {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m} {isVi ? 'Phút' : 'Minutes'}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">timer</span>
                 </div>
              </div>
           </div>
        </section>

        {/* CV & JD Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <section className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold tracking-tight text-on-surface">CV Profile</h3>
                 </div>
                 <div className="bg-surface-container-high p-1 rounded-xl flex border border-outline-variant/10">
                   <button onClick={() => setCvMode('vault')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${cvMode === 'vault' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}>Vault</button>
                   <button onClick={() => setCvMode('upload')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${cvMode === 'upload' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}>Upload</button>
                 </div>
              </div>
              <div className="flex-1 min-h-[150px] flex flex-col justify-center">
                {cvMode === 'vault' ? (
                   <select className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 text-on-surface text-sm font-medium" onChange={(e) => setSelectedCVId(e.target.value)}>
                    <option value="">{isVi ? 'Chọn từ kho...' : 'Select from vault...'}</option>
                    {savedCVs.map(cv => <option key={cv.id} value={cv.id}>{cv.name}</option>)}
                  </select>
                ) : (
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${cvFile ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-high hover:border-primary/50'}`}>
                    <span className="material-symbols-outlined text-3xl mb-2 text-on-surface-variant">{cvFile ? 'check_circle' : 'upload_file'}</span>
                    <p className="text-sm font-bold text-on-surface">{cvFile ? cvFile.name : (isVi ? 'Tải lên CV' : 'Upload CV')}</p>
                    <input type="file" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
           </section>

           <section className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] p-10 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold tracking-tight text-on-surface mb-8">Job Description</h3>
              <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder={isVi ? 'Dán mô tả công việc vào đây...' : 'Paste JD here...'} className="w-full h-40 bg-surface-container-high border border-outline-variant/20 rounded-2xl p-4 text-on-surface text-sm focus:border-primary/50 transition-all resize-none" />
           </section>
        </div>

        {/* Action: Phase 1 */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={handleAnalyzeMatch} 
            disabled={isAnalyzing} 
            className="bg-primary text-on-primary px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">analytics</span>}
            {isAnalyzing ? (isVi ? 'Đang phân tích...' : 'Analyzing...') : (isVi ? 'Phân tích độ phù hợp' : 'Analyze Match')}
          </button>
          
          <button 
            onClick={handleQuickTest}
            className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity"
          >
            [ Quick Test - Bypass AI ]
          </button>
        </div>

        {/* Results: Detailed View */}
        {analysisResult && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
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
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Score</span>
                   </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-3xl font-black text-on-surface tracking-tighter">AI Match Analysis</h2>
                    {analysisResult?.interviewRecommendation?.shouldInterview ? (
                      <span className="px-3 py-1 bg-green-400/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-400/20 rounded-full">Recommended</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-400/20 rounded-full">Caution</span>
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
    </div>
  );
};

export default PreparationPage;
