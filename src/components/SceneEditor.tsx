import React, { useState } from 'react';
import {
  Lock,
  User,
  Home,
  Film,
  Camera,
  Sun,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Languages,
  Wand2,
  Tv,
  Smartphone,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { SceneData, AspectRatio, VideoResolution } from '../types';
import { compileVeoPrompt } from '../presets';
import { AudioVoiceoverPlayer } from './AudioVoiceoverPlayer';

interface SceneEditorProps {
  scene: SceneData;
  onChange: (updated: SceneData) => void;
  onGenerateVideo: (compiledPrompt: string) => void;
  isGenerating: boolean;
  onSelectPreset: (id: string) => void;
  allPresets: SceneData[];
  audioBase64?: string;
  onAudioGenerated: (base64: string) => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  onChange,
  onGenerateVideo,
  isGenerating,
  onSelectPreset,
  allPresets,
  audioBase64,
  onAudioGenerated,
}) => {
  const [showEnglishMeaning, setShowEnglishMeaning] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'voiceover' | 'preview'>('prompt');

  const compiledPrompt = compileVeoPrompt(scene);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAIAssist = async (requestType: 'next_tip' | 'refine') => {
    setAiAssisting(true);
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScene: scene,
          requestType,
        }),
      });
      const data = await res.json();
      if (data.success && data.scene) {
        const sc = data.scene;
        onChange({
          ...scene,
          title: sc.scene_title || (requestType === 'next_tip' ? 'Scene 2: Tip 1' : scene.title),
          voiceOver: sc.voice_over || scene.voiceOver,
          voiceOverMeaning: sc.voice_over_english_meaning || scene.voiceOverMeaning,
          characterIdentity: sc.character_identity || scene.characterIdentity,
          environmentLock: sc.environment_lock || scene.environmentLock,
          characterAction: sc.character_action || scene.characterAction,
          cameraMovement: sc.camera_movement || scene.cameraMovement,
          lightingAndAtmosphere: sc.lighting_and_atmosphere || scene.lightingAndAtmosphere,
        });
      }
    } catch (e) {
      console.error('AI Director error:', e);
    } finally {
      setAiAssisting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scene Presets Series Carousel */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-200">
              Tamil Shopping Tips & Creator Series (Character Lock)
            </span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Persistent Identity across scenes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {allPresets.map((preset, index) => {
            const isSelected = preset.id === scene.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold truncate text-[11px] text-zinc-200">
                      {preset.title.split(':')[0]}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {preset.aspectRatio}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-2 text-zinc-400 leading-snug">
                    {preset.voiceOver.split('\n')[0]}
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                    Locked Cast
                  </span>
                  {isSelected && <span className="text-amber-400 font-bold">Active</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Editor Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Editor Controls Bar */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <input
                type="text"
                value={scene.title}
                onChange={(e) => onChange({ ...scene, title: e.target.value })}
                className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none transition-colors max-w-sm"
              />
              <span className="text-[11px] text-zinc-400 block">Veo 3 Scene Specification</span>
            </div>
          </div>

          {/* Ratio & Resolution Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Aspect Ratio */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChange({ ...scene, aspectRatio: '9:16' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  scene.aspectRatio === '9:16'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Portrait (Reels / Shorts / TikTok)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Portrait</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...scene, aspectRatio: '16:9' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  scene.aspectRatio === '16:9'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Landscape (YouTube / Desktop / Cinema)"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>16:9 Cinema</span>
              </button>
            </div>

            {/* Resolution */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChange({ ...scene, resolution: '720p' })}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  scene.resolution === '720p'
                    ? 'bg-zinc-800 text-amber-400 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                720p
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...scene, resolution: '1080p' })}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  scene.resolution === '1080p'
                    ? 'bg-zinc-800 text-amber-400 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                1080p
              </button>
            </div>

            {/* AI Assistant Menu */}
            <button
              onClick={() => handleAIAssist('next_tip')}
              disabled={aiAssisting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50"
              title="Generate Next Scene with Gemini 3.8 Flash"
            >
              <Wand2 className={`w-3.5 h-3.5 text-amber-400 ${aiAssisting ? 'animate-spin' : ''}`} />
              <span>{aiAssisting ? 'Thinking...' : 'AI Director'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="border-b border-zinc-800 bg-zinc-950/60 px-4 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Character & Scene Specification</span>
          </button>
          <button
            onClick={() => setActiveTab('voiceover')}
            className={`py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'voiceover'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Tamil Voice-over & Audio</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compiled Veo 3 Prompt</span>
          </button>
        </div>

        {/* Tab 1: Character & Scene Lock */}
        {activeTab === 'prompt' && (
          <div className="p-5 space-y-5">
            {/* Identity Lock & Environment Lock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Character Identity Lock */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 relative group focus-within:border-amber-500/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Character Identity Lock</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    Locked Cast
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={scene.characterIdentity}
                  onChange={(e) => onChange({ ...scene, characterIdentity: e.target.value })}
                  placeholder="Describe character appearance, age, attire, hairstyle, and facial structure..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Preserved across all scenes in this reel series for visual continuity.
                </span>
              </div>

              {/* Environment Lock */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 relative group focus-within:border-amber-500/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Home className="w-4 h-4 text-amber-400" />
                    <span>Environment Lock</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    Location Locked
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={scene.environmentLock}
                  onChange={(e) => onChange({ ...scene, environmentLock: e.target.value })}
                  placeholder="Describe location, room interior, wall color, table, daylight, and decor..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Ensures furniture, lighting, and camera setting remain completely identical.
                </span>
              </div>
            </div>

            {/* Character Action */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 focus-within:border-amber-500/60 transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200 mb-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Character Action & Performance</span>
              </div>
              <textarea
                rows={2}
                value={scene.characterAction}
                onChange={(e) => onChange({ ...scene, characterAction: e.target.value })}
                placeholder="What does the actor do in this scene? (e.g. browsing smartphone, hovering finger before buying...)"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            {/* Camera & Lighting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 focus-within:border-amber-500/60 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200 mb-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Cinematic Camera Movement</span>
                </div>
                <textarea
                  rows={2}
                  value={scene.cameraMovement}
                  onChange={(e) => onChange({ ...scene, cameraMovement: e.target.value })}
                  placeholder="e.g. Front-facing medium shot, slowly dolly forward toward smartphone..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 focus-within:border-amber-500/60 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200 mb-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Lighting & Atmosphere</span>
                </div>
                <textarea
                  rows={2}
                  value={scene.lightingAndAtmosphere}
                  onChange={(e) => onChange({ ...scene, lightingAndAtmosphere: e.target.value })}
                  placeholder="e.g. Soft warm natural daylight, relatable, modern Indian shopping tips creator..."
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tamil Voice-over & Audio */}
        {activeTab === 'voiceover' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-200">
                  Tamil Voice-over Script (தமிழ் வசனம்)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEnglishMeaning(!showEnglishMeaning)}
                className="text-xs text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <span>{showEnglishMeaning ? 'Hide English Meaning' : 'Show English Translation'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={scene.voiceOver}
              onChange={(e) => onChange({ ...scene, voiceOver: e.target.value })}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium leading-relaxed font-sans tracking-wide"
              placeholder="Enter Tamil voice-over dialogue here..."
            />

            {showEnglishMeaning && scene.voiceOverMeaning && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300">
                <span className="font-semibold text-amber-400/90 block mb-1">
                  English Meaning & Script Direction:
                </span>
                <p className="italic leading-relaxed">{scene.voiceOverMeaning}</p>
              </div>
            )}

            {/* Gemini TTS Audio Component */}
            <AudioVoiceoverPlayer
              text={scene.voiceOver}
              audioBase64={audioBase64}
              onAudioGenerated={onAudioGenerated}
            />
          </div>
        )}

        {/* Tab 3: Compiled Veo 3 Prompt */}
        {activeTab === 'preview' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Full Neural Video Prompt for Veo 3 Engine</span>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copied' : 'Copy Full Prompt'}</span>
              </button>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap select-all">
              {compiledPrompt}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block">Model Target</span>
                <span className="font-semibold text-emerald-400 font-mono">veo-3.1-fast-generate-preview</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block">Aspect Ratio</span>
                <span className="font-semibold text-amber-400 font-mono">{scene.aspectRatio}</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block">Resolution</span>
                <span className="font-semibold text-zinc-200 font-mono">{scene.resolution}</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block">Lock Consistency</span>
                <span className="font-semibold text-teal-400">Character + Room</span>
              </div>
            </div>
          </div>
        )}

        {/* Big Action Footer */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Target: <strong className="text-zinc-200 font-mono">veo-3.1-fast-generate-preview</strong> ({scene.aspectRatio})</span>
          </div>

          <button
            onClick={() => onGenerateVideo(compiledPrompt)}
            disabled={isGenerating}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-zinc-950 shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Generate Video with Veo 3</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
