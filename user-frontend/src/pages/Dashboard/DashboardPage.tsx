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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-6 border border-primary/20 animate-pulse-slow">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {t('dashboard.tag')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-on-surface tracking-tighter leading-[1.05] mb-6 font-headline">
              {t('dashboard.title1')} <br /> {t('dashboard.title2')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dim to-secondary animate-gradient-x">{t('dashboard.title3')}</span> <br />
              {t('dashboard.title4')}
            </h1>

            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-8">
              {t('dashboard.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/preparation')} className="bg-primary text-on-primary font-bold px-8 py-4 rounded-xl hover:bg-primary-dim transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(163,166,255,0.3)] flex items-center justify-center gap-2 group w-full sm:w-auto">
                {t('dashboard.btn_start')}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="bg-surface-container-high text-on-surface border border-outline-variant/20 font-bold px-8 py-4 rounded-xl hover:bg-surface-container-highest transition-all hover:border-primary/30 w-full sm:w-auto">
                {t('dashboard.btn_demo')}
              </button>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative lg:h-[500px]">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-[80px] rounded-full z-0 pointer-events-none animate-pulse-slow"></div>
            <div className="relative z-10 w-full h-full bg-surface-container-lowest/50 backdrop-blur-sm border border-outline-variant/15 rounded-3xl shadow-2xl overflow-hidden p-2">
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
                    <img alt="App Interface Demo" className="w-[120%] opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGpU5MncpskOFGzorI3omSYIf3aBd_3paG35MlxaEvx7kyOT2Xs4mqKnKwnAmfm0xUXIsM630XU26H6czWwW76gBe4IXeoin1fS2NEUS1K-s5Rusu9H4FSebw6LugJpQhEx80Xtn7Sz1w1WYRX-ITQjkVp9BXPuiehAeeoAjg_Yoj3NmhfO6n30UZj-9a0IqYXxTcgWagJEYb1r9ueuy2VFUnrQgqdHMdrpdJHaChEBL0Gn_qPjofY8Mo-YgtCSpnIoCz-tLFRGbzT" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-surface-container-high/90 backdrop-blur-md border border-outline-variant/20 rounded-2xl p-4 shadow-xl flex items-center gap-4 z-20">
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
        <div className="text-center mb-16 animate-fade-in delay-1">
          <h2 className="text-3xl font-black text-on-surface tracking-tight mb-4 font-headline">{t('dashboard.section_title')}</h2>
          <p className="text-on-surface-variant text-base max-w-2xl mx-auto">
            {t('dashboard.section_desc')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-3xl p-8 border border-outline-variant/15 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 group animate-fade-in delay-2">
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

          <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-3xl p-8 border border-outline-variant/15 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col group animate-fade-in delay-3">
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

          <div className="md:col-span-2 bg-surface-container-low/50 backdrop-blur-sm rounded-3xl p-8 border border-outline-variant/15 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col md:flex-row items-center gap-8 group animate-fade-in delay-4">
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
        <div className="flex justify-between items-center mb-8 animate-fade-in delay-4">
          <h3 className="text-2xl font-black text-on-surface tracking-tight font-headline">{isVi ? 'Hoạt động của bạn' : 'Your Activity'}</h3>
          <button onClick={() => navigate('/results')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            {isVi ? 'Xem toàn bộ lịch sử' : 'View full history'}
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>

        {/* Social Proof & Stats Section (Bento Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in delay-4">
          {/* Large Card: Success Stories */}
          <div className="lg:col-span-2 bg-surface-container-low/50 backdrop-blur-sm rounded-[32px] p-10 border border-outline-variant/15 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-on-surface tracking-tighter leading-tight mb-6 max-w-md font-headline">
                {isVi ? 'Được tin dùng bởi hơn 10.000+ ứng viên thành công' : 'Trusted by 10,000+ successful candidates'}
              </h3>
              <p className="text-on-surface-variant text-base max-w-sm mb-10">
                {isVi
                  ? 'Từ sinh viên mới tốt nghiệp đến các quản lý cấp cao, Obsidian AI là người bạn đồng hành không thể thiếu.'
                  : 'From fresh graduates to senior managers, Obsidian AI is an indispensable companion.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-surface-container-low" />
                ))}
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                  +9k
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Column */}
          <div className="flex flex-col gap-6">
            {/* Top Wide-ish Card: Productivity */}
            <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-[32px] p-8 border border-outline-variant/15 flex flex-col justify-between h-full group relative overflow-hidden hover:border-primary/30 transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 p-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-2 block animate-pulse-slow">{isVi ? 'NĂNG SUẤT X10' : '10X PRODUCTIVITY'}</span>
                <h4 className="text-2xl font-black text-on-surface tracking-tight font-headline">{isVi ? 'Rút ngắn thời gian chuẩn bị' : 'Shorten prep time'}</h4>
              </div>
            </div>

            {/* Bottom Two Squares */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-[32px] p-6 border border-outline-variant/15 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-all">
                <span className="text-3xl font-black text-primary mb-1 font-headline animate-text-glow">98%</span>
                <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">{isVi ? 'Tỉ lệ hài lòng' : 'Satisfaction rate'}</span>
              </div>

              <div className="bg-primary/10 backdrop-blur-sm rounded-[32px] p-6 border border-primary/20 flex flex-col items-center justify-center text-center group hover:bg-primary/20 transition-all">
                <span className="text-2xl font-black text-primary mb-1 font-headline">24/7</span>
                <span className="text-[10px] font-bold text-primary/80 tracking-wider uppercase">{isVi ? 'Hỗ trợ mọi lúc' : 'Always here'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;

