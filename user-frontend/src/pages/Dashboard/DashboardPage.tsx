import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isVi = i18n.language.startsWith('vi');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, active: false };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      color: string;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.color = Math.random() > 0.5 ? '#A3A6FF' : '#BAFFC9';
      }

      update(w: number, h: number) {
        // Natural random movement
        this.x += this.vx;
        this.y += this.vy;

        // Suble mouse interaction: particles move slightly away or nudge when mouse is near
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            const force = (200 - distance) / 200;
            // Just a tiny nudge away from mouse
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
          }
        }

        // Wrap around or bounce to keep them in the banner area
        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
      }
    }

    const init = () => {
      if (!container || !canvas) return;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      for (let i = 0; i < 200; i++) {
        particles.push(new Particle(width, height));
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    // Use ResizeObserver for perfect canvas scaling
    const resizeObserver = new ResizeObserver(() => {
      init();
    });
    resizeObserver.observe(container);

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', init);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);


  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Global Particle Background (Top Area) */}
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-[800px] pointer-events-none z-0 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full opacity-60"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Dynamic Mesh Background */}
        <div className="mesh-gradient"></div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24 mt-1 relative p-8 lg:p-0">
          {/* Text Side */}
          <div className="relative z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-primary text-[10px] font-semibold tracking-widest uppercase mb-6 border border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {t('dashboard.tag')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-semibold text-on-surface tracking-tight leading-[1.1] mb-6 font-sans">
              {t('dashboard.title1')} <br /> {t('dashboard.title2')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] to-[#38bdf8] animate-gradient-x">{t('dashboard.title3')}</span> <br />
              {t('dashboard.title4')}
            </h1>

            <p className="text-on-surface-variant/80 text-sm md:text-base max-w-md leading-relaxed mb-8">
              {t('dashboard.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/preparation')} className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-neutral-200 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-sm text-sm w-full sm:w-auto">
                {t('dashboard.btn_start')}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button onClick={() => navigate('/join')} className="bg-white/[0.04] text-on-surface border border-white/[0.08] hover:bg-white/[0.08] hover:-translate-y-0.5 active:scale-[0.98] transition-all font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                {t('join.title')}
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative lg:h-[500px]">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 blur-[80px] rounded-full z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="relative z-10 w-full h-full bg-surface-container/30 backdrop-blur-md border border-white/[0.06] rounded-xl shadow-xl p-2 overflow-hidden">
              <div className="w-full h-full bg-surface-container-low rounded-lg overflow-hidden relative border border-white/[0.05]">
                {/* Fake Browser Interface */}
                <div className="absolute inset-0 bg-background flex flex-col">
                  <div className="h-10 border-b border-white/[0.05] flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-error/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5"></div>
                    <img alt="App Interface Demo" className="w-[120%] opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGpU5MncpskOFGzorI3omSYIf3aBd_3paG35MlxaEvx7kyOT2Xs4mqKnKwnAmfm0xUXIsM630XU26H6czWwW76gBe4IXeoin1fS2NEUS1K-s5Rusu9H4FSebw6LugJpQhEx80Xtn7Sz1w1WYRX-ITQjkVp9BXPuiehAeeoAjg_Yoj3NmhfO6n30UZj-9a0IqYXxTcgWagJEYb1r9ueuy2VFUnrQgqdHMdrpdJHaChEBL0Gn_qPjofY8Mo-YgtCSpnIoCz-tLFRGbzT" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -left-4 bg-surface-container/90 backdrop-blur-md border border-white/[0.06] rounded-xl p-3.5 shadow-xl flex items-center gap-4 z-20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-on-surface">{t('dashboard.score_title')}</h4>
                <p className="text-[10px] text-on-surface-variant font-medium"><span className="text-primary font-semibold">94%</span> — {t('dashboard.score_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Precision Engineering Section */}
        <div className="text-center mb-16 animate-fade-in delay-1">
          <h2 className="text-2xl lg:text-3xl font-semibold text-on-surface tracking-tight mb-4 font-sans">{t('dashboard.section_title')}</h2>
          <p className="text-on-surface-variant/80 text-sm max-w-2xl mx-auto">
            {t('dashboard.section_desc')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          <div className="bg-[#121214]/40 backdrop-blur-2xl rounded-xl p-6 border border-white/[0.05] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 group shadow-lg flex flex-col justify-between animate-fade-in delay-2">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 text-on-surface-variant group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">forum</span>
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2 font-sans">{t('dashboard.card1_title')}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">{t('dashboard.card1_desc')}</p>
            </div>
            <div className="flex items-end gap-1.5 h-10 mt-4">
              <div className="w-1.5 bg-primary/30 rounded-full animate-pulse" style={{ height: '40%' }}></div>
              <div className="w-1.5 bg-primary/50 rounded-full animate-pulse" style={{ height: '70%' }}></div>
              <div className="w-1.5 bg-primary/70 rounded-full animate-pulse" style={{ height: '100%' }}></div>
              <div className="w-1.5 bg-secondary/50 rounded-full animate-pulse" style={{ height: '60%' }}></div>
              <div className="w-1.5 bg-secondary/30 rounded-full animate-pulse" style={{ height: '80%' }}></div>
            </div>
          </div>

          <div className="bg-[#121214]/40 backdrop-blur-2xl rounded-xl p-6 border border-white/[0.05] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 group shadow-lg flex flex-col justify-between animate-fade-in delay-3">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 text-on-surface-variant group-hover:text-secondary transition-colors">
                <span className="material-symbols-outlined text-[20px]">document_scanner</span>
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2 font-sans">{t('dashboard.card2_title')}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">{t('dashboard.card2_desc')}</p>
            </div>
            <div className="mt-auto bg-white/[0.02] rounded-lg p-3 flex justify-between items-center border border-white/[0.05]">
              <span className="text-[10px] font-semibold text-on-surface-variant tracking-wider uppercase">Match Score</span>
              <span className="text-xl font-bold text-secondary font-sans">87%</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#121214]/40 backdrop-blur-2xl rounded-xl p-6 border border-white/[0.05] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 flex flex-col md:flex-row items-center gap-8 group shadow-lg animate-fade-in delay-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-tertiary text-[24px]">auto_graph</span>
                <h3 className="text-lg font-semibold text-on-surface font-sans">{t('dashboard.card3_title')}</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-md">{t('dashboard.card3_desc')}</p>
            </div>
            <div className="w-full md:w-80 bg-background border border-white/[0.06] rounded-xl p-4 shadow-md relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-500">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <span className="text-[9px] font-semibold text-secondary tracking-wider uppercase mb-1.5 block">{t('dashboard.insight_title')}</span>
              <p className="text-xs text-on-surface-variant italic">{t('dashboard.insight_desc')}</p>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="flex justify-between items-center mb-8 animate-fade-in delay-4">
          <h3 className="text-xl font-semibold text-on-surface tracking-tight font-sans">{isVi ? 'Hoạt động của bạn' : 'Your Activity'}</h3>
          <button onClick={() => navigate('/results')} className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
            {isVi ? 'Xem toàn bộ lịch sử' : 'View full history'}
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>

        {/* Social Proof & Stats Section (Bento Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in delay-4">
          {/* Large Card: Success Stories */}
          <div className="lg:col-span-2 bg-[#121214]/40 backdrop-blur-2xl rounded-xl p-8 border border-white/[0.05] flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-semibold text-on-surface tracking-tight leading-snug mb-4 max-w-md font-sans">
                {isVi ? 'Được tin dùng bởi hơn 10.000+ ứng viên thành công' : 'Trusted by 10,000+ successful candidates'}
              </h3>
              <p className="text-on-surface-variant text-sm max-w-sm mb-6">
                {isVi
                  ? 'Từ sinh viên mới tốt nghiệp đến các quản lý cấp cao, Obsidian AI là người bạn đồng hành không thể thiếu.'
                  : 'From fresh graduates to senior managers, Obsidian AI is an indispensable companion.'}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-8 h-8 rounded-full border border-background" />
                ))}
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[9px] font-bold text-on-surface-variant">
                  +9k
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Column */}
          <div className="flex flex-col gap-6">
            {/* Top Wide-ish Card: Productivity */}
            <div className="bg-[#121214]/40 backdrop-blur-2xl rounded-xl p-6 border border-white/[0.05] flex flex-col justify-between h-full group relative overflow-hidden hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
              <div className="absolute top-0 right-0 p-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                </div>
              </div>
              <div className="mt-8">
                <span className="text-[9px] font-semibold text-primary tracking-[0.2em] uppercase mb-1 block">{isVi ? 'NĂNG SUẤT X10' : '10X PRODUCTIVITY'}</span>
                <h4 className="text-xl font-bold text-on-surface tracking-tight font-sans">{isVi ? 'Rút ngắn thời gian chuẩn bị' : 'Shorten prep time'}</h4>
              </div>
            </div>

            {/* Bottom Two Squares */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#121214]/40 backdrop-blur-2xl rounded-xl p-5 border border-white/[0.05] flex flex-col items-center justify-center text-center hover:border-white/[0.12] transition-all">
                <span className="text-2xl font-bold text-primary mb-0.5 font-sans">98%</span>
                <span className="text-[9px] font-semibold text-on-surface-variant tracking-wider uppercase">{isVi ? 'Tỉ lệ hài lòng' : 'Satisfaction rate'}</span>
              </div>

              <div className="bg-primary/5 backdrop-blur-2xl rounded-xl p-5 border border-primary/20 flex flex-col items-center justify-center text-center group hover:bg-primary/10 transition-all">
                <span className="text-xl font-bold text-primary mb-0.5 font-sans">24/7</span>
                <span className="text-[9px] font-semibold text-primary/80 tracking-wider uppercase">{isVi ? 'Hỗ trợ mọi lúc' : 'Always here'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;

