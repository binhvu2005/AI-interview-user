import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

const InterviewPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVi = i18n.language.startsWith('vi');
  const hasInitialized = useRef(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem('interview_duration') || '15') * 60);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isVi ? 'vi-VN' : 'en-US';
    utterance.rate = 1.15;
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang.startsWith(isVi ? 'vi' : 'en') && (v.name.includes('Google') || v.name.includes('Online') || v.name.includes('Natural')));
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = isVi ? 'vi-VN' : 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) setUserInput(prev => prev + event.results[i][0].transcript);
        }
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, [isVi]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const startMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        if (videoRef.current) videoRef.current.srcObject = userStream;

        setTimeout(() => {
          const intro = isVi
            ? "Chào mừng bạn đến với buổi phỏng vấn giả định. Tôi là Obsidian AI. Hãy giới thiệu ngắn gọn về bản thân bạn."
            : "Welcome to your mock interview. I am Obsidian AI. Please introduce yourself briefly.";
          addMessage('ai', intro);
        }, 1000);
      } catch (err) { toast.error("Camera access denied"); }
    };

    startMedia();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (role: 'ai' | 'user', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
    if (role === 'ai') speak(content);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;
    const answer = userInput.trim();
    addMessage('user', answer);
    setUserInput("");
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        history: messages.concat({ role: 'user', content: answer, timestamp: new Date() }),
        cvData: localStorage.getItem('last_cv_content') || "No CV Provided",
        jdText: localStorage.getItem('last_jd_content') || "No JD Provided",
        position: localStorage.getItem('interview_position') || "Software Engineer",
        level: localStorage.getItem('interview_level') || "Senior",
        lang: i18n.language,
        duration: localStorage.getItem('interview_duration') || "15"
      };

      const res = await fetch(API_ENDPOINTS.AI.CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data) {
        const aiMessage = data.nextQuestion || data.content || data.feedback || "";
        const aiFeedback = (data.nextQuestion && data.feedback) ? `${data.feedback} ` : "";

        if (aiMessage || aiFeedback) {
          addMessage('ai', `${aiFeedback}${aiMessage}`);
        }

        if (data.isFinished) setTimeout(() => endInterview(), 3000);
      } else {
        throw new Error(data?.message || "Server Error");
      }
    } catch (err: any) {
      console.error("Interview Send Message Error:", err);
      setTimeout(() => {
        const errorMessage = isVi
          ? "Hệ thống AI đang tạm thời bận. Vui lòng gửi lại câu trả lời."
          : "The AI system is busy. Please resend your answer.";
        addMessage('ai', errorMessage);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = () => { if (recognitionRef.current) { setIsRecording(true); recognitionRef.current.start(); } };
  const stopRecording = () => { if (recognitionRef.current) { setIsRecording(false); recognitionRef.current.stop(); } };

  const endInterview = async () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    window.speechSynthesis.cancel();

    const loadingToast = toast.loading(isVi ? "Đang phân tích..." : "Analyzing...");

    try {
      const token = localStorage.getItem('token');
      const payload = {
        position: localStorage.getItem('interview_position') || "Software Engineer",
        level: localStorage.getItem('interview_level') || "Senior",
        duration: parseInt(localStorage.getItem('interview_duration') || '15'),
        matchScore: parseInt(localStorage.getItem('last_match_score') || '0'),
        matchAnalysis: localStorage.getItem('last_match_analysis') || "",
        messages,
        cvData: localStorage.getItem('last_cv_content') || "",
        jdText: localStorage.getItem('last_jd_content') || "",
        lang: i18n.language
      };

      const res = await fetch(API_ENDPOINTS.INTERVIEWS.SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({ message: "Error" }));

      if (res.ok) {
        toast.success(isVi ? "Hoàn thành" : "Finished", { id: loadingToast });
        navigate(`/results/${data.interviewId}`);
      } else {
        throw new Error(data.message || "Failed");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark bg-[#0e0e0f] text-white' : 'bg-slate-50 text-slate-900'} transition-all overflow-hidden font-sans`}>
      {/* Header */}
      <nav className="h-16 px-8 border-b border-white/5 flex justify-between items-center backdrop-blur-2xl shrink-0 z-50 bg-black/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-[10px] bg-[#1a1a1e] border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#a3a6ff] text-[18px]">seedling</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Obsidian AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-full font-mono text-xs font-black border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-white/60'}`}>
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setIsDark(!isDark)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
            <span className="material-symbols-outlined text-lg">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={endInterview} className="bg-red-500/10 text-red-400 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Exit</button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/5 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-none scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-6 rounded-[24px] ${msg.role === 'ai' ? 'bg-white/5 text-white rounded-bl-none border border-white/5' : 'bg-[#a3a6ff] text-black rounded-br-none shadow-lg shadow-[#a3a6ff]/20'}`}>
                  <p className="text-[9px] font-black opacity-40 mb-2 uppercase tracking-[0.2em]">{msg.role === 'ai' ? 'Obsidian AI' : (isVi ? 'BẠN' : 'YOU')}</p>
                  <p className="text-base leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/5 px-6 py-4 rounded-full border border-white/5 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#a3a6ff] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#a3a6ff] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#a3a6ff] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[10px] font-black opacity-50 tracking-widest uppercase">{isVi ? 'Đang suy nghĩ...' : 'Thinking...'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 bg-black/20 backdrop-blur-3xl border-t border-white/5 shrink-0">
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2 pl-6 border border-white/5 focus-within:border-[#a3a6ff]/30 transition-all">
              <input 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                placeholder={isVi ? "Nhập câu trả lời..." : "Type answer..."} 
                className="flex-1 bg-transparent border-none outline-none py-4 text-base placeholder:text-white/20" 
              />
              <div className="flex items-center gap-2 pr-2">
                <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-[#a3a6ff] hover:bg-white/5'}`}>
                  <span className="material-symbols-outlined text-[22px]">{isRecording ? 'graphic_eq' : 'mic'}</span>
                </button>
                <button onClick={handleSendMessage} disabled={!userInput.trim() || isProcessing} className="w-12 h-12 bg-[#a3a6ff] text-black rounded-xl flex items-center justify-center shadow-lg shadow-[#a3a6ff]/20 disabled:opacity-20 hover:scale-105 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-[22px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
          {/* Camera Feed */}
          <div className="bg-black rounded-[32px] overflow-hidden relative aspect-video lg:aspect-auto lg:h-[480px] border border-white/10 shadow-2xl group">
            {isVideoOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1e]">
                <span className="material-symbols-outlined text-6xl text-white/5">videocam_off</span>
                <p className="text-[10px] font-black text-white/20 mt-4 uppercase tracking-widest">Camera Off</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsMuted(!isMuted)} className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-black/40 border-white/10 text-white'}`}>
                <span className="material-symbols-outlined text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
              </button>
              <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border ${isVideoOff ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-black/40 border-white/10 text-white'}`}>
                <span className="material-symbols-outlined text-xl">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
              </button>
            </div>
          </div>

          {/* Timer Card */}
          <div className="bg-[#a3a6ff]/5 rounded-[32px] p-8 border border-[#a3a6ff]/10 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#a3a6ff]/40 to-transparent"></div>
            <div className="flex items-center gap-3 mb-2 opacity-40">
              <span className="material-symbols-outlined text-sm">timer</span>
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em]">{isVi ? 'THỜI GIAN CÒN LẠI' : 'TIME REMAINING'}</h3>
            </div>
            <p className={`text-5xl font-black tracking-tighter ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#a3a6ff]'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;
