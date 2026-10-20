import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RefreshCw, Sparkles, Download, Check } from 'lucide-react';

interface AudioVoiceoverPlayerProps {
  text: string;
  audioBase64?: string;
  onAudioGenerated: (base64: string) => void;
}

export const AudioVoiceoverPlayer: React.FC<AudioVoiceoverPlayerProps> = ({
  text,
  audioBase64,
  onAudioGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('Fenrir');
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = audioBase64 ? `data:audio/wav;base64,${audioBase64}` : null;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioBase64]);

  const handleGenerateTTS = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName,
          style: 'Clear, modern Tamil conversational creator voice with natural pauses and subtle emphasis',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate voice-over audio');
      }

      if (data.audioBase64) {
        onAudioGenerated(data.audioBase64);
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      setError(err.message || 'TTS generation failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.error('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 mt-3">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-200">Tamil Voice-over Synthesizer</span>
            <span className="text-[10px] text-zinc-400 block">Powered by Gemini 3.8 Flash Lite TTS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice selector */}
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
          >
            <option value="Fenrir">Voice: Fenrir (Warm Male / Arjun)</option>
            <option value="Puck">Voice: Puck (Energetic Male)</option>
            <option value="Kore">Voice: Kore (Natural Female)</option>
            <option value="Zephyr">Voice: Zephyr (Calm Narrator)</option>
            <option value="Charon">Voice: Charon (Deep Authority)</option>
          </select>

          <button
            onClick={handleGenerateTTS}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{audioBase64 ? 'Re-generate Audio' : 'Synthesize Tamil Voice'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-900/30 border border-red-700/50 text-[11px] text-red-300">
          {error}
        </div>
      )}

      {audioSrc ? (
        <div className="flex items-center gap-3 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
          <audio
            ref={audioRef}
            src={audioSrc}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />

          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-transform active:scale-95 shadow-md flex-shrink-0"
            title={isPlaying ? 'Pause' : 'Play audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="font-medium text-amber-300/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Tamil Audio Ready ({voiceName})
              </span>
              <span>24kHz WAV</span>
            </div>

            {/* Simulated interactive waveform */}
            <div className="h-4 flex items-center gap-0.5 w-full overflow-hidden">
              {[40, 65, 80, 45, 90, 75, 30, 85, 100, 60, 40, 95, 70, 50, 85, 60, 30, 75, 90, 55, 45, 80, 65, 90, 35, 70, 50, 80, 40, 65].map((val, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (val * ((i % 3) + 1)) % 100)}%` : `${val}%`,
                    animationDelay: `${i * 30}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          <a
            href={audioSrc}
            download="tamil-voiceover.wav"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition-colors"
            title="Download Voice-over WAV"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="text-center py-2 text-xs text-zinc-500 italic">
          Click "Synthesize Tamil Voice" to render authentic Tamil speech using Gemini TTS
        </div>
      )}
    </div>
  );
};
