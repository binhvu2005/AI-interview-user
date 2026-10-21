import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../services/api.config';
import { toast } from 'react-hot-toast';
import { fetchWithAuth } from '../../services/fetchClient';
import Peer from 'simple-peer';
import { socketService } from '../../services/socket.service';
import { speakNatural, stopSpeech } from '../../utils/speech.helper';


interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  // Interviewer turn metadata the backend uses to track interview progress; 'system' marks transient errors.
  questionType?: 'intro' | 'main' | 'probe' | 'clarify' | 'closing' | 'system';
  topic?: string;
}

const getPlannedTopics = () => {
  try {
    const plan = JSON.parse(localStorage.getItem('current_interview_plan') || 'null');
    return Array.isArray(plan?.topics) ? plan.topics : [];
  } catch {
    return [];
  }
};

const InterviewPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVi = i18n.language.startsWith('vi');
  const hasInitialized = useRef(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  // endInterview and the unmount cleanup run from closures of the first render, where `stream` is still null.
  const streamRef = useRef<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isVoiceMuted, setIsVoiceMuted] = useState(() => localStorage.getItem('ai_voice_muted') === 'true');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState(parseInt(localStorage.getItem('interview_duration') || '15') * 60);

  // Anti-Cheat
  const [cheatCount, setCheatCount] = useState(0);
  const cheatCountRef = useRef(0);
  useEffect(() => { cheatCountRef.current = cheatCount; }, [cheatCount]);
  const [showCheatModal, setShowCheatModal] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Spectator Management
  const [spectators, setSpectators] = useState<{ socketId: string, name: string }[]>([]);
  const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;

    // Sync messages immediately to all spectators when a new message is added
    const roomCode = localStorage.getItem('spectator_room_code');
    const socket = socketService.getSocket();
    if (socket && roomCode && messages.length > 0) {
      socket.emit('sync-messages', { roomCode, messages });
    }
  }, [messages]);

  const createPeer = (spectatorSocketId: string, stream: MediaStream) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun.voipbuster.com:3478' },
          { urls: 'stun:stun.sipgate.net:3478' },
          { urls: 'stun:stun.ekiga.net:3478' }
        ]
      }
    });

    peer.on('signal', signal => {
      socket.emit('signal', { to: spectatorSocketId, signal });
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
      peer.destroy();
      peersRef.current.delete(spectatorSocketId);
    });

    peersRef.current.set(spectatorSocketId, peer);
  };

  useEffect(() => {
    const roomCode = localStorage.getItem('spectator_room_code');
    if (!roomCode || !stream) return;

    const socket = socketService.connect();
    socket.emit('join-room-host', roomCode);

    socket.on('spectator-update', (list: any[]) => {
      console.log('[WebRTC] Spectators updated. Count:', list.length);
      setSpectators(list);

      if (!stream) {
        console.warn('[WebRTC] Cannot create peer: Host stream is NULL!');
        return;
      }

      list.forEach(spec => {
        if (!peersRef.current.has(spec.socketId)) {
          console.log('[WebRTC] Creating peer for new spectator:', spec.socketId);
          createPeer(spec.socketId, stream);
        }
      });

      // Emit current messages to synchronize with newly joined/updated spectators
      if (messagesRef.current.length > 0) {
        socket.emit('sync-messages', { roomCode, messages: messagesRef.current });
      }

      // Cleanup peers for spectators who left
      const currentSocketIds = new Set(list.map(s => s.socketId));
      peersRef.current.forEach((peer, socketId) => {
        if (!currentSocketIds.has(socketId)) {
          peer.destroy();
          peersRef.current.delete(socketId);
        }
      });
    });

    socket.on('signal', ({ from, signal }) => {
      console.log('[WebRTC] Received signal from spectator:', from, signal.type || 'candidate');
      const peer = peersRef.current.get(from);
      if (peer) peer.signal(signal);
    });

    return () => {
      socket.off('spectator-update');
      socket.off('signal');
      peersRef.current.forEach(p => p.destroy());
      peersRef.current.clear();
      socketService.disconnect();
    };
  }, [stream]);

  const handleKick = (socketId: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('kick-spectator', socketId);
      toast.success(t('spectator.kick_success'));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speak = (text: string) => {
    if (isVoiceMuted) return;
    speakNatural(text, {
      isVi,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const toggleVoiceMute = () => {
    setIsVoiceMuted(prev => {
      const next = !prev;
      localStorage.setItem('ai_voice_muted', String(next));
      if (next) {
        stopSpeech();
        setIsSpeaking(false);
        toast.success(isVi ? 'Đã tắt giọng đọc AI' : 'AI voice muted', { icon: '🔇' });
      } else {
        toast.success(isVi ? 'Đã bật giọng đọc AI' : 'AI voice enabled', { icon: '🔊' });
      }
      return next;
    });
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

  // Anti-Cheat Effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatCount(prev => {
          const next = prev + 1;
          toast.error(t('interview.cheat_warning'), { duration: 5000, icon: '🚨' });
          return next;
        });
      } else {
        // When they return to the tab, open the modal if cheatCount is > 0
        setCheatCount(current => {
          if (current > 0) {
            setShowCheatModal(true);
          }
          return current;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isVi]);

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
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = userStream;
          setStream(userStream);
          if (videoRef.current) videoRef.current.srcObject = userStream;
        } else {
          toast.error(t('interview.no_camera_support'));
        }
      } catch (err) {
        toast.error(t('interview.camera_access_denied'));
      } finally {
        setTimeout(() => {
          addMessage('ai', t('interview.welcome'), { questionType: 'intro' });
        }, 1000);
      }
    };

    startMedia();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      stopSpeech();
      setIsSpeaking(false);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (role: 'ai' | 'user', content: string, meta: Pick<Message, 'questionType' | 'topic'> = {}) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date(), ...meta }]);
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
        duration: localStorage.getItem('interview_duration') || "15",
        plannedTopics: getPlannedTopics()
      };

      const res = await fetchWithAuth(API_ENDPOINTS.AI.CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data) {
        const nextQ = data.nextQuestion || "";
        const feedback = data.feedback || "";

        let finalMessage = "";
        if (feedback && nextQ) {
          finalMessage = `${feedback}\n\n${nextQ}`;
        } else {
          finalMessage = nextQ || feedback || data.content || "";
        }

        if (finalMessage) {
          addMessage('ai', finalMessage, { questionType: data.questionType, topic: data.topic });
        }

        if (data.isFinished) setTimeout(() => endInterview(), 3000);
      } else {
        throw new Error(data?.message || "Server Error");
      }
    } catch (err: any) {
      console.error("Interview Send Message Error:", err);
      setTimeout(() => {
        addMessage('ai', t('interview.error_busy'), { questionType: 'system' });
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = () => { if (recognitionRef.current) { setIsRecording(true); recognitionRef.current.start(); } };
  const stopRecording = () => { if (recognitionRef.current) { setIsRecording(false); recognitionRef.current.stop(); } };

  const endInterview = async () => {
    // Notify spectators first
    const socket = socketService.getSocket();
    const roomCode = localStorage.getItem('spectator_room_code');
    if (socket && roomCode) {
      socket.emit('interview-ended', roomCode);
    }

    streamRef.current?.getTracks().forEach(t => t.stop());
    stopSpeech();
    setIsSpeaking(false);

    const loadingToast = toast.loading(t('interview.analyzing'));

    try {
      const token = localStorage.getItem('token');
      const payload = {
        position: localStorage.getItem('interview_position') || "Software Engineer",
        level: localStorage.getItem('interview_level') || "Senior",
        duration: parseInt(localStorage.getItem('interview_duration') || '15'),
        matchScore: parseInt(localStorage.getItem('last_match_score') || '0'),
        matchAnalysis: localStorage.getItem('last_match_analysis') || "",
        // Read refs: endInterview also runs from the timer and from a setTimeout after the last answer,
        // whose closures hold the state of an earlier render (missing the final answer and tab switches).
        messages: messagesRef.current,
        cvData: localStorage.getItem('last_cv_content') || "",
        jdText: localStorage.getItem('last_jd_content') || "",
        lang: i18n.language,
        cheatCount: cheatCountRef.current
      };

      const res = await fetchWithAuth(API_ENDPOINTS.INTERVIEWS.SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({ message: "Error" }));

      if (res.ok) {
        toast.success(t('results.congrats_title'), { id: loadingToast });
        navigate(`/results/${data.interviewId}`);
      } else {
        throw new Error(data.message || "Failed");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark' : ''} bg-background text-on-surface transition-all overflow-hidden font-sans`}>
      {/* Header */}
      <nav className="h-14 px-6 border-b border-white/[0.05] flex justify-between items-center backdrop-blur-2xl shrink-0 z-50 bg-background/80">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-[10px] tracking-tight">OA</span>
          </div>
          <span className="text-base font-bold tracking-tight text-on-surface">Obsidian AI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full font-mono text-xs font-semibold border ${timeLeft < 60 ? 'bg-error/10 border-error/30 text-error animate-pulse' : 'bg-white/[0.02] border-white/[0.08] text-on-surface-variant'}`}>
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={toggleVoiceMute} 
            title={isVoiceMuted ? (isVi ? 'Bật giọng đọc AI' : 'Enable AI Voice') : (isVi ? 'Tắt giọng đọc AI' : 'Mute AI Voice')} 
            className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all border cursor-pointer ${
              isVoiceMuted 
                ? 'border-white/[0.08] text-on-surface-variant/40 hover:bg-white/[0.04]' 
                : isSpeaking 
                  ? 'border-primary/50 bg-primary/10 text-primary shadow-sm animate-pulse' 
                  : 'border-white/[0.08] text-on-surface-variant hover:bg-white/[0.04]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isVoiceMuted ? 'volume_off' : isSpeaking ? 'record_voice_over' : 'volume_up'}
            </span>
            <span className="text-[11px] font-medium hidden sm:inline">
              {isVoiceMuted ? (isVi ? 'Tắt tiếng' : 'Muted') : isSpeaking ? (isVi ? 'Đang đọc...' : 'Speaking...') : (isVi ? 'Giọng AI' : 'AI Voice')}
            </span>
          </button>
          <button onClick={() => setIsDark(!isDark)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] transition-colors border border-white/[0.08] text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined text-lg">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={endInterview} className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-lg font-semibold text-[10px] uppercase tracking-wider border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer">{t('interview.exit')}</button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface border border-outline-variant/60 rounded-2xl shadow-sm relative overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 scrollbar-none scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] p-4 rounded-xl border ${msg.role === 'ai' ? 'bg-surface-container-low/50 text-on-surface rounded-tl-sm border-outline-variant/60 shadow-sm' : 'bg-surface text-on-surface rounded-tr-sm border-outline-variant shadow-sm'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${msg.role === 'ai' ? 'text-primary/90' : 'text-on-surface-variant/80'}`}>{msg.role === 'ai' ? 'Obsidian AI' : (isVi ? 'BẠN' : 'YOU')}</p>
                    {msg.role === 'ai' && (
                      <button
                        type="button"
                        onClick={() => {
                          speakNatural(msg.content, {
                            isVi,
                            onStart: () => setIsSpeaking(true),
                            onEnd: () => setIsSpeaking(false),
                            onError: () => setIsSpeaking(false),
                          });
                        }}
                        title={isVi ? "Nghe lại câu hỏi này" : "Replay this question"}
                        className="p-1 rounded hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                      >
                        <span className="material-symbols-outlined text-xs">volume_up</span>
                        <span className="text-[10px] hidden sm:inline">{isVi ? 'Nghe lại' : 'Replay'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-surface-container-low/50 px-4 py-2.5 rounded-xl border border-outline-variant/60 flex items-center gap-2.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <span className="text-[9px] font-semibold opacity-70 tracking-widest uppercase text-on-surface">{t('interview.thinking')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface-container-low/10 border-t border-outline-variant/60 shrink-0">
            <div className="flex items-center gap-3 bg-surface border border-outline-variant rounded-lg p-1.5 pl-4 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-200">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('interview.type_answer')}
                className="flex-1 bg-transparent border-none outline-none py-2 text-xs font-medium text-on-surface placeholder:text-on-surface-variant/40"
              />
              <div className="flex items-center gap-2 pr-1">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/40'} cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[18px]">{isRecording ? 'graphic_eq' : 'mic'}</span>
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={isProcessing || !userInput.trim()}
                  className="btn-primary w-9 h-9 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
          {/* Camera Feed */}
          <div className={`bg-surface rounded-2xl overflow-hidden relative aspect-video lg:aspect-auto lg:h-[260px] border border-outline-variant/60 shadow-sm group transition-all duration-500 ${!isMuted && !isVideoOff ? 'border-primary/20 ring-1 ring-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.08)]' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 bg-black transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
            />

            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-low">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">videocam_off</span>
                <p className="text-[10px] font-semibold text-on-surface-variant/60 mt-3 uppercase tracking-widest">{t('interview.camera_off')}</p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (stream) {
                    stream.getAudioTracks().forEach(track => track.enabled = !newMuted);
                  }
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md border ${isMuted ? 'bg-error/15 border-error/30 text-error' : 'bg-black/40 border-white/[0.08] text-white hover:bg-black/60'} transition-all`}
              >
                <span className="material-symbols-outlined text-lg">{isMuted ? 'mic_off' : 'mic'}</span>
              </button>
              <button
                onClick={() => {
                  const newVideoOff = !isVideoOff;
                  setIsVideoOff(newVideoOff);
                  if (stream) {
                    stream.getVideoTracks().forEach(track => track.enabled = !newVideoOff);
                  }
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md border ${isVideoOff ? 'bg-error/15 border-error/30 text-error' : 'bg-black/40 border-white/[0.08] text-white hover:bg-black/60'} transition-all`}
              >
                <span className="material-symbols-outlined text-lg">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
              </button>
            </div>
          </div>

          {/* Timer Card */}
          <div className="bg-surface rounded-2xl p-6 border border-outline-variant/60 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="flex items-center gap-2 mb-2 opacity-60">
              <span className="material-symbols-outlined text-xs text-on-surface">timer</span>
              <h3 className="font-semibold text-[9px] uppercase tracking-widest text-on-surface">{t('interview.time_remaining')}</h3>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>

          {/* Spectators Management */}
          {localStorage.getItem('spectator_room_code') && (
            <div className="flex-1 bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-sm flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xs">group</span>
                  <h3 className="font-semibold text-[9px] uppercase tracking-widest text-on-surface">{t('spectator.panel_title')} ({spectators.length})</h3>
                </div>
                <div className="bg-primary/5 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wider border border-primary/15">
                  {t('watch.room_code')}: {localStorage.getItem('spectator_room_code')}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-none">
                {spectators.length > 0 ? spectators.map(spec => (
                  <div key={spec.socketId} className="flex items-center justify-between p-2 px-3 bg-surface-container-low rounded-lg border border-outline-variant/60 group/item">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary border border-primary/15">
                        {spec.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-on-surface">{spec.name}</span>
                    </div>
                    <button
                      onClick={() => handleKick(spec.socketId)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      title={t('spectator.kick_btn')}
                    >
                      <span className="material-symbols-outlined text-xs">person_remove</span>
                    </button>
                  </div>
                )) : (
                  <div className="h-20 flex flex-col items-center justify-center opacity-30">
                    <span className="material-symbols-outlined text-2xl mb-1">visibility_off</span>
                    <p className="text-[9px] font-semibold uppercase tracking-widest">{t('spectator.panel_empty')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showCheatModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-red-500/20 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Red glowing decorative top bar */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></div>
            
            <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500">
              <span className="material-symbols-outlined text-2xl animate-bounce">warning</span>
            </div>
            
            <h3 className="text-lg font-bold tracking-tight text-white mb-2 uppercase">
              {isVi ? '🚨 Cảnh Báo Vi Phạm' : '🚨 Proctoring Violation'}
            </h3>
            
            <p className="text-xs text-on-surface-variant font-medium mb-6 leading-relaxed">
              {isVi 
                ? `Hệ thống Obsidian AI phát hiện bạn vừa rời khỏi màn hình phỏng vấn. Hành vi chuyển tab sẽ làm giảm nghiêm trọng điểm số thái độ trên báo cáo đánh giá.`
                : `Obsidian AI detected that you left the interview screen. Tab switching will severely penalize your attitude score on the final report.`
              }
            </p>
            
            <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mb-6">
              <p className="text-[9px] font-semibold text-red-400 uppercase tracking-widest mb-0.5">
                {isVi ? 'Tổng số lần vi phạm' : 'Total Violations'}
              </p>
              <p className="text-2xl font-bold text-red-500">{cheatCount} {isVi ? 'lần' : 'time(s)'}</p>
            </div>
            
            <button
              onClick={() => setShowCheatModal(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg active:scale-[0.98] transition-all text-xs uppercase tracking-widest shadow-sm cursor-pointer"
            >
              {isVi ? 'Tôi đã hiểu và cam kết tập trung' : 'I understand & will focus'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
