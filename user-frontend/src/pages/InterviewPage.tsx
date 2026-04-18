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
    utterance.rate = 0.95;
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
        } else {
          console.warn("AI returned empty or weird data:", data);
        }
        
        if (data.isFinished) setTimeout(() => endInterview(), 3000);
      } else {
        console.error("AI Server Error:", data);
        throw new Error(data?.message || "Server Error");
      }
    } catch (err: any) {
      console.error("Interview Send Message Error:", err);
      
      // Fallback: Just inform the user and ask them to retry or wait
      setTimeout(() => {
        const errorMessage = isVi 
          ? "Hệ thống AI đang tạm thời bận hoặc gặp sự cố kết nối. Vui lòng đợi giây lát hoặc gửi lại câu trả lời của bạn."
          : "The AI system is temporarily busy or experiencing connection issues. Please wait a moment or resend your answer.";
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
    
    const loadingToast = toast.loading(isVi ? "Đang phân tích kết quả..." : "Analyzing results...");
    
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

      if (res.ok) {
        const data = await res.json();
        toast.success(isVi ? "Buổi phỏng vấn đã kết thúc" : "Interview finished", { id: loadingToast });
        navigate(`/results/${data.interviewId}`);
      } else {
        throw new Error("Failed to save interview");
      }
    } catch (err) {
      console.error("End Interview Error:", err);
      toast.error(isVi ? "Không thể lưu kết quả" : "Failed to save results", { id: loadingToast });
      navigate('/dashboard');
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark bg-background text-on-surface' : 'bg-surface-bright text-on-surface'} transition-all overflow-hidden`}>
      <nav className="h-16 px-8 border-b border-outline-variant/15 flex justify-between items-center backdrop-blur-xl shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center rotate-12">
            <span className="material-symbols-outlined text-on-primary text-sm">auto_awesome</span>
          </div>
          <span className="font-black tracking-tighter text-xl">Obsidian <span className="text-primary">Live</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full font-mono text-sm font-bold border ${timeLeft < 60 ? 'bg-error/10 border-error text-error animate-pulse' : 'bg-surface-container border-outline-variant'}`}>
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={endInterview} className="bg-error/10 text-error px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest border border-error/20 hover:bg-error hover:text-on-error">Exit</button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col bg-surface-container-low rounded-[40px] border border-outline-variant/15 shadow-2xl relative overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-hidden scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-5 rounded-[28px] ${msg.role === 'ai' ? 'bg-primary/10 text-on-surface rounded-bl-none border border-primary/10' : 'bg-primary text-on-primary rounded-br-none shadow-lg shadow-primary/20'}`}>
                  <p className="text-[10px] font-black opacity-50 mb-1 uppercase tracking-widest">{msg.role === 'ai' ? 'Obsidian AI' : 'You'}</p>
                  <p className="text-lg leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && <div className="flex justify-start animate-pulse"><div className="bg-surface-container-highest px-6 py-4 rounded-full text-[10px] font-black opacity-50 tracking-widest uppercase">Thinking...</div></div>}
          </div>

          <div className="p-8 bg-surface/40 backdrop-blur-2xl border-t border-outline-variant/15 shrink-0">
            <div className="flex items-center gap-4 bg-surface-container-highest rounded-[32px] p-2 pl-6 shadow-inner">
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isVi ? "Nhập câu trả lời..." : "Type answer..."} className="flex-1 bg-transparent border-none outline-none py-4 text-lg" />
              <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-error animate-pulse' : 'text-primary'}`}><span className="material-symbols-outlined">{isRecording ? 'graphic_eq' : 'mic'}</span></button>
              <button onClick={handleSendMessage} disabled={!userInput.trim() || isProcessing} className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-30"><span className="material-symbols-outlined">send</span></button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[350px] flex flex-col gap-4 shrink-0">
          {/* Larger Camera Feed */}
          <div className="bg-black rounded-[40px] overflow-hidden relative aspect-video lg:aspect-auto lg:h-[450px] border border-outline-variant/20 shadow-xl">
             {isVideoOff ? <div className="absolute inset-0 flex items-center justify-center bg-surface-container-highest"><span className="material-symbols-outlined text-4xl opacity-20">videocam_off</span></div> : <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />}
          </div>

          <div className="bg-surface-container-low rounded-[32px] p-4 border border-outline-variant/15 flex justify-center gap-4 shadow-sm">
             <button onClick={() => setIsMuted(!isMuted)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${isMuted ? 'bg-error/10 text-error' : 'bg-surface-container-highest'}`}><span className="material-symbols-outlined text-lg">{isMuted ? 'mic_off' : 'mic'}</span></button>
             <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${isVideoOff ? 'bg-error/10 text-error' : 'bg-surface-container-highest'}`}><span className="material-symbols-outlined text-lg">{isVideoOff ? 'videocam_off' : 'videocam'}</span></button>
          </div>

          {/* Compact Timer Card */}
          <div className="bg-primary/5 rounded-[32px] p-6 border border-primary/10 flex flex-col items-center justify-center text-center shadow-sm">
             <div className="flex items-center gap-2 mb-1 opacity-60">
                <span className="material-symbols-outlined text-primary text-sm">timer</span>
                <h3 className="font-black text-[9px] uppercase tracking-widest">{isVi ? 'Thời gian còn lại' : 'Time Remaining'}</h3>
             </div>
             <p className={`text-3xl font-black ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-primary'}`}>{formatTime(timeLeft)}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;
