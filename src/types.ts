export type AspectRatio = '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p';

export interface SceneData {
  id: string;
  title: string;
  language: string;
  voiceOver: string;
  voiceOverMeaning?: string;
  characterIdentity: string;
  environmentLock: string;
  characterAction: string;
  cameraMovement: string;
  lightingAndAtmosphere: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
}

export interface GeneratedVideo {
  id: string;
  operationName: string;
  prompt: string;
  sceneTitle: string;
  voiceOver: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  createdAt: string;
  videoUrl?: string;
  ttsAudioBase64?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}
