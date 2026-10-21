// File này: Màn hình Bảng điều khiển trung tâm (DashboardPage).
// Vai trò: Trực quan hóa toàn bộ trải nghiệm luyện phỏng vấn AI với giao diện cao cấp Luminous Sanctuary, telemetry thời gian thực và các lối tắt hành động nhanh.
// Khi nào dùng: Hiển thị ngay sau khi người dùng đăng nhập hoặc truy cập trang chủ (/dashboard).

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../../components/base';

const DEMO_TABS = ['interview', 'cv', 'radar'] as const;
type DemoTabType = typeof DEMO_TABS[number];

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language.startsWith('vi');

  // Trạng thái mô phỏng câu hỏi phỏng vấn tương tác trên màn hình mẫu (Tự động lướt vòng lặp)
  const [activeTab, setActiveTab] = useState<DemoTabType>('interview');
  const [isPaused, setIsPaused] = useState(false);

  // Tự động lướt sang tab tiếp theo sau 4.5s (dừng khi rê chuột vào để người dùng tiện đọc)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const nextIndex = (DEMO_TABS.indexOf(prev) + 1) % DEMO_TABS.length;
        return DEMO_TABS[nextIndex];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrevTab = () => {
    setActiveTab((prev) => {
      const idx = DEMO_TABS.indexOf(prev);
      return DEMO_TABS[(idx - 1 + DEMO_TABS.length) % DEMO_TABS.length];
    });
  };

  const handleNextTab = () => {
    setActiveTab((prev) => {
      const idx = DEMO_TABS.indexOf(prev);
      return DEMO_TABS[(idx + 1) % DEMO_TABS.length];
    });
  };

  return (
    <div className="relative flex-1 overflow-hidden min-h-screen pb-20">
      {/* Background Ambient Glows (Ánh sáng hào quang khuếch tán mềm mại) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-48 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-tertiary/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4 sm:pt-8">
        
        {/* ========================================================
            HERO SECTION: CHỦ ĐẠO LƯỢNG GIÁ PHỎNG VẤN AI
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-20">
          
          {/* Cột trái: Văn bản định vị nghệ thuật (Editorial Typography) */}
          <div className="lg:col-span-6 space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-headline font-bold tracking-widest uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              {isVi ? 'Không Gian Luyện Phỏng Vấn AI V2.0' : 'Cognitive Sanctuary V2.0'}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-headline text-on-surface tracking-tight leading-[1.08]">
              {isVi ? (
                <>
                  Rèn luyện tư duy.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                    Chinh phục mọi JD
                  </span>
                  <br />
                  với Obsidian AI.
                </>
              ) : (
                <>
                  Prepare Smarter.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                    Get Hired Faster
                  </span>
                  <br />
                  with AI Precision.
                </>
              )}
            </h1>

            <p className="text-on-surface-variant text-base sm:text-lg max-w-xl leading-relaxed font-body">
              {isVi
                ? 'Nền tảng trí tuệ nhân tạo chuyên biệt giúp đối chiếu CV với mô tả công việc (JD), mô phỏng phỏng vấn giọng nói siêu thực và phân tích chấm điểm chi tiết theo chuẩn quốc tế.'
                : 'Advanced AI platform mapping your resume against live job descriptions, conducting voice-driven hyper-realistic simulations, and providing actionable telemetry.'}
            </p>

            {/* Cụm nút hành động chính */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                icon="arrow_forward"
                onClick={() => navigate('/preparation')}
                className="shadow-xl shadow-primary/25 hover:shadow-primary/40 text-base"
              >
                {isVi ? 'Bắt đầu phỏng vấn ngay' : 'Start Simulation Now'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon="visibility"
                iconPosition="left"
                onClick={() => navigate('/join')}
                className="text-base"
              >
                {isVi ? 'Xem phòng phỏng vấn' : 'Watch Interview'}
              </Button>
            </div>

            {/* Chỉ số uy tín (Trust Badges) */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-on-surface-variant font-medium border-t border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>{isVi ? '10,000+ Ứng viên tin dùng' : '10,000+ Candidates'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">trending_up</span>
                <span>{isVi ? 'Tỷ lệ đỗ phỏng vấn 94%' : '94% Success Rate'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">bolt</span>
                <span>{isVi ? 'Phản hồi giọng nói tức thì' : 'Real-time Audio AI'}</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Mô hình phòng phỏng vấn tương tác (Interactive AI Chamber) */}
          <div className="lg:col-span-6 animate-in fade-in slide-in-from-right-6 duration-700">
            <div className="relative">
              {/* Hào quang nền phía sau thẻ */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/15 to-tertiary/20 rounded-[36px] blur-2xl -z-10" />

              <Card
                variant="glass"
                padding="md"
                className="border border-outline-variant/20 shadow-2xl overflow-hidden group transition-all duration-300"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Thanh điều khiển mô phỏng trên đỉnh thẻ */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-headline font-bold text-on-surface uppercase tracking-wider">
                      {isVi ? 'Hệ Thống Phỏng Vấn AI Trực Tuyến' : 'Live AI Interview Engine'}
                    </span>
                    {isPaused && (
                      <span className="text-[9px] font-semibold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                        {isVi ? 'Đang tạm dừng' : 'Paused'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Danh sách tab chuyển đổi với hiệu ứng lướt và thanh tiến trình */}
                    <div className="flex items-center gap-1 bg-surface-container-high/80 p-1 rounded-xl border border-outline-variant/15 text-[11px]">
                      <button
                        onClick={() => setActiveTab('interview')}
                        className={`relative px-2.5 py-1 rounded-lg font-headline font-semibold transition-all overflow-hidden cursor-pointer ${
                          activeTab === 'interview'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {isVi ? 'Hội thoại' : 'Voice'}
                        {activeTab === 'interview' && !isPaused && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70 animate-tab-progress" />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('cv')}
                        className={`relative px-2.5 py-1 rounded-lg font-headline font-semibold transition-all overflow-hidden cursor-pointer ${
                          activeTab === 'cv'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {isVi ? 'Khớp CV' : 'CV Match'}
                        {activeTab === 'cv' && !isPaused && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70 animate-tab-progress" />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('radar')}
                        className={`relative px-2.5 py-1 rounded-lg font-headline font-semibold transition-all overflow-hidden cursor-pointer ${
                          activeTab === 'radar'
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {isVi ? 'Đánh giá' : 'Telemetry'}
                        {activeTab === 'radar' && !isPaused && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70 animate-tab-progress" />
                        )}
                      </button>
                    </div>

                    {/* Nút mũi tên lướt sang trái / phải */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        onClick={handlePrevTab}
                        className="w-7 h-7 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/15"
                        title={isVi ? 'Tab trước' : 'Previous'}
                      >
                        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                      </button>
                      <button
                        onClick={handleNextTab}
                        className="w-7 h-7 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/15"
                        title={isVi ? 'Tab sau' : 'Next'}
                      >
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nội dung tab tự lướt sang mượt mà (Animated Slide-in) */}
                <div key={activeTab} className="animate-slide-in min-h-[300px] flex flex-col justify-between">
                  {activeTab === 'interview' ? (
                    <div className="space-y-4">
                      {/* Bong bóng câu hỏi AI với sóng âm */}
                      <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary text-xs font-headline font-bold">
                            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                            <span>Obsidian AI Evaluator</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Just now</span>
                        </div>
                        <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                          {isVi
                            ? '“Chào bạn, hãy chia sẻ về một tình huống bạn tối ưu hóa hệ thống backend để giảm tải từ 500ms xuống dưới 50ms?”'
                            : '“Welcome. Could you describe a time you optimized a backend microservice bottleneck from 500ms down to under 50ms?”'}
                        </p>
                        {/* Sóng âm giọng nói AI */}
                        <div className="flex items-center gap-1 pt-1 h-6">
                          {[40, 80, 55, 95, 30, 75, 100, 60, 85, 45, 90, 70, 35, 60].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full animate-pulse"
                              style={{
                                height: `${h}%`,
                                animationDelay: `${i * 0.08}s`,
                                animationDuration: '1s',
                              }}
                            />
                          ))}
                          <span className="text-[10px] text-primary font-mono ml-2 font-bold tracking-wider">VOICE STREAMING</span>
                        </div>
                      </div>

                      {/* Bong bóng câu trả lời ứng viên */}
                      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1.5 ml-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary text-xs font-headline font-bold">
                            <span className="material-symbols-outlined text-[16px]">account_circle</span>
                            <span>{isVi ? 'Bạn (Ứng viên Senior)' : 'You (Candidate)'}</span>
                          </div>
                          <Badge variant="success" size="sm">
                            {isVi ? 'Độ tin cậy 96%' : 'Confidence 96%'}
                          </Badge>
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">
                          {isVi
                            ? '“Tôi đã tiến hành phân tích hồ sơ bộ nhớ (Memory Profiling), triển khai cơ chế Redis Cache đa tầng và áp dụng Connection Pooling...”'
                            : '“I diagnosed DB contention with query profiling, introduced multi-tier Redis caching, and fine-tuned connection pooling...”'}
                        </p>
                      </div>

                      {/* Thanh điểm số tức thì */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 text-center">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                            {isVi ? 'Tư Duy Kỹ Thuật' : 'Technical Thinking'}
                          </span>
                          <span className="text-lg font-black font-headline text-primary">9.5/10</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 text-center">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                            {isVi ? 'Giao Tiếp STAR' : 'STAR Communication'}
                          </span>
                          <span className="text-lg font-black font-headline text-secondary">9.2/10</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 text-center">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                            {isVi ? 'Tổng Điểm Khớp' : 'Match Score'}
                          </span>
                          <span className="text-lg font-black font-headline text-emerald-400">94%</span>
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'cv' ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-surface-container-high/50 border border-outline-variant/15 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px]">description</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-headline font-bold text-on-surface">Senior_Software_Engineer_CV.pdf</h4>
                            <p className="text-[10px] text-on-surface-variant">
                              {isVi ? 'Đã lọc 14 Kỹ năng • 4 Kinh nghiệm' : 'Parsed 14 Skills • 4 Work Experiences'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="vip" size="sm">{isVi ? 'Đã khớp' : 'Matched'}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-on-surface-variant">
                            {isVi ? 'Độ tương thích JD mục tiêu:' : 'Target JD Alignment:'}
                          </span>
                          <span className="text-primary font-bold">
                            {isVi ? '88% (Rất cao)' : '88% (Very High)'}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[88%]" />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">✓ React & TypeScript</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">✓ Distributed Architecture</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">✓ Docker & K8s</span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-semibold border border-amber-500/20">
                          {isVi ? '! Cần thêm AWS CDK' : '! Add AWS CDK'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl accent-ai-card border-y border-r border-outline-variant/10">
                        <h4 className="text-xs font-headline font-bold text-primary mb-1 uppercase tracking-wider">
                          {isVi ? 'AI Insight Chuyên Sâu' : 'Deep AI Telemetry'}
                        </h4>
                        <p className="text-xs text-on-surface leading-relaxed">
                          {isVi
                            ? '“Ứng viên thể hiện khả năng phản xạ kiến trúc rất vững vàng. Cần đào sâu hơn các câu hỏi liên quan đến tính sẵn sàng cao (High Availability) để bứt phá band lương cao nhất.”'
                            : '“Candidate exhibits strong architectural reflexes. Further exploration of High Availability principles is advised to reach top-band compensation.”'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10">
                          <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                            {isVi ? 'Tốc độ phản xạ' : 'Response Latency'}
                          </span>
                          <span className="text-sm font-bold text-on-surface">
                            {isVi ? '1.2 giây (Tự nhiên)' : '1.2s (Natural)'}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10">
                          <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                            {isVi ? 'Chỉ số tự tin' : 'Confidence Index'}
                          </span>
                          <span className="text-sm font-bold text-emerald-400">96 / 100</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Indicator Dots ở đáy card để người dùng thấy rõ slide đang chạy */}
                  <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-outline-variant/10 mt-3">
                    {DEMO_TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          activeTab === tab
                            ? 'w-6 bg-primary shadow-xs'
                            : 'w-1.5 bg-outline-variant hover:bg-on-surface-variant/40'
                        }`}
                        title={`Slide ${tab}`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>

        {/* ========================================================
            BENTO GRID: 4 TÍNH NĂNG CỐT LÕI
            ======================================================== */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="md">{isVi ? 'CÔNG NGHỆ ĐỘT PHÁ' : 'BREAKTHROUGH TECHNOLOGY'}</Badge>
          <h2 className="text-3xl sm:text-4xl font-black font-headline text-on-surface tracking-tight">
            {isVi ? 'Được chế tác để tối ưu hóa sự nghiệp' : 'Precision Engineering for Your Career'}
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {isVi
              ? 'Xóa bỏ phương pháp ôn luyện phỏng vấn truyền thống. Nền tảng ứng dụng mô hình ngôn ngữ lớn (LLM) để huấn luyện bạn phản xạ trước mọi câu hỏi hóc búa.'
              : 'Reject standard preparation. Our tools are built for high-stakes scenarios, providing analytical depth and actionable insights.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: AI Mock Interview */}
          <Card
            variant="elevated"
            hoverable
            onClick={() => navigate('/preparation')}
            className="cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">forum</span>
              </div>
              <h3 className="text-lg font-headline font-black text-on-surface group-hover:text-primary transition-colors">
                {isVi ? 'Phỏng Vấn AI Siêu Thực' : 'AI Mock Interview'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isVi
                  ? 'Trải nghiệm đối thoại giọng nói trực tiếp với AI. AI tự thích ứng theo từng câu trả lời để hỏi sâu vào các dự án thực tế của bạn.'
                  : 'Engage in dynamic, voice-driven simulations adapted to your target role. The AI probes deep into your experience in real time.'}
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-headline font-bold text-primary">
              <span>{isVi ? 'Khám phá ngay' : 'Explore Feature'}</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
            </div>
          </Card>

          {/* Card 2: CV vs JD Matching */}
          <Card
            variant="elevated"
            hoverable
            onClick={() => navigate('/vault')}
            className="cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">document_scanner</span>
              </div>
              <h3 className="text-lg font-headline font-black text-on-surface group-hover:text-secondary transition-colors">
                {isVi ? 'Đối Chiếu CV & JD' : 'CV vs JD Matching'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isVi
                  ? 'So khớp hồ sơ của bạn với mô tả công việc của nhà tuyển dụng. Nhận diện các lỗ hổng kỹ năng trước khi nộp đơn chính thức.'
                  : 'Instantly map your resume against the job description. Identify critical keyword gaps and structural weaknesses before you apply.'}
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-headline font-bold text-secondary">
              <span>{isVi ? 'Thử đối chiếu' : 'Match Now'}</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
            </div>
          </Card>

          {/* Card 3: Study Center & Technical Quiz */}
          <Card
            variant="elevated"
            hoverable
            onClick={() => navigate('/study')}
            className="cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <h3 className="text-lg font-headline font-black text-on-surface group-hover:text-amber-500 transition-colors">
                {isVi ? 'Trung Tâm Ôn Luyện' : 'Study Center & Quiz'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isVi
                  ? 'Kho tài liệu ôn tập và bài trắc nghiệm công nghệ: React, Node.js, Systems Design, Database giúp củng cố kiến thức phỏng vấn.'
                  : 'Curated technical study materials and interactive quizzes across Frontend, Backend, Architecture to solidify your foundation.'}
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-headline font-bold text-amber-500">
              <span>{isVi ? 'Vào học ngay' : 'Start Learning'}</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
            </div>
          </Card>

          {/* Card 4: Deep Analytics */}
          <Card
            variant="elevated"
            hoverable
            onClick={() => navigate('/results')}
            className="cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 border border-tertiary/20 text-tertiary flex items-center justify-center group-hover:scale-110 group-hover:bg-tertiary group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">insights</span>
              </div>
              <h3 className="text-lg font-headline font-black text-on-surface group-hover:text-tertiary transition-colors">
                {isVi ? 'Báo Cáo Phân Tích Radar' : 'Telemetry & Radar'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isVi
                  ? 'Bảng điểm 5 trục chuyên sâu: Kỹ thuật, Xử lý vấn đề, Mã nguồn, Giao tiếp và Kiến trúc. Có gợi ý khắc phục từng điểm yếu.'
                  : 'Receive editorial-grade analysis with a 5-axis radar chart, highlight filler words, pacing issues, and actionable tips.'}
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-headline font-bold text-tertiary">
              <span>{isVi ? 'Xem kết quả mẫu' : 'View Reports'}</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
