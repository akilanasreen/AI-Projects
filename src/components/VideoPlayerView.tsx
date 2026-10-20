import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Subtitles,
  Maximize2,
  Sparkles,
  Share2,
  Check,
  Film,
} from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoPlayerViewProps {
  video: GeneratedVideo;
  onGenerateNextScene?: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  video,
  onGenerateNextScene,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [syncVoiceover, setSyncVoiceover] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isPortrait = video.aspectRatio === '9:16';
  const streamUrl = `/api/video-stream?operationName=${encodeURIComponent(video.operationName)}`;
  const audioUrl = video.ttsAudioBase64
    ? `data:audio/wav;base64,${video.ttsAudioBase64}`
    : null;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [video.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current && syncVoiceover) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (audioRef.current && syncVoiceover) {
            audioRef.current.currentTime = videoRef.current?.currentTime || 0;
            audioRef.current.play().catch(() => {});
          }
        })
        .catch((err) => console.error('Play failed:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (audioRef.current && syncVoiceover) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
    if (audioRef.current && syncVoiceover) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleDownloadMp4 = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: video.operationName }),
      });

      if (!res.ok) {
        throw new Error('Failed to download video file');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.sceneTitle.replace(/[^a-zA-Z0-9]/g, '_')}_veo3.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
      // Fallback direct stream link
      window.open(streamUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Subtitle lines split
  const subtitleLines = video.voiceOver
    ? video.voiceOver.split('\n').filter((l) => l.trim().length > 0)
    : [];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="font-semibold text-sm text-white truncate max-w-sm">
            {video.sceneTitle}
          </h3>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-semibold border border-zinc-700">
            {video.aspectRatio}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {video.resolution}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showSubtitles
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title="Toggle Tamil Subtitles"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tamil Captions</span>
          </button>

          {audioUrl && (
            <button
              onClick={() => setSyncVoiceover(!syncVoiceover)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                syncVoiceover
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
              title="Sync Gemini TTS Voice-over with Video"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Voice-over</span>
            </button>
          )}

          <button
            onClick={handleDownloadMp4}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-sm disabled:opacity-50"
            title="Download MP4 Video"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Downloading...' : 'Export MP4'}</span>
          </button>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div
        ref={containerRef}
        className="relative bg-black flex items-center justify-center overflow-hidden min-h-[380px] max-h-[640px]"
      >
        {/* Hidden synced audio element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => {
              if (videoRef.current?.loop) {
                audioRef.current!.currentTime = 0;
                audioRef.current!.play();
              }
            }}
          />
        )}

        <div
          className={`relative w-full flex items-center justify-center transition-all ${
            isPortrait ? 'max-w-[340px] aspect-[9/16]' : 'max-w-4xl aspect-[16/9]'
          }`}
        >
          <video
            ref={videoRef}
            src={streamUrl}
            playsInline
            loop
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer shadow-2xl"
          />

          {/* Subtitles Overlay */}
          {showSubtitles && subtitleLines.length > 0 && (
            <div className="absolute bottom-14 inset-x-4 z-20 pointer-events-none flex flex-col items-center justify-end text-center">
              <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 max-w-[90%] shadow-lg transition-all">
                <p className="text-sm sm:text-base font-bold text-amber-300 leading-snug drop-shadow-md">
                  {subtitleLines[0]}
                </p>
                {subtitleLines[1] && (
                  <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                    {subtitleLines[1]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Big Play Button Overlay when Paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Video Player Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6 flex flex-col gap-2">
          {/* Seek Bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
          />

          <div className="flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="hover:text-amber-400 transition-colors p-1"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="hover:text-amber-400 transition-colors p-1"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="font-mono text-[11px] text-zinc-400">
                {formatSecs(currentTime)} / {formatSecs(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="hover:text-amber-400 transition-colors p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleCopyLink}
                className="hover:text-amber-400 transition-colors p-1"
                title="Copy stream link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleFullscreen}
                className="hover:text-amber-400 transition-colors p-1"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scene Synopsis Card */}
      <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-2">
            <span>Voice-over Narration (Tamil):</span>
            <span className="text-[10px] text-amber-400 font-mono">Veo 3 Audio Compatible</span>
          </div>
          <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
            {video.voiceOver}
          </p>
        </div>

        {onGenerateNextScene && (
          <button
            onClick={onGenerateNextScene}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Next Tip Scene</span>
          </button>
        )}
      </div>
    </div>
  );
};
