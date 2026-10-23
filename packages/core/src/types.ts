export type BrandId = string;
export type RatioId = 'course-hd' | 'social-landscape' | 'social-portrait' | 'story-vertical' | 'social-square' | 'transparent-overlay-hd' | 'thumbnail';
export type MotionName = 'fade' | 'rise' | 'slide-left' | 'scale' | 'wipe' | 'draw' | 'type' | 'pulse' | 'settle' | 'highlight' | 'count' | 'trace' | 'focus';
export type LayerType = 'text' | 'image' | 'video' | 'shape' | 'diagram' | 'chart' | 'terminal' | 'caption' | 'presenter' | 'component';

export interface OutputPreset { id: RatioId | string; width: number; height: number; fps: number; alpha?: boolean; stillOnly?: boolean }
export interface ColourTokens { canvas: string; surface: string; surfaceAlt: string; text: string; muted: string; accent: string; accentAlt: string; success: string; warning: string; danger: string; line: string }
export interface TypographyTokens { display: string; heading: string; body: string; mono: string; label: string; caption: string }
export interface MotionPersonality { easing: 'calm' | 'precise' | 'energetic' | 'connected'; speed: number; staggerFrames: number; drift: number; radius: number }
export interface BrandPack { id: BrandId; version: string; name: string; description: string; colours: ColourTokens; typography: TypographyTokens; motion: MotionPersonality; logo?: string; writing: string[]; products?: string[] }

export interface MotionCue { type: MotionName; at: number; duration: number; stagger?: number }
export type MediaSource = 'comfyui' | 'motion-foundry' | 'camera' | 'screen-recording' | 'imported';
export type GeneratedMediaRole = 'reference' | 'generated-image' | 'edited-image' | 'upscaled-image' | 'generated-video' | 'interpolated-video' | 'segmentation-matte' | 'restored-audio';
export interface MediaProvenance {
  source: MediaSource;
  role: GeneratedMediaRole;
  profile?: string;
  host?: string;
  workflow?: string;
  workflowHash?: string;
  promptId?: string;
  sourceAsset?: string;
  modelHashes?: Record<string, string>;
  qaEvidence?: string[];
  reviewState?: 'candidate' | 'approved' | 'rejected';
}
export interface Layer { id: string; type: LayerType; content?: string; asset?: string; provenance?: MediaProvenance; x?: number; y?: number; width?: number; height?: number; color?: keyof ColourTokens; cue?: MotionCue; data?: Record<string, unknown> }
export interface SceneContent { eyebrow?: string; title: string; body?: string; items?: string[]; metric?: string; metricLabel?: string; cta?: string; code?: string; quote?: string; image?: string; nodes?: Array<{id: string; label: string; detail?: string}> }
export interface CaptionCue { start: number; end: number; text: string }
export interface Scene { id: string; type: string; template: string; duration: number; transition?: 'cut' | 'dissolve' | 'push' | 'masked-reveal'; brandOverride?: BrandId; templateGraphics?: boolean; content: SceneContent; layers?: Layer[]; captions?: CaptionCue[]; narration?: { asset?: string; text?: string }; notes?: string }
export type VideoFit = 'contain' | 'cover' | 'fill';
export type VideoBlendMode = 'normal' | 'addition' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'difference' | 'hardlight' | 'softlight';
export interface VideoCrop { x: number; y: number; width: number; height: number }
export interface VideoKey { type: 'chroma' | 'colour'; colour: string; similarity?: number; blend?: number; screen?: 'green' | 'blue'; despill?: number; despillExpand?: number }
export interface VideoMask { asset: string; mode?: 'luma' | 'alpha'; invert?: boolean; feather?: number; provenance?: MediaProvenance }
export interface VideoComposite {
  zIndex?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fit?: VideoFit;
  opacity?: number;
  blendMode?: VideoBlendMode;
  crop?: VideoCrop;
  key?: VideoKey;
  mask?: VideoMask;
  loop?: boolean;
  trimStart?: number;
  includeAudio?: boolean;
}
export interface MediaTrack { id: string; type: 'narration' | 'music' | 'video' | 'captions' | 'presenter' | 'demo'; asset?: string; provenance?: MediaProvenance; start: number; duration?: number; volume?: number; ducking?: number; composite?: VideoComposite; cues?: CaptionCue[] }
export interface ProjectMetadata { product?: string; author?: string; createdAt: string; updatedAt: string; tags?: string[]; language?: string }
export interface MotionProject { schemaVersion: '2.0'; id: string; version: number; title: string; description?: string; brand: {id: BrandId; version: string}; preset: RatioId | string; fps: number; duration: number; scenes: Scene[]; tracks?: MediaTrack[]; metadata: ProjectMetadata; qa?: {captionsRequired?: boolean; safeArea?: number; loudnessTarget?: number; generatedMediaProvenanceRequired?: boolean}; render?: {codec?: 'h264' | 'vp9'; quality?: number; background?: string; graphics?: boolean; chrome?: boolean}; markers?: Array<{time: number; label: string}> }
export interface Diagnostic { code: string; severity: 'error' | 'warning' | 'info'; path: string; message: string; suggestion?: string }
export interface TemplateDefinition { id: string; name: string; category: 'foundation' | 'teaching' | 'social' | 'long-form'; description: string; ratios: string[]; minDuration: number; maxDuration: number; required: string[]; optional: string[]; textLimits: Record<string, number>; component: string }
export interface ComponentDefinition { id: string; name: string; layerTypes: LayerType[]; description: string; inputs: string[]; motion: MotionName[] }
export interface RenderManifest { projectId: string; projectVersion: number; specHash: string; brand: string; brandVersion: string; engineVersion: string; preset: OutputPreset; fps: number; duration: number; frames: number; assetHashes: Record<string, string>; assetProvenance: Record<string, MediaProvenance>; createdAt: string; renderer: string }
export interface RenderJob { id: string; projectId: string; status: 'queued' | 'running' | 'complete' | 'failed' | 'cancelled'; progress: number; stage: string; createdAt: string; updatedAt: string; output?: string; manifest?: string; error?: string; idempotencyKey?: string; cacheKey?: string }
