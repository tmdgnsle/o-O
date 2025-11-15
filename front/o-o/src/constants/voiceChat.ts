// Voice Chat WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8084';

// Voice WebSocket endpoint
export const VOICE_WS_BASE_URL = WS_URL.replace('/mindmap/ws', '/mindmap/voice');

export function buildVoiceWsUrl(workspaceId: string): string {
  return `${VOICE_WS_BASE_URL}?workspace=${workspaceId}`;
}

// Maximum participants in a voice chat room
export const MAX_PARTICIPANTS = 6;

// WebRTC ICE servers configuration
export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  // Add TURN servers here for production if needed
];

// Speaking detection threshold (0-255 scale)
export const SPEAKING_THRESHOLD = 30;

// Speaking detection check interval (ms)
export const SPEAKING_CHECK_INTERVAL = 100;

// AudioContext settings
export const AUDIO_CONTEXT_CONFIG = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
} as const;
