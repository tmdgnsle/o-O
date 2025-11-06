// components/VoiceChat.tsx
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CustomTooltip from "./CustomTooltip";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import MicIcon from "@mui/icons-material/Mic";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import organizePopo from "@/shared/assets/images/organize_popo.png";

// 고정 색상 6가지
const VOICE_COLORS = [
  "#F24822", // 빨강
  "#57E257", // 초록
  "#FF824D", // 주황
  "#29DFFF", // 하늘
  "#FF50F0", // 분홍
  "#FFC60B", // 노랑
] as const;

interface User {
  id: string;
  avatar: string;
  name: string;
  isSpeaking?: boolean;
  colorIndex?: number;
}

interface VoiceChatProps {
  users?: User[];
  onMicToggle?: (isMuted: boolean) => void;
  onCallEnd?: () => void;
  onOrganize?: () => void;
  onShare?: () => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  users = [],
  onMicToggle,
  onCallEnd,
  onOrganize,
  onShare,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);

  const handleMicToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    onMicToggle?.(newMutedState);
  };

  const handleCallToggle = () => {
    const newCallState = !isCallActive;
    setIsCallActive(newCallState);
    if (!newCallState) {
      onCallEnd?.();
    }
  };

  return (
    <div
      className="flex items-center gap-3 bg-semi-white px-4 py-2 shadow-lg"
      style={{ borderRadius: "20px" }}
    >
      {/* Users Avatars */}
      <div className="flex items-center gap-3">
        {users.map((user, index) => {
          const colorIndex = user.colorIndex ?? index % VOICE_COLORS.length;
          const voiceColor = VOICE_COLORS[colorIndex];

          return (
            <div key={user.id} className="relative">
              <Avatar className="w-14 h-14 border-4 border-white shadow-md">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user.isSpeaking && (
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full"
                  style={{ backgroundColor: voiceColor }}
                >
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: voiceColor }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-gray-300 mx-2" />

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Mic Toggle */}
        <button
          onClick={handleMicToggle}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200
            ${
              isMuted
                ? "bg-danger hover:bg-danger/90 text-white"
                : "bg-white hover:bg-gray-100 text-semi-black"
            }
            shadow-md
          `}
          aria-label={isMuted ? "마이크 켜기" : "마이크 끄기"}
        >
          {isMuted ? (
            <MicOffOutlinedIcon className="text-xl" />
          ) : (
            <MicIcon className="text-xl" />
          )}
        </button>

        {/* Call Toggle */}
        <button
          onClick={handleCallToggle}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200
            ${
              isCallActive
                ? "bg-white hover:bg-gray-100 text-semi-black"
                : "bg-danger hover:bg-danger/90 text-white"
            }
            shadow-md
          `}
          aria-label={isCallActive ? "통화 종료" : "통화 시작"}
        >
          {isCallActive ? (
            <PhoneEnabledIcon className="text-xl" />
          ) : (
            <PhoneDisabledIcon className="text-xl" />
          )}
        </button>

        {/* Organize Button with Custom Tooltip */}
        <CustomTooltip
          content={
            <p className="text-sm leading-relaxed">
              <div>아이디어를 놓치지 않게</div>
              <div>
                <span className="font-bold">Popo</span>가 정리해드려요.
              </div>
            </p>
          }
        >
          <button
            onClick={onOrganize}
            className="w-14 h-14 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-md transition-all duration-200"
            aria-label="정리하기"
          >
            <img
              src={organizePopo}
              alt="organize"
              className="w-10 h-10 object-contain"
            />
          </button>
        </CustomTooltip>

        {/* Share Button */}
        <Button
          onClick={onShare}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 h-12 text-base font-bold shadow-md"
          style={{ borderRadius: "13px" }}
        >
          공유하기
        </Button>
      </div>
    </div>
  );
};

export default VoiceChat;
