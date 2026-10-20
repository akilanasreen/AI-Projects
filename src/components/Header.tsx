import React from 'react';
import { Film, Sparkles, Layers, Sliders, History } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'gallery';
  setActiveTab: (tab: 'studio' | 'gallery') => void;
  videoCount: number;
  onOpenPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  videoCount,
  onOpenPresets,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                <span className="text-amber-400">தமிழ்</span> Veo 3 Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                veo-3.1-fast-generate-preview
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Photorealistic Tamil Video Creator with Persistent Character & Environment Lock
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
            title="Load Tamil Scene Presets"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Templates</span>
          </button>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'studio'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Director Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all relative ${
                activeTab === 'gallery'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Reels Gallery</span>
              {videoCount > 0 && (
                <span className="ml-1 text-[10px] bg-zinc-800 text-zinc-200 px-1.5 py-0.2 rounded-full font-bold">
                  {videoCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
