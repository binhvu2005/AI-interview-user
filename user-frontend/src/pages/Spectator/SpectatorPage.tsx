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
    <div className="h-screen bg-background text-on-surface flex flex-col overflow-hidden font-sans bg-grid-pattern">
      {/* Header */}
      <div className="h-14 px-6 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-6 h-6 rounded-md bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary">
             <span className="material-symbols-outlined text-[16px]">visibility</span>
           </div>
           <div>
              <p className="text-on-surface text-xs font-semibold uppercase tracking-wider">{t('watch.status_live')}</p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider mt-0.5">{t('watch.room_code')}: {code}</p>
           </div>
        </div>
        <button 
          onClick={() => navigate('/join')}
          className="btn-secondary px-4 py-2 text-xs font-semibold"
        >
          {t('watch.btn_leave')}
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 overflow-hidden relative bg-transparent">
        {connecting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md p-6">
             <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                <div className="absolute inset-0 border-2 border-outline-variant/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-t-primary rounded-full animate-spin"></div>
                <span className="material-symbols-outlined text-2xl text-primary/80 animate-pulse">sensors</span>
             </div>
             <p className="text-on-surface font-semibold text-sm uppercase tracking-[0.3em] mb-1.5">{t('watch.waiting_host') || 'PHÒNG CHỜ'}</p>
             <p className="text-on-surface-variant/80 text-xs font-medium tracking-wide animate-pulse mb-8">{t('watch.waiting_host_desc') || 'Đang chờ người phỏng vấn bắt đầu...'}</p>
             
             {/* Manual Retry/Join Button after 5s */}
             <button 
               onClick={() => window.location.reload()}
               className="btn-secondary px-5 py-2.5 text-xs font-semibold"
             >
               {isVi ? 'Thử kết nối lại' : 'Retry Connection'}
             </button>
          </div>
        )}

        {/* Left Column: Chat Area */}
        <div className="flex-1 flex flex-col bento-card bg-surface/50 backdrop-blur-md relative overflow-hidden">
          <div className="p-4 border-b border-outline-variant/10 shrink-0 bg-surface-container/20 backdrop-blur-sm">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">forum</span>
              {isVi ? 'HỘI THOẠI PHỎNG VẤN' : 'INTERVIEW CHAT LOG'}
            </h3>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 scrollbar-hidden scroll-smooth">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-4 rounded-xl ${msg.role === 'ai' ? 'bg-surface-container-high border border-outline-variant/40 text-on-surface rounded-bl-none' : 'bg-primary text-on-primary rounded-br-none shadow-sm shadow-primary/5'}`}>
                    <p className={`text-[9px] font-semibold mb-1.5 uppercase tracking-wider ${msg.role === 'ai' ? 'text-primary' : 'text-on-primary/80'}`}>
                      {msg.role === 'ai' ? 'Obsidian AI' : (isVi ? 'ỨNG VIÊN' : 'CANDIDATE')}
                    </p>
                    <p className="text-sm leading-relaxed font-sans">{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-20">
                <span className="material-symbols-outlined text-4xl mb-3 text-primary/60">chat_bubble_outline</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/50">
                  {isVi ? 'Đang chờ tin nhắn đầu tiên...' : 'Waiting for first message...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Video Sidebar */}
        <div className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
          {/* Camera Feed */}
          <div className="bg-black rounded-2xl overflow-hidden relative aspect-video lg:aspect-auto lg:h-[300px] border border-outline-variant/30 shadow-xl group flex items-center justify-center">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover bg-black"
            />

            {!remoteStream && !connecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                 <span className="material-symbols-outlined text-4xl text-white/10 mb-3">videocam_off</span>
                 <p className="text-white/30 font-semibold text-[11px] uppercase tracking-wider">{t('watch.no_signal')}</p>
              </div>
            )}

            {/* Live Indicator overlay */}
            {!connecting && remoteStream && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white text-[9px] font-semibold uppercase tracking-wider">{t('spectator.live_tag') || 'LIVE'}</span>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bento-card p-6 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mb-4 text-primary">
              <span className="material-symbols-outlined text-lg font-bold">badge</span>
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface mb-1">
              {isVi ? 'TRẠNG THÁI THEO DÕI' : 'MONITORING SESSION'}
            </h4>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-[260px]">
              {isVi 
                ? 'Bạn đang theo dõi buổi phỏng vấn giả định trực tiếp của Obsidian AI.' 
                : 'You are spectating a live mock interview session powered by Obsidian AI.'}
            </p>
          </div>

          {/* Warning Card */}
          <div className="bento-card p-5 bg-surface/30 backdrop-blur-sm">
             <p className="text-on-surface-variant/80 text-[11px] leading-relaxed font-medium">
               {t('watch.footer_warning') || 'Lưu ý: Mọi hành vi quay phim, sao chép nội dung câu hỏi và câu trả lời đều bị nghiêm cấm để bảo vệ quyền sở hữu trí tuệ.'}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpectatorPage;
