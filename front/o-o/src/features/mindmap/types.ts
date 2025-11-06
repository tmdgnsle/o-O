export interface DialogButton {
  id: string;
  text: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export interface ContentDialogProps {
  characterImage?: string;
  title: string;
  buttons: DialogButton[];
  content: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// components/VoiceChat/types.ts
export interface User {
  id: string;
  avatar: string;
  name: string;
  isSpeaking?: boolean;
  colorIndex?: number;
}

export interface VoiceChatProps {
  users?: User[];
  onMicToggle?: (isMuted: boolean) => void;
  onCallEnd?: () => void;
  onOrganize?: () => void;
  onShare?: () => void;
}
