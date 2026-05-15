import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Peer from 'simple-peer';
import { socketService } from '../../services/socket.service';

const SpectatorPage = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');
  const { code } = useParams();
  const navigate = useNavigate();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connecting, setConnecting] = useState(true);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('spectator_name') || t('showcase.anonymous');
    const socket = socketService.connect();

    socket.emit('join-room-spectator', { roomCode: code, name });

    socket.on('error-msg', (msg: string) => {
      toast.error(msg);
      navigate('/join');
    });

    socket.on('signal', ({ from, signal }) => {
      // If we get an offer but already have a peer, it means the host restarted
      if (signal.type === 'offer' && peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      if (!peerRef.current) {
        // We are the receiver, host initiates
        const peer = new Peer({
          initiator: false,
          trickle: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ]
          }
        });

        peer.on('signal', (data) => {
          socket.emit('signal', { to: from, signal: data });
        });

        peer.on('stream', (stream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setConnecting(false);
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
          toast.error(t('watch.err_stream'));
        });

        peerRef.current = peer;
      }
      peerRef.current.signal(signal);
    });

    socket.on('kicked', () => {
      toast.error(t('watch.kicked_msg'), { icon: '🚫' });
      navigate('/join');
    });

    return () => {
      socket.off('error-msg');
      socket.off('signal');
      socket.off('kicked');
      if (peerRef.current) peerRef.current.destroy();
      socketService.disconnect();
    };
  }, [code, navigate, t]);

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 bg-surface/10 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-50">
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

      {/* Video Content */}
      <div className="flex-1 relative flex items-center justify-center">
        {connecting && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md p-6">
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

        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-contain bg-black"
        />

        {!connecting && !remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="material-symbols-outlined text-6xl text-white/10 mb-4">videocam_off</span>
             <p className="text-white/20 font-black text-xs uppercase tracking-widest">{t('watch.no_signal')}</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
         <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-white text-[10px] font-black uppercase tracking-widest">{t('spectator.live_tag')}</span>
         </div>
         <p className="text-white/60 text-xs max-w-md">{t('watch.footer_warning')}</p>
      </div>
    </div>
  );
};

export default SpectatorPage;
