'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCw } from 'lucide-react';

export default function ProductVideo({ sku, parentSku }) {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        // Build URL with parentSku if available (videos are keyed by parent SKU)
        let url = `/api/videos/${encodeURIComponent(sku)}`;
        if (parentSku) {
          url += `?parentSku=${encodeURIComponent(parentSku)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.hasVideo) {
            setVideoData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    }

    if (sku) {
      fetchVideo();
    }
  }, [sku, parentSku]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (loading) {
    return null; // Don't show loading state, just hide if no video
  }

  if (!videoData || !videoData.hasVideo) {
    return null;
  }

  return (
    <div className="mt-4">
      <div
        className="relative rounded-xl overflow-hidden bg-black group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={videoData.videoUrl}
          className="w-full aspect-video object-contain"
          muted={isMuted}
          loop
          playsInline
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Play overlay for initial state */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
              <Play className="w-10 h-10 text-introcar-charcoal ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                )}
              </button>

              <button
                onClick={restartVideo}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={toggleMute}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm font-medium">360° View</span>
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-introcar-blue text-white text-xs font-bold rounded-full shadow-lg">
            TURNTABLE VIDEO
          </span>
        </div>
      </div>
    </div>
  );
}
