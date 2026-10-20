import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Clock, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { AspectRatio } from '../types';

interface GenerationModalProps {
  isOpen: boolean;
  operationName: string | null;
  aspectRatio: AspectRatio;
  sceneTitle: string;
  onClose: () => void;
  error?: string | null;
}

const STAGES = [
  { time: 0, text: 'Connecting to Veo 3 Fast Preview pipeline...' },
  { time: 8, text: 'Locking character biometric identity (Arjun, 28yo, trimmed beard, blue shirt)...' },
  { time: 20, text: 'Enforcing environment lock (modern Indian dining table, beige walls, plant)...' },
  { time: 38, text: 'Synthesizing camera movement (medium shot with slow cinematic dolly forward)...' },
  { time: 55, text: 'Rendering realistic smartphone screen interaction and finger pause...' },
  { time: 75, text: 'Finalizing photorealistic 4K neural frames and H.264 video encoding...' },
];

const CREATOR_TIPS = [
  'Veo 3 maintains strict character consistency when clothing details (dark-blue casual shirt, black trousers) and grooming are explicitly frozen.',
  'Colloquial Tamil phrases with natural English loanwords like "Online-ல", "Buy பட்டனை" make tech and shopping videos 3x more relatable.',
  'Veo 3 Fast preview optimizes turnaround time while preserving temporal coherence and natural motion.',
  'Environment locks guarantee seamless continuity across YouTube Shorts and Instagram Reels series.',
];

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  operationName,
  aspectRatio,
  sceneTitle,
  onClose,
  error,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CREATOR_TIPS.length);
    }, 9000);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStage = [...STAGES].reverse().find((s) => seconds >= s.time) || STAGES[0];
  const progressPercent = Math.min(95, Math.max(5, Math.floor(seconds * 1.1)));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Glow ambient effect */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Veo 3 Video Generating</h3>
              <p className="text-xs text-zinc-400 truncate max-w-[260px]">{sceneTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-900 transition-colors"
            title="Minimize window (generation continues)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="my-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">Generation Error</div>
              <p className="leading-relaxed">{error}</p>
              <button
                onClick={onClose}
                className="mt-3 px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg text-xs font-medium"
              >
                Close & Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Visual preview box simulating rendering */}
            <div className="relative my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />

              {/* Grid scanning effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Animated laser scan line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />

              <div className="relative z-20 text-center px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 text-xs font-medium mb-2 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Veo 3 Fast Neural Synthesis</span>
                </div>
                <div className="text-sm font-semibold text-zinc-100 mb-1">{currentStage.text}</div>
                <div className="text-xs text-zinc-400">
                  Aspect Ratio: <span className="text-amber-400 font-mono">{aspectRatio}</span>
                </div>
              </div>

              {/* Timer in corner */}
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-xs text-zinc-300 font-mono bg-black/60 px-2 py-0.5 rounded-md border border-zinc-700/50">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTime(seconds)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 my-3">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Rendering Progress</span>
                <span className="font-mono text-amber-400 font-semibold">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Creator Tip Card */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 my-3 text-xs">
              <div className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>💡 Tamil Creator Director Tip</span>
              </div>
              <p className="text-zinc-300 leading-relaxed italic">
                "{CREATOR_TIPS[tipIndex]}"
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div className="truncate max-w-[280px] font-mono text-[10px] text-zinc-500">
                {operationName ? `Op: ${operationName}` : 'Initializing operation...'}
              </div>
              <button
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Run in Background
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
