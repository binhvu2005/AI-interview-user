import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Peer from 'simple-peer';
import { socketService } from '../../services/socket.service';

interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

const SpectatorPage = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const { code } = useParams();
  const navigate = useNavigate();
  
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const peerRef = useRef<Peer.Instance | null>(null);

  // Auto scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    console.log('--- Spectator Page Mounted ---');
    const name = localStorage.getItem('spectator_name') || t('showcase.anonymous');
    const socket = socketService.connect();
    
    console.log('--- Socket State:', socket.connected ? 'Connected' : 'Connecting...', '---');

    socket.on('connect', () => {
      console.log('--- Socket Connected! ID:', socket.id, '---');
      if (code) {
        console.log('--- Joining room:', code, 'as', name, '---');
        socket.emit('join-room-spectator', { roomCode: code, name });
      }
    });

    socket.on('connect_error', (err: any) => {
      console.error('--- Socket Connection Error: ---', err);
    });

    socket.on('sync-messages', (receivedMessages: any[]) => {
      console.log('[WebRTC] Syncing chat messages. Count:', receivedMessages.length);
      setMessages(receivedMessages);
    });

    socket.on('error-msg', (msg: string) => {
      console.error('--- Received error-msg:', msg, '---');
      toast.error(msg);
      navigate('/join');
    });

    socket.on('signal', ({ from, signal }) => {
      console.log('[WebRTC] Received signal from host:', signal.type || 'candidate');
      // If we get an offer but already have a peer, it means the host restarted
      if (signal.type === 'offer' && peerRef.current) {
        console.log('[WebRTC] Host restarted, recreating peer...');
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (!peerRef.current) {
        console.log('[WebRTC] Creating new peer connection...');
        // We are the receiver, host initiates
        const peer = new Peer({
          initiator: false,
          trickle: true,
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

        peer.on('signal', (data) => {
          console.log('[WebRTC] Sending signal back to host:', data.type || 'candidate');
          socket.emit('signal', { to: from, signal: data });
        });

        peer.on('stream', (stream) => {
          console.log('[WebRTC] Stream received successfully!');
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setConnecting(false);
        });

        peer.on('error', (err) => {
          console.error('[WebRTC] Peer error:', err);
          toast.error(t('watch.err_stream'));
        });

        peer.on('connect', () => {
          console.log('[WebRTC] Peer connected!');
        });

        peerRef.current = peer;
      }
      peerRef.current.signal(signal);
    });

    socket.on('kicked', () => {
      toast.error(t('watch.kicked_msg'), { icon: '🚫' });
      navigate('/join');
    });

    socket.on('interview-ended', () => {
      toast.success(isVi ? 'Buổi phỏng vấn đã kết thúc thành công.' : 'The interview has ended successfully.', { icon: '🎓' });
      navigate('/join');
    });

    return () => {
      socket.off('error-msg');
      socket.off('signal');
      socket.off('kicked');
      socket.off('interview-ended');
      socket.off('sync-messages');
      if (peerRef.current) peerRef.current.destroy();
      socketService.disconnect();
    };
  }, [code, navigate, t]);

  return (
    <div className="h-screen bg-background text-on-surface flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="h-16 px-6 bg-surface/10 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
             <span className="material-symbols-outlined text-white text-sm">visibility</span>
           </div>
           <div>
              <p className="text-white text-xs font-black uppercase tracking-widest">{t('watch.status_live')}</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{t('watch.room_code')}: {code}</p>
           </div>
        </div>
        <button 
          onClick={() => navigate('/join')}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {t('watch.btn_leave')}
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 overflow-hidden relative">
        {connecting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6">
             <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                <span className="material-symbols-outlined text-4xl text-primary">sensors</span>
             </div>
             <p className="text-white font-black text-sm uppercase tracking-[0.4em] mb-2">{t('watch.waiting_host') || 'PHÒNG CHỜ'}</p>
             <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse mb-8">{t('watch.waiting_host_desc') || 'Đang chờ người phỏng vấn bắt đầu...'}</p>
             
             {/* Manual Retry/Join Button after 5s */}
             <button 
               onClick={() => window.location.reload()}
               className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest transition-all"
             >
               {isVi ? 'Thử kết nối lại' : 'Retry Connection'}
             </button>
          </div>
        )}

        {/* Left Column: Chat Area */}
        <div className="flex-1 flex flex-col bg-surface-container-low rounded-[32px] border border-outline-variant/10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-outline-variant/10 shrink-0 bg-surface/50 backdrop-blur-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">forum</span>
              {isVi ? 'HỘI THOẠI PHỎNG VẤN' : 'INTERVIEW CHAT LOG'}
            </h3>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-none scroll-smooth">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-6 rounded-[24px] ${msg.role === 'ai' ? 'bg-surface-container text-on-surface rounded-bl-none border border-outline-variant/10' : 'bg-primary text-on-primary rounded-br-none shadow-lg shadow-primary/20'}`}>
                    <p className="text-[9px] font-black opacity-60 mb-2 uppercase tracking-[0.2em]">
                      {msg.role === 'ai' ? 'Obsidian AI' : (isVi ? 'ỨNG VIÊN' : 'CANDIDATE')}
                    </p>
                    <p className="text-base leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-5xl mb-4">chat_bubble_outline</span>
                <p className="text-xs font-black uppercase tracking-widest">
                  {isVi ? 'Đang chờ tin nhắn đầu tiên...' : 'Waiting for first message...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video Sidebar */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
          {/* Camera Feed */}
          <div className="bg-surface-container-lowest rounded-[32px] overflow-hidden relative aspect-video lg:aspect-auto lg:h-[320px] border border-outline-variant/20 shadow-2xl group flex items-center justify-center">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover bg-black"
            />

            {!remoteStream && !connecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                 <span className="material-symbols-outlined text-5xl text-white/10 mb-4">videocam_off</span>
                 <p className="text-white/20 font-black text-xs uppercase tracking-widest">{t('watch.no_signal')}</p>
              </div>
            )}

            {/* Live Indicator overlay */}
            {!connecting && remoteStream && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white text-[9px] font-black uppercase tracking-widest">{t('spectator.live_tag') || 'LIVE'}</span>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 rounded-[32px] p-8 border border-primary/10 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-xl font-bold">badge</span>
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-on-surface mb-1">
              {isVi ? 'TRẠNG THÁI THEO DÕI' : 'MONITORING SESSION'}
            </h4>
            <p className="text-xs text-on-surface-variant font-medium max-w-[240px]">
              {isVi 
                ? 'Bạn đang theo dõi buổi phỏng vấn giả định trực tiếp của Obsidian AI.' 
                : 'You are spectating a live mock interview session powered by Obsidian AI.'}
            </p>
          </div>

          {/* Warning Card */}
          <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-[24px] shadow-sm">
             <p className="text-on-surface-variant/60 text-[10px] leading-relaxed font-medium">
               {t('watch.footer_warning') || 'Lưu ý: Mọi hành vi quay phim, sao chép nội dung câu hỏi và câu trả lời đều bị nghiêm cấm để bảo vệ quyền sở hữu trí tuệ.'}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpectatorPage;
