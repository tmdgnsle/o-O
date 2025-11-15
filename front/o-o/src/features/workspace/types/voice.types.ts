// Voice WebSocket Message Types (Client ↔ Server)

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VoiceState {
  muted: boolean;
  speaking: boolean;
}

export interface VoiceParticipant {
  userId: string;
  voiceState?: VoiceState;
}

// Server → Client Messages
export interface ParticipantsMessage {
  type: 'participants';
  workspaceId: string;
  participants: VoiceParticipant[];
}

export interface VoiceJoinedMessage {
  type: 'voice-joined';
  workspaceId: string;
  userId: string;
}

export interface VoiceLeftMessage {
  type: 'voice-left';
  workspaceId: string;
  userId: string;
}

export interface VoiceFullMessage {
  type: 'voice-full';
  workspaceId: string;
  maxParticipants: number;
}

export interface OfferMessage {
  type: 'offer';
  workspaceId: string;
  fromUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage {
  type: 'answer';
  workspaceId: string;
  fromUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceMessage {
  type: 'ice';
  workspaceId: string;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface VoiceStateMessage {
  type: 'voice-state';
  workspaceId: string;
  userId: string;
  voiceState: VoiceState;
}

export interface ServerShutdownMessage {
  type: 'server-shutdown';
  message: string;
}

export type ServerMessage =
  | ParticipantsMessage
  | VoiceJoinedMessage
  | VoiceLeftMessage
  | VoiceFullMessage
  | OfferMessage
  | AnswerMessage
  | IceMessage
  | VoiceStateMessage
  | ServerShutdownMessage;

// Client → Server Messages
export interface SendOfferMessage {
  type: 'offer';
  toUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerMessage {
  type: 'answer';
  toUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceMessage {
  type: 'ice';
  toUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface SendVoiceStateMessage {
  type: 'voice-state';
  voiceState: VoiceState;
}

export type ClientMessage =
  | SendOfferMessage
  | SendAnswerMessage
  | SendIceMessage
  | SendVoiceStateMessage;
