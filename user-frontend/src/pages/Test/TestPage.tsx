import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as faceapi from 'face-api.js';
import { toast } from 'react-hot-toast';

const TestPage = () => {
  const { t } = useTranslation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [detectedExpressions, setDetectedExpressions] = useState<{[key: string]: number}>({});
  const [faceCount, setFaceCount] = useState(0);

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api.js models from CDN
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingError(null);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        toast.success(t('test_page.models_loaded'));
      } catch (err: any) {
        console.error('Error loading models:', err);
        setLoadingError(err.message || 'CORS or Network Error');
        toast.error(t('test_page.models_load_error'));
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, []);

  // Start video stream
  const startVideo = async () => {
    if (!modelsLoaded) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      toast.error(t('test_page.camera_access_denied'));
    }
  };

  // Stop video stream and clear detection loop
  const stopVideo = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setStreamActive(false);
    setFaceCount(0);
    setDetectedExpressions({});

    // Clear canvas
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Handles starting the scanning loops once video starts playing
  const handleVideoPlay = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set dimensions matching video
    const displaySize = { width: video.width || 640, height: video.height || 480 };
    faceapi.matchDimensions(canvas, displaySize);

    detectionIntervalRef.current = setInterval(async () => {
      if (!video || video.paused || video.ended) return;

      // Run detections
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // Resize detections matching output canvas size
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear canvas for fresh draw
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, displaySize.width, displaySize.height);
      }

      setFaceCount(detections.length);

      if (detections.length > 0) {
        // Collect expressions of first face
        const expressions = detections[0].expressions;
        setDetectedExpressions(expressions.asSortedArray().reduce((acc, curr) => {
          acc[curr.expression] = curr.probability;
          return acc;
        }, {} as {[key: string]: number}));

        // Draw box, landmarks, and expressions overlay
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      } else {
        setDetectedExpressions({});
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
      {/* Title */}
      <div className="text-center mb-10 relative overflow-hidden p-6 rounded-[32px] bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent border border-outline-variant/10">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-2xl">face</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-2 text-on-surface">
          {t('test_page.title')}
        </h1>
        <p className="text-on-surface-variant font-medium text-sm max-w-lg mx-auto leading-relaxed">
          {t('test_page.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls & Statistics */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-on-surface">
              {t('test_page.model_status')}
            </h2>

            {/* Model State Indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface-variant/80 uppercase">{t('test_page.ai_models_label')}</span>
                {loadingError ? (
                  <span className="text-red-400 font-bold uppercase">{t('test_page.load_error')}</span>
                ) : modelsLoaded ? (
                  <span className="text-green-400 font-bold uppercase">{t('test_page.ready')}</span>
                ) : (
                  <span className="text-yellow-400 font-bold uppercase animate-pulse">{t('test_page.loading')}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface-variant/80 uppercase">{t('test_page.camera_stream_label')}</span>
                {streamActive ? (
                  <span className="text-green-400 font-bold uppercase">{t('test_page.active')}</span>
                ) : (
                  <span className="text-on-surface-variant/40 font-bold uppercase">{t('test_page.inactive')}</span>
                )}
              </div>
            </div>

            {loadingError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                {t('test_page.error_network', { error: loadingError })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-3">
              {!streamActive ? (
                <button
                  onClick={startVideo}
                  disabled={!modelsLoaded}
                  className="w-full bg-primary text-on-primary py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  {t('test_page.start_camera')}
                </button>
              ) : (
                <button
                  onClick={stopVideo}
                  className="w-full bg-red-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">videocam_off</span>
                  {t('test_page.stop_camera')}
                </button>
              )}
            </div>
          </div>

          {/* Real-time Predictions */}
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-on-surface">
              {t('test_page.expression_analysis')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                <span className="font-bold text-on-surface-variant">{t('test_page.faces_detected')}</span>
                <span className="font-black text-primary text-sm">{faceCount}</span>
              </div>

              {Object.keys(detectedExpressions).length === 0 ? (
                <p className="text-xs text-on-surface-variant/40 italic py-4 text-center">
                  {t('test_page.no_face_detected')}
                </p>
              ) : (
                <div className="space-y-2 pt-2">
                  {Object.entries(detectedExpressions).map(([expr, val]) => (
                    <div key={expr} className="space-y-1">
                      <div className="flex justify-between text-xs uppercase font-bold">
                        <span className="text-on-surface-variant">{t(`test_page.expressions.${expr}`, { defaultValue: expr })}</span>
                        <span className="text-on-surface">{(val * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-100" 
                          style={{ width: `${val * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="lg:col-span-2">
          <div className="relative bg-black rounded-3xl overflow-hidden border border-outline-variant/15 aspect-[4/3] flex items-center justify-center shadow-lg">
            {!streamActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 bg-surface-container-lowest/80 backdrop-blur-sm">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">videocam_off</span>
                <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                  {t('test_page.video_placeholder')}
                </p>
              </div>
            )}
            
            {/* Webcam Video feed */}
            <video
              ref={videoRef}
              onPlay={handleVideoPlay}
              autoPlay
              muted
              playsInline
              width="640"
              height="480"
              className="w-full h-full object-cover"
            />

            {/* Overlapping detection Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
