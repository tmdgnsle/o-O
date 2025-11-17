import React from "react";
import { Button } from "@/components/ui/button";
import CustomTooltip from "../../../../shared/ui/CustomTooltip";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import MicIcon from "@mui/icons-material/Mic";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import organizePopo from "@/shared/assets/images/organize_popo.webp";

interface VoiceControlsProps {
  isMuted: boolean;
  isCallActive: boolean;
  isGptRecording?: boolean;
  showOrganize?: boolean;
  onMicToggle: () => void;
  onCallToggle: () => void;
  onOrganize?: () => void;
  onShare?: () => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isMuted,
  isCallActive,
  isGptRecording = false,
  showOrganize = true,
  onMicToggle,
  onCallToggle,
  onOrganize,
  onShare,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Mic Toggle */}
      <button
        onClick={onMicToggle}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-md
          ${
            isMuted
              ? "bg-danger hover:bg-danger/90 text-white"
              : "bg-white hover:bg-gray-100 text-semi-black"
          }
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
        onClick={onCallToggle}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-md
          ${
            isCallActive
              ? "bg-white hover:bg-gray-100 text-semi-black"
              : "bg-danger hover:bg-danger/90 text-white"
          }
        `}
        aria-label={isCallActive ? "통화 종료" : "통화 시작"}
      >
        {isCallActive ? (
          <PhoneEnabledIcon className="text-xl" />
        ) : (
          <PhoneDisabledIcon className="text-xl" />
        )}
      </button>

      {/* Organize Button with Tooltip (GPT Toggle) */}
      {showOrganize && (
        <CustomTooltip
          content={
            <div className="text-sm leading-relaxed">
              <div>{isGptRecording ? 'GPT 녹음 중...' : '아이디어를 놓치지 않게'}</div>
              <div>
                <span className="font-bold">Popo</span>가 정리해드려요.
              </div>
            </div>
          }
        >
          <button
            onClick={onOrganize}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-200
              ${isGptRecording
                ? 'bg-danger/10 hover:bg-danger/20 ring-2 ring-danger animate-pulse'
                : 'bg-white hover:bg-gray-100'
              }
            `}
            aria-label={isGptRecording ? "녹음 중지" : "녹음 시작"}
          >
            <img
              src={organizePopo}
              alt="organize"
              className="w-10 h-10 object-contain"
            />
          </button>
        </CustomTooltip>
      )}

      {/* Share Button */}
      <Button
        onClick={onShare}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-3 h-12 text-base font-semibold shadow-md ml-2"
        style={{ borderRadius: "13px" }}
      >
        공유하기
      </Button>
    </div>
  );
};

export default VoiceControls;
