import React from 'react';
import { Film, Play, Download, Trash2, Calendar, Sparkles } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoGalleryProps {
  videos: GeneratedVideo[];
  onSelectVideo: (video: GeneratedVideo) => void;
  onDeleteVideo: (id: string) => void;
  onNewScene: () => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onSelectVideo,
  onDeleteVideo,
  onNewScene,
}) => {
  if (videos.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Generated Videos Yet</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
          Select Arjun's Online Shopping scene in the Director Studio and click "Generate Video with Veo 3" to create your first cinema-grade Tamil AI video reel.
        </p>
        <button
          onClick={onNewScene}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Open Director Studio</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Generated Video Reels</h2>
          <p className="text-xs text-zinc-400">
            Past Veo 3 scenes rendered with character identity locks
          </p>
        </div>
        <button
          onClick={onNewScene}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Scene</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((vid) => {
          const isPortrait = vid.aspectRatio === '9:16';
          const streamUrl = `/api/video-stream?operationName=${encodeURIComponent(vid.operationName)}`;

          return (
            <div
              key={vid.id}
              className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-zinc-700 transition-colors"
            >
              {/* Video Thumbnail / Preview */}
              <div
                onClick={() => onSelectVideo(vid)}
                className="relative bg-zinc-900 cursor-pointer overflow-hidden flex items-center justify-center aspect-video group/thumb"
              >
                <video
                  src={streamUrl}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  muted
                  preload="metadata"
                />

                <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-2 left-2 z-10 flex gap-1">
                  <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur-sm text-amber-400 px-2 py-0.5 rounded border border-white/10">
                    {vid.aspectRatio}
                  </span>
                  <span className="text-[10px] font-mono bg-black/70 backdrop-blur-sm text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
                    {vid.resolution}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1 truncate">{vid.sceneTitle}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {vid.voiceOver}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(vid.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDeleteVideo(vid.id)}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectVideo(vid)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded border border-zinc-700/60 font-medium"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
