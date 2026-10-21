// File này: Màn hình Cấu hình & Bắt đầu Phỏng vấn AI (PreparationPage).
// Vai trò: Chuẩn hóa 100% các trường nguyên bản ban đầu (CV, JD Template, Vị trí, Cấp bậc, Thời lượng, JD Editor),
//          thực hiện phân tích độ khớp bằng AI và cung cấp nút Đánh giá lại cùng nút Bắt đầu Phỏng vấn.
// Khi nào dùng: Người dùng chuẩn bị tham gia phiên luyện phỏng vấn trực tiếp tại /preparation.

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../services/api.config';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/base/RichTextEditor';
import type { AnalysisResult } from '../../types';
import { fetchWithAuth } from '../../services/fetchClient';
import { socketService } from '../../services/socket.service';

const LEVEL_ORDER: Record<string, number> = {
  intern: 1,
  internship: 1,
  'thực tập': 1,
  fresher: 2,
  'mới tốt nghiệp': 2,
  junior: 3,
  'nhân viên': 3,
  mid: 4,
  middle: 4,
  'mid-level': 4,
  'chuyên viên': 4,
  senior: 5,
  'cao cấp': 5,
  lead: 6,
  'tech lead': 6,
  'team lead': 6,
  staff: 7,
  principal: 8,
  architect: 9,
  manager: 10,
  director: 11,
  executive: 12,
  vp: 13,
};

const getLevelWeight = (name: string): number => {
  const lower = (name || '').toLowerCase().trim();
  for (const [key, weight] of Object.entries(LEVEL_ORDER)) {
    if (lower.includes(key)) return weight;
  }
  return 50;
};

const PreparationPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language.startsWith('vi');
  const resultRef = useRef<HTMLDivElement>(null);

  // 100% Trường nguyên bản ban đầu
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(
    localStorage.getItem('interview_duration') || '15'
  );
  const [cvMode, setCvMode] = useState<'upload' | 'vault'>('upload');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [savedCVs, setSavedCVs] = useState<{ id: string; name: string; content?: string }[]>([]);
  const [selectedCVId, setSelectedCVId] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [freeInterviewsLeft, setFreeInterviewsLeft] = useState<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [positions, setPositions] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  // Job Description list and selected ID
  const [jds, setJds] = useState<any[]>([]);
  const [selectedJdId, setSelectedJdId] = useState('');

  // Spectator Mode
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [spectators, setSpectators] = useState<{ socketId: string; name: string }[]>([]);

  useEffect(() => {
    fetchVault();
    fetchSetupOptions();
    fetchJDs();
  }, []);

  useEffect(() => {
    if (showInviteModal && roomCode) {
      const socket = socketService.connect();
      socket.emit('join-room-host', roomCode);
      socket.on('spectator-update', (list: any[]) => {
        setSpectators(list);
      });
      return () => {
        socket.off('spectator-update');
      };
    }
  }, [showInviteModal, roomCode]);

  const generateRoomCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 3; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    return code;
  };

  const fetchSetupOptions = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.DATA.SETUP_OPTIONS);
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
        // Sắp xếp cấp độ từ thấp đến cao
        const rawLevels: string[] = data.levels || [];
        const sortedLevels = [...rawLevels].sort((a, b) => getLevelWeight(a) - getLevelWeight(b));
        setLevels(sortedLevels);
      }
    } catch (err) {
      console.error('Failed to fetch setup options', err);
    }
  };

  const fetchJDs = async () => {
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.JDS.GET_ALL);
      if (res.ok) {
        const data = await res.json();
        setJds(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch JDs', err);
    }
  };

  const handleJdSelect = (id: string) => {
    setSelectedJdId(id);
    if (!id) {
      setSelectedPosition('');
      setSelectedLevel('');
      setJdText('');
      return;
    }
    const jd = jds.find((j) => j._id === id);
    if (jd) {
      setSelectedPosition(jd.position || '');
      setSelectedLevel(jd.level || '');
      setJdText(jd.content || '');
      toast.success(
        isVi
          ? `Đã cấu hình tự động theo JD: ${jd.title}`
          : `Automatically configured from JD: ${jd.title}`
      );
    }
  };

  const handleClearJd = () => {
    setSelectedJdId('');
    setSelectedPosition('');
    setSelectedLevel('');
    setJdText('');
    toast.success(
      isVi
        ? 'Đã hủy chọn JD. Bạn có thể tự điền thủ công.'
        : 'Cleared JD selection. You can now configure manually.'
    );
  };

  const fetchVault = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetchWithAuth(API_ENDPOINTS.AUTH.ME, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCVs(data.savedCVs || []);
        setIsVip(data.isVip || false);
        setFreeInterviewsLeft(data.freeInterviewsLeft !== undefined ? data.freeInterviewsLeft : null);
      }
    } catch (err) {
      console.error('Failed to fetch vault', err);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const getCVData = async () => {
    let cvData = '';
    if (cvMode === 'upload' && cvFile) {
      try {
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
      const selectedCV = savedCVs.find((c) => c.id === selectedCVId);
      cvData = selectedCV?.content || `CV: ${selectedCV?.name || 'Unknown'}`;
    }
    return cvData;
  };

  // Bước 1: Phân tích độ khớp CV & JD
  const handleAnalyzeMatch = async () => {
    if (
      !selectedPosition ||
      !selectedLevel ||
      (cvMode === 'upload' && !cvFile) ||
      (cvMode === 'vault' && !selectedCVId) ||
      !jdText.trim()
    ) {
      toast.error(
        isVi
          ? 'Vui lòng điền đầy đủ thông tin (CV, JD, Vị trí và Cấp bậc)'
          : 'Please fill in all required fields (CV, JD, Role, and Seniority)'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const token = localStorage.getItem('token');
      const cvData = await getCVData();

      const res = await fetchWithAuth(API_ENDPOINTS.AI.ANALYZE_CV, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cvData,
          jdText: jdText.trim(),
          position: selectedPosition,
          level: selectedLevel,
          lang: i18n.language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        localStorage.setItem('last_cv_analysis', JSON.stringify(data));
        localStorage.setItem('last_match_score', data.matchScore?.toString() || '0');
        localStorage.setItem('last_match_analysis', data.summary || '');
        localStorage.setItem('last_cv_content', cvData);
        localStorage.setItem('last_jd_content', jdText.trim());
        toast.success(isVi ? 'Phân tích độ khớp hoàn tất!' : 'Analysis complete!');

        // Tự động cuộn xuống phần kết quả đánh giá
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Analysis failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Analysis Service Error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Bước 2: Tạo câu hỏi & Bắt đầu Phỏng vấn ngay
  const handleStartInterview = async () => {
    if (!analysisResult) {
      toast.error(
        isVi
          ? 'Vui lòng thực hiện "Phân tích Độ khớp" trước khi bắt đầu phỏng vấn!'
          : 'Please perform "Analyze Match" before starting the interview!'
      );
      return;
    }

    if (!isVip && freeInterviewsLeft !== null && freeInterviewsLeft <= 0) {
      toast.error(
        isVi
          ? 'Bạn đã sử dụng hết 3 lượt phỏng vấn miễn phí trong tháng này. Vui lòng nâng cấp lên gói VIP để tiếp tục!'
          : 'You have used all 3 free mock interviews this month. Please upgrade to VIP to continue!'
      );
      navigate('/upgrade');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const cvData = await getCVData();

      const res = await fetchWithAuth(API_ENDPOINTS.AI.GENERATE_QUESTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cvData,
          jdText: jdText.trim(),
          position: selectedPosition,
          level: selectedLevel,
          lang: i18n.language,
          duration: selectedDuration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('current_interview_plan', JSON.stringify(data));
        localStorage.setItem('interview_position', selectedPosition);
        localStorage.setItem('interview_level', selectedLevel);
        localStorage.setItem('interview_duration', selectedDuration);

        // Hiển thị modal mời người xem (Spectator Invite Modal)
        const code = generateRoomCode();
        setRoomCode(code);
        localStorage.setItem('spectator_room_code', code);

        const socket = socketService.connect();
        socket.emit('join-room-host', code);

        setShowInviteModal(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to generate interview questions');
      }
    } catch (err: any) {
      toast.error(err.message || 'Interview Service Error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Test (Thử nghiệm nhanh không tốn token AI)
  const handleQuickTest = () => {
    const mockAnalysis = {
      matchScore: 85,
      summary:
        'Hồ sơ ứng viên có nền tảng tốt, kinh nghiệm phù hợp với các yêu cầu kỹ thuật trọng điểm trong bản mô tả công việc (JD).',
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'RESTful API'],
      missingSkills: ['AWS', 'Docker', 'Kubernetes'],
      strengths: [
        'Kỹ năng lập trình Frontend vững chắc với React & TypeScript',
        'Khả năng tư duy cấu trúc dự án và giao tiếp mạch lạc',
      ],
      weaknesses: [
        'Kinh nghiệm triển khai hạ tầng đám mây và container hóa còn hạn chế',
      ],
      improvementSuggestions: [
        'Bổ sung thêm các chứng chỉ hoặc dự án thực tế về DevOps/Cloud vào CV',
      ],
      experienceAnalysis: {
        required: '3+ năm kinh nghiệm',
        candidate: '2.5 năm kinh nghiệm thực tế',
        gap: 'Thấp hơn một chút so với yêu cầu nhưng có dự án thực tế tốt để bù đắp.',
      },
      interviewRecommendation: {
        shouldInterview: true,
        focusAreas: ['Technical Architecture', 'Problem Solving'],
      },
    };

    const mockPlan = {
      interviewPlan: 'Mock Interview Plan',
      technicalQuestions: [
        isVi
          ? 'Bạn hãy giới thiệu về dự án tâm đắc nhất mà bạn từng tham gia phát triển?'
          : 'Can you describe your most proud project?',
        isVi
          ? 'Tại sao bạn lại chọn giải pháp kiến trúc này thay vì các lựa chọn khác?'
          : 'Why did you choose this architecture over other alternatives?',
        isVi
          ? 'Bạn xử lý bài toán hiệu năng và tải cao trong hệ thống như thế nào?'
          : 'How do you handle performance bottlenecks under high concurrency?',
      ],
    };

    localStorage.setItem('last_cv_analysis', JSON.stringify(mockAnalysis));
    localStorage.setItem('current_interview_plan', JSON.stringify(mockPlan));
    localStorage.setItem(
      'last_cv_content',
      'MOCK CV: Fullstack Developer với kinh nghiệm React, Node.js và TypeScript.'
    );
    localStorage.setItem('last_jd_content', jdText.trim() || 'MOCK JD CONTENT');
    localStorage.setItem('interview_position', selectedPosition || 'Software Engineer');
    localStorage.setItem('interview_level', selectedLevel || 'Senior');
    localStorage.setItem('interview_duration', selectedDuration);

    toast.success(isVi ? 'Bắt đầu mô phỏng nhanh!' : 'Quick Test Started (No AI Tokens)');
    navigate('/interview');
  };

  return (
    <div className="flex-1 relative min-h-screen bg-background text-on-surface transition-colors duration-200 pb-24">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 relative z-10 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* CỘT TRÁI: Editorial Header & Thông tin Visual (Sticky) */}
          <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-24 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-bold uppercase tracking-wider text-primary w-max shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              SESSION CONFIG
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-[1.12] font-headline">
              {isVi ? (
                <>
                  Thiết lập
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dim">
                    Thử thách.
                  </span>
                </>
              ) : (
                <>
                  Define
                  <br />
                  Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dim">
                    Crucible.
                  </span>
                </>
              )}
            </h1>

            <p className="text-on-surface-variant leading-relaxed text-sm font-medium max-w-md">
              {isVi
                ? 'Hiệu chỉnh các thông số cho phiên mô phỏng sắp tới. Chọn vai trò, cấp độ và cung cấp CV cùng bản mô tả công việc (JD) để đảm bảo bài phỏng vấn sát với thực tế nhất.'
                : 'Calibrate the parameters of your upcoming simulation. Select role specifics, target skills, and provide context to ensure maximum cognitive adaptation.'}
            </p>

            {/* Portal Visual Card */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center shadow-sm group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD32B3zsG7GlRzewrExD_1b0nFeHX8LOCFNWFWhyXhMQ9H-ZgG4l_fjlUIFHoCZo4PHeZKmPhBKU4-cRKl6nYxpfXaFxK2YM9Q-7zsCBvm_CTT-1vZLMrAFpievj5nGDc7FarPZDMF1fcR4HJuazMmJrHiTJZDpZpdX2uEra0sSZWPlNC34-8VIXlYfY6g8lQ-JC77jcRcckAMqvbfFpVY3nkcRpB1oYWqiA0tDgcv3xWbCUudreSOGbVn24EYDRqLN1Wi13_UabU57"
                alt="Preparation Graphic"
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Banner hiển thị số lượt phỏng vấn còn lại */}
            {freeInterviewsLeft !== null && (
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
                  isVip
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 shadow-xs'
                    : freeInterviewsLeft > 0
                    ? 'bg-surface border-outline-variant text-on-surface shadow-xs'
                    : 'bg-red-500/10 border-red-500/25 text-red-500 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isVip
                        ? 'bg-amber-500/20 text-amber-500'
                        : freeInterviewsLeft > 0
                        ? 'bg-primary/15 text-primary'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isVip ? 'workspace_premium' : freeInterviewsLeft > 0 ? 'hourglass_top' : 'lock'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {isVip
                        ? isVi
                          ? 'GÓI PREMIUM VIP'
                          : 'PREMIUM VIP ACCOUNT'
                        : isVi
                        ? 'TÀI KHOẢN MIỄN PHÍ'
                        : 'FREE ACCOUNT'}
                    </p>
                    <p className="text-xs font-semibold mt-0.5">
                      {isVip
                        ? isVi
                          ? 'Bạn có lượt phỏng vấn không giới hạn'
                          : 'You have unlimited mock interviews'
                        : isVi
                        ? `Số lượt miễn phí còn lại trong tháng: ${freeInterviewsLeft} / 3`
                        : `Free mock interviews left this month: ${freeInterviewsLeft} / 3`}
                    </p>
                  </div>
                </div>

                {!isVip && (
                  <button
                    type="button"
                    onClick={() => navigate('/upgrade')}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all active:scale-95 shrink-0 cursor-pointer ${
                      freeInterviewsLeft > 0
                        ? 'bg-primary text-white hover:bg-primary-dim shadow-xs'
                        : 'bg-red-500 text-white hover:bg-red-600 shadow-xs'
                    }`}
                  >
                    {isVi ? 'Nâng cấp VIP' : 'Upgrade VIP'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Toàn bộ Form cấu hình nguyên bản 100% */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* PHẦN 1: Hồ sơ ứng viên (CV) */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface tracking-tight">
                    {isVi ? 'Hồ sơ ứng viên (CV)' : 'Candidate Profile (CV)'}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    {isVi
                      ? 'Nạp CV để AI đối chiếu năng lực thực tế với mô tả công việc'
                      : 'Provide your resume for AI alignment comparison'}
                  </p>
                </div>
              </div>

              {/* Chuyển đổi chế độ Tải lên vs Chọn từ Kho */}
              <div className="bg-surface-container border border-outline-variant p-1 rounded-xl flex mb-5">
                <button
                  type="button"
                  onClick={() => setCvMode('upload')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    cvMode === 'upload'
                      ? 'bg-surface text-on-surface shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">upload_file</span>
                  {isVi ? 'Tải lên CV (PDF)' : 'Upload CV'}
                </button>
                <button
                  type="button"
                  onClick={() => setCvMode('vault')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    cvMode === 'vault'
                      ? 'bg-surface text-on-surface shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">folder_shared</span>
                  {isVi ? 'Chọn từ Kho (Vault)' : 'Select from Vault'}
                </button>
              </div>

              {/* Nội dung theo chế độ */}
              <div>
                {cvMode === 'vault' ? (
                  <div className="relative">
                    <select
                      className="form-select w-full px-4 py-3 text-xs font-medium bg-surface-container rounded-xl border border-outline-variant text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                      onChange={(e) => setSelectedCVId(e.target.value)}
                      value={selectedCVId}
                    >
                      <option value="" disabled>
                        {isVi ? 'Chọn CV từ kho của bạn...' : 'Select CV from vault...'}
                      </option>
                      {savedCVs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      cvFile
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-outline-variant bg-surface-container hover:border-primary/40 hover:bg-surface-container-high'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl mb-2 ${
                        cvFile ? 'text-primary animate-pulse' : 'text-on-surface-variant'
                      }`}
                    >
                      {cvFile ? 'check_circle' : 'cloud_upload'}
                    </span>
                    <p className="text-xs font-semibold text-on-surface text-center">
                      {cvFile
                        ? cvFile.name
                        : isVi
                        ? 'Kéo thả file PDF hoặc bấm để chọn CV'
                        : 'Drop PDF file or click to browse'}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      {cvFile
                        ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng phân tích`
                        : isVi
                        ? 'Hỗ trợ định dạng .PDF (tối đa 5MB)'
                        : 'Supports .PDF up to 5MB'}
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          if (file.type !== 'application/pdf') {
                            toast.error(t('setup.pdf_only') || 'Chỉ chấp nhận file định dạng PDF');
                            e.target.value = '';
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error(
                              t('setup.pdf_size_error') || 'Dung lượng file không được vượt quá 5MB'
                            );
                            e.target.value = '';
                            return;
                          }
                        }
                        setCvFile(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </section>

            {/* PHẦN 2: Mẫu mô tả công việc (JD Template Selector) */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">list_alt</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface tracking-tight">
                      {isVi ? 'Mẫu mô tả công việc (JD)' : 'Job Description Template'}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">
                      {isVi
                        ? 'Chọn mẫu có sẵn để điền tự động vị trí, cấp bậc và nội dung JD'
                        : 'Select pre-configured JD to auto-populate fields'}
                    </p>
                  </div>
                </div>

                {selectedJdId && (
                  <button
                    type="button"
                    onClick={handleClearJd}
                    className="text-[11px] font-bold text-primary hover:text-primary-dim transition-colors flex items-center gap-1 cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
                  >
                    <span className="material-symbols-outlined text-[13px]">undo</span>
                    {isVi ? 'Tự điền thủ công' : 'Fill Manually'}
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedJdId}
                  onChange={(e) => handleJdSelect(e.target.value)}
                  className="form-select w-full px-4 py-3 text-xs font-medium bg-surface-container rounded-xl border border-outline-variant text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                >
                  <option value="">
                    {isVi
                      ? '-- Tùy chọn: Nhập thủ công mô tả công việc của bạn --'
                      : '-- Optional: Enter your own JD manually --'}
                  </option>
                  {(selectedPosition && !selectedJdId
                    ? jds.filter((jd) => jd.position === selectedPosition)
                    : jds
                  ).map((jd) => (
                    <option key={jd._id} value={jd._id}>
                      {jd.title} ({jd.position} - {jd.level})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>

              {selectedPosition && !selectedJdId && jds.some((jd) => jd.position === selectedPosition) && (
                <p className="text-[10px] text-on-surface-variant font-medium mt-2 italic">
                  {isVi
                    ? `Đang lọc các JD mẫu thuộc vị trí "${selectedPosition}"`
                    : `Filtering sample JDs for role "${selectedPosition}"`}
                </p>
              )}
            </section>

            {/* PHẦN 3: Vị trí mục tiêu, Cấp độ & Thời lượng phỏng vấn */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Vị trí mục tiêu */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <label className="text-xs font-bold text-on-surface mb-2 block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">work</span>
                  {isVi ? 'Vị trí Mục tiêu' : 'Target Role'}
                </label>
                <div className="relative">
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    disabled={!!selectedJdId}
                    className={`form-select w-full px-3.5 py-2.5 text-xs font-medium bg-surface-container rounded-xl border border-outline-variant text-on-surface appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer ${
                      selectedJdId ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="" disabled>
                      {isVi ? 'Chọn vị trí...' : 'Select role...'}
                    </option>
                    {positions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Cấp độ (Seniority) - Đã sắp xếp từ thấp đến cao */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <label className="text-xs font-bold text-on-surface mb-2 block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">trending_up</span>
                  {isVi ? 'Cấp bậc (Seniority)' : 'Seniority'}
                </label>
                <div className="relative">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    disabled={!!selectedJdId}
                    className={`form-select w-full px-3.5 py-2.5 text-xs font-medium bg-surface-container rounded-xl border border-outline-variant text-on-surface appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer ${
                      selectedJdId ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="" disabled>
                      {isVi ? 'Chọn cấp độ...' : 'Select level...'}
                    </option>
                    {levels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Thời lượng phỏng vấn */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <label className="text-xs font-bold text-on-surface mb-2 block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">schedule</span>
                  {isVi ? 'Thời lượng' : 'Duration'}
                </label>
                <div className="relative">
                  <select
                    value={selectedDuration}
                    onChange={(e) => {
                      setSelectedDuration(e.target.value);
                      localStorage.setItem('interview_duration', e.target.value);
                    }}
                    className="form-select w-full px-3.5 py-2.5 text-xs font-medium bg-surface-container rounded-xl border border-outline-variant text-on-surface appearance-none focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    {[15, 20, 25, 30, 45, 60].map((m) => (
                      <option key={m} value={m}>
                        {m} {isVi ? 'Phút' : 'Minutes'}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>
              </div>

            </div>

            {/* PHẦN 4: Bản mô tả công việc (JD) RichTextEditor */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                  <label className="text-xs font-bold text-on-surface block">
                    {isVi ? 'Mô tả Công việc (Job Description - JD)' : 'Job Description (JD)'}
                  </label>
                </div>

                {selectedJdId ? (
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    <span className="material-symbols-outlined text-[11px]">lock</span>
                    {isVi ? 'Khóa theo JD mẫu' : 'Locked by template'}
                  </span>
                ) : (
                  <span className="text-[10px] text-on-surface-variant font-medium">Rich Text Editor</span>
                )}
              </div>

              <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <RichTextEditor
                  value={jdText}
                  onChange={setJdText}
                  readOnly={!!selectedJdId}
                  placeholder={
                    isVi
                      ? 'Dán nội dung mô tả công việc (Job Description) vào đây...'
                      : 'Paste target job description details here...'
                  }
                />
              </div>
            </section>

            {/* CỤM NÚT HÀNH ĐỘNG PHÂN TÍCH */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleQuickTest}
                className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>{isVi ? 'Thử nghiệm nhanh (Không tốn token AI)' : 'Quick Test (Bypass AI)'}</span>
              </button>

              <button
                type="button"
                onClick={handleAnalyzeMatch}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-primary to-primary-dim hover:from-primary-dim hover:to-primary text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>{isVi ? 'Đang phân tích độ khớp...' : 'Analyzing Alignment...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isVi ? 'Phân tích Độ khớp CV & JD' : 'Analyze Match'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================
            KHU VỰC KẾT QUẢ ĐÁNH GIÁ ĐỘ KHỚP (ANALYSIS RESULTS)
            ======================================================== */}
        {analysisResult && (
          <div
            ref={resultRef}
            className="mt-16 pt-10 border-t border-outline-variant space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            {/* Thẻ Điểm số & Tóm tắt chung */}
            <div className="bg-surface border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                
                {/* Vòng tròn Score % SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-surface-container"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      fill="none"
                      stroke="var(--color-primary, #6366f1)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(analysisResult.matchScore || 0) * 3.77} 377`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-on-surface font-headline tracking-tight">
                      {analysisResult.matchScore}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {t('analysis.score') || (isVi ? 'ĐỘ KHỚP' : 'SCORE')}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt và Badge đề xuất */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h2 className="text-xl font-black text-on-surface tracking-tight font-headline">
                      {t('analysis.title') || (isVi ? 'Kết Quả Đánh Giá Đối Soát CV & JD' : 'Alignment Telemetry')}
                    </h2>
                    {analysisResult?.interviewRecommendation?.shouldInterview ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/25 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('analysis.recommended') || (isVi ? 'Đủ điều kiện phỏng vấn' : 'Recommended')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/25 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {t('analysis.caution') || (isVi ? 'Cần củng cố thêm' : 'Caution')}
                      </span>
                    )}
                  </div>

                  <p className="text-on-surface-variant text-sm leading-relaxed italic bg-surface-container p-4 rounded-xl border border-outline-variant">
                    "{analysisResult?.summary}"
                  </p>
                </div>
              </div>

              {/* Chi tiết Điểm mạnh, Điểm yếu & Kinh nghiệm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-outline-variant">
                
                {/* Cột Điểm mạnh & Điểm yếu */}
                <div className="space-y-6">
                  {/* Điểm mạnh */}
                  <div>
                    <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      {isVi ? 'Điểm mạnh nổi bật' : 'Key Strengths'}
                    </h5>
                    <div className="space-y-2.5">
                      {analysisResult?.strengths?.map((s, i) => (
                        <div
                          key={i}
                          className="text-xs text-on-surface leading-relaxed flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/15"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Điểm yếu / Cần cải thiện */}
                  <div>
                    <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      {isVi ? 'Điểm yếu / Cần bổ sung' : 'Weaknesses & Gaps'}
                    </h5>
                    <div className="space-y-2.5">
                      {analysisResult?.weaknesses?.map((s, i) => (
                        <div
                          key={i}
                          className="text-xs text-on-surface leading-relaxed flex items-start gap-2.5 bg-amber-500/5 p-3 rounded-xl border border-amber-500/15"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cột Phân tích kinh nghiệm & Gợi ý cải thiện CV */}
                <div className="space-y-6">
                  {/* Phân tích kinh nghiệm */}
                  <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant">
                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">timeline</span>
                      {isVi ? 'Phân tích kinh nghiệm' : 'Experience Analysis'}
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs pb-2 border-b border-outline-variant">
                        <span className="text-on-surface-variant font-medium">Yêu cầu từ JD:</span>
                        <span className="font-bold text-on-surface">
                          {analysisResult?.experienceAnalysis?.required || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pb-2 border-b border-outline-variant">
                        <span className="text-on-surface-variant font-medium">Ứng viên hiện có:</span>
                        <span className="font-bold text-primary">
                          {analysisResult?.experienceAnalysis?.candidate || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant pt-1 leading-relaxed">
                        {analysisResult?.experienceAnalysis?.gap || 'Không phát hiện khoảng cách đáng kể.'}
                      </p>
                    </div>
                  </div>

                  {/* Gợi ý cải thiện CV */}
                  <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant">
                    <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
                      {isVi ? 'Gợi ý cải thiện CV' : 'CV Improvement Suggestions'}
                    </h5>
                    <div className="space-y-2.5">
                      {analysisResult?.improvementSuggestions?.map((s, i) => (
                        <div key={i} className="text-xs text-on-surface-variant leading-relaxed flex items-start gap-2">
                          <span className="material-symbols-outlined text-[15px] text-secondary shrink-0 mt-0.5">
                            arrow_right
                          </span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* BƯỚC 2: CỤM NÚT "ĐÁNH GIÁ LẠI" VÀ "BẮT ĐẦU PHỎNG VẤN" THEO YÊU CẦU */}
              <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-on-surface-variant font-medium text-center sm:text-left">
                  {isVi
                    ? 'Bạn có thể đánh giá lại nếu có cập nhật mới, hoặc bắt đầu buổi phỏng vấn mô phỏng ngay.'
                    : 'Satisfied with the analysis? Start the mock interview or re-evaluate anytime.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Nút Đánh giá lại */}
                  <button
                    type="button"
                    onClick={handleAnalyzeMatch}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>{isVi ? 'Đánh giá lại' : 'Re-Evaluate'}</span>
                  </button>

                  {/* Nút Bắt đầu Phỏng vấn ngay */}
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    disabled={isGenerating || (!isVip && freeInterviewsLeft !== null && freeInterviewsLeft <= 0)}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dim hover:from-primary-dim hover:to-primary text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                        <span>{isVi ? 'Đang chuẩn bị buồng AI...' : 'Preparing Chamber...'}</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                        <span>{isVi ? 'Bắt đầu Phỏng vấn ngay' : 'Start Interview'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Spectator Modal (Hỗ trợ cả Light & Dark) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface border border-outline-variant rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center">
            <div className="w-14 h-14 mx-auto bg-primary/10 border border-primary/25 text-primary rounded-2xl flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-2xl animate-pulse">groups</span>
            </div>

            <h3 className="text-xl font-bold text-on-surface tracking-tight mb-2 font-headline">
              {t('spectator.invite_title') || (isVi ? 'Phòng Phỏng Vấn Có Người Xem' : 'Human Evaluation Room')}
            </h3>
            <p className="text-on-surface-variant text-xs leading-relaxed mb-6 font-body">
              {t('spectator.invite_desc') ||
                (isVi
                  ? 'Chia sẻ mã phòng này để người khác có thể vào xem trực tiếp buổi phỏng vấn của bạn.'
                  : 'Share this access code to let evaluators watch your live interview session.')}
            </p>

            <div className="bg-surface-container rounded-2xl p-5 mb-6 border border-outline-variant">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                {t('spectator.room_code_label') || (isVi ? 'MÃ PHÒNG PHỎNG VẤN' : 'ROOM ACCESS CODE')}
              </span>
              <div className="text-3xl font-black text-primary tracking-[0.25em] font-headline">
                {roomCode}
              </div>

              {spectators.length > 0 && (
                <div className="mt-4 pt-3 border-t border-outline-variant">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {spectators.length} {isVi ? 'Người đang kết nối' : 'Connected'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 max-h-[80px] overflow-y-auto">
                    {spectators.map((s) => (
                      <span
                        key={s.socketId}
                        className="px-2.5 py-0.5 bg-surface-container-high rounded text-[10px] text-on-surface font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  toast.success(t('spectator.modal_success') || 'Phòng đã sẵn sàng!');
                  navigate('/interview');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dim text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary/20 cursor-pointer hover:opacity-95 active:scale-98 transition-all"
              >
                {t('spectator.btn_start_share') || (isVi ? 'Bắt đầu & Chia sẻ phòng' : 'Launch Session with Evaluator')}
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('spectator_room_code');
                  navigate('/interview');
                }}
                className="w-full py-2.5 text-xs text-on-surface-variant hover:text-on-surface uppercase tracking-wider cursor-pointer font-semibold"
              >
                {t('spectator.btn_private') || (isVi ? 'Phỏng vấn riêng tư (Không chia sẻ)' : 'Private Session')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreparationPage;
