// components/VoiceChat/VoiceChat.tsx
import React, { useState } from "react";
import type { VoiceChatProps } from "../../types";
import VoiceAvatar from "./VoiceAvatar";
import VoiceControls from "./VoiceContols";

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
        {users.map((user, index) => (
          <VoiceAvatar
            key={user.id}
            avatar={user.avatar}
            name={user.name}
            isSpeaking={user.isSpeaking}
            colorIndex={user.colorIndex}
            index={index}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-12 w-px bg-gray-300 mx-2" />

      {/* Control Buttons */}
      <VoiceControls
        isMuted={isMuted}
        isCallActive={isCallActive}
        onMicToggle={handleMicToggle}
        onCallToggle={handleCallToggle}
        onOrganize={onOrganize}
        onShare={onShare}
      />
    </div>
  );
};

export default VoiceChat;
