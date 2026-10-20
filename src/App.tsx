import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SceneEditor } from './components/SceneEditor';
import { VideoPlayerView } from './components/VideoPlayerView';
import { VideoGallery } from './components/VideoGallery';
import { GenerationModal } from './components/GenerationModal';
import { INITIAL_SCENES, compileVeoPrompt } from './presets';
import { SceneData, GeneratedVideo } from './types';
import { Sparkles, Film, X, Layers, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'tamil_veo3_studio_videos_v1';

export default function App() {
  const [currentScene, setCurrentScene] = useState<SceneData>(INITIAL_SCENES[0]);
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery'>('studio');
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOperationName, setActiveOperationName] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [sceneAudioBase64, setSceneAudioBase64] = useState<string | undefined>(undefined);

  // Load saved videos on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setGeneratedVideos(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved videos:', e);
    }
  }, []);

  // Save videos on change
  const saveVideos = (videos: GeneratedVideo[]) => {
    setGeneratedVideos(videos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save videos to localStorage:', e);
    }
  };

  // Start Veo 3 Video Generation
  const handleGenerateVideo = async (compiledPrompt: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    setActiveOperationName(null);

    try {
      // 1. Initiate Generation with veo-3.1-fast-generate-preview
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: compiledPrompt,
          aspectRatio: currentScene.aspectRatio,
          resolution: currentScene.resolution,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok) {
        throw new Error(startData.error || 'Failed to start video generation');
      }

      const operationName = startData.operationName;
      setActiveOperationName(operationName);

      // 2. Poll for completion every 4 seconds
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          const statusData = await statusRes.json();
          if (!statusRes.ok) {
            clearInterval(pollInterval);
            throw new Error(statusData.error || 'Error polling generation status');
          }

          if (statusData.done) {
            clearInterval(pollInterval);

            if (statusData.error) {
              setGenerationError(statusData.error.message || 'Generation failed on Veo 3');
              setIsGenerating(false);
              return;
            }

            // Successfully generated!
            const newVideo: GeneratedVideo = {
              id: `vid_${Date.now()}`,
              operationName,
              prompt: compiledPrompt,
              sceneTitle: currentScene.title,
              voiceOver: currentScene.voiceOver,
              aspectRatio: currentScene.aspectRatio,
              resolution: currentScene.resolution,
              createdAt: new Date().toISOString(),
              ttsAudioBase64: sceneAudioBase64,
              status: 'completed',
            };

            const updated = [newVideo, ...generatedVideos];
            saveVideos(updated);
            setSelectedVideo(newVideo);
            setIsGenerating(false);
            setActiveOperationName(null);
          }
        } catch (pollErr: any) {
          clearInterval(pollInterval);
          console.error('Polling error:', pollErr);
          setGenerationError(pollErr.message || 'Error while polling video status');
          setIsGenerating(false);
        }
      }, 4000);
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError(err.message || 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (id: string) => {
    const found = INITIAL_SCENES.find((p) => p.id === id);
    if (found) {
      setCurrentScene({ ...found });
      setSceneAudioBase64(undefined);
      setShowPresetsModal(false);
    }
  };

  const handleDeleteVideo = (id: string) => {
    const updated = generatedVideos.filter((v) => v.id !== id);
    saveVideos(updated);
    if (selectedVideo?.id === id) {
      setSelectedVideo(null);
    }
  };

  const handleNextTipScene = () => {
    if (currentScene.id === 'scene-arjun-hook') {
      handleSelectPreset('scene-arjun-tip1');
    } else if (currentScene.id === 'scene-arjun-tip1') {
      handleSelectPreset('scene-arjun-tip2');
    } else if (currentScene.id === 'scene-arjun-tip2') {
      handleSelectPreset('scene-arjun-tip3');
    } else {
      handleSelectPreset('scene-arjun-hook');
    }
    setSelectedVideo(null);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Global Studio Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        videoCount={generatedVideos.length}
        onOpenPresets={() => setShowPresetsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'gallery' ? (
          <VideoGallery
            videos={generatedVideos}
            onSelectVideo={(v) => {
              setSelectedVideo(v);
              setActiveTab('studio');
            }}
            onDeleteVideo={handleDeleteVideo}
            onNewScene={() => {
              setSelectedVideo(null);
              setActiveTab('studio');
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* If a video is currently selected/generated, show player view on top */}
            {selectedVideo && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Director Studio</span>
                  </button>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Generated with veo-3.1-fast-generate-preview
                  </span>
                </div>

                <VideoPlayerView
                  video={selectedVideo}
                  onGenerateNextScene={handleNextTipScene}
                />
              </div>
            )}

            {/* Main Scene Editor */}
            <SceneEditor
              scene={currentScene}
              onChange={setCurrentScene}
              onGenerateVideo={handleGenerateVideo}
              isGenerating={isGenerating}
              onSelectPreset={handleSelectPreset}
              allPresets={INITIAL_SCENES}
              audioBase64={sceneAudioBase64}
              onAudioGenerated={setSceneAudioBase64}
            />
          </div>
        )}
      </main>

      {/* Active Generation Progress Modal */}
      <GenerationModal
        isOpen={isGenerating}
        operationName={activeOperationName}
        aspectRatio={currentScene.aspectRatio}
        sceneTitle={currentScene.title}
        onClose={() => setIsGenerating(false)}
        error={generationError}
      />

      {/* Presets Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Tamil Creator Scene Templates
                </h3>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Select a ready-to-render scene. Each template includes complete character identity locks, camera movements, and authentic colloquial Tamil dialogue.
            </p>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {INITIAL_SCENES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    preset.id === currentScene.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{preset.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400">
                        {preset.aspectRatio}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">{preset.voiceOver}</p>
                    <p className="text-[11px] text-zinc-500 italic">{preset.voiceOverMeaning}</p>
                  </div>
                  <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs shrink-0 font-medium">
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            தமிழ் AI Video Studio &bull; Model: <span className="text-zinc-300 font-mono">veo-3.1-fast-generate-preview</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Aspect Ratios: 16:9 & 9:16</span>
            <span>Character Identity Lock &bull; Environment Continuity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
