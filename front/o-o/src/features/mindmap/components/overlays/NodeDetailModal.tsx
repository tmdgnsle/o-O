import { X } from "lucide-react";
import type { NodeData } from "../../types";

interface NodeDetailModalProps {
  isOpen: boolean;
  node: NodeData;
  onClose: () => void;
  nodeX: number;
  nodeY: number;
}

export default function NodeDetailModal({
  isOpen,
  node,
  onClose,
  nodeX,
  nodeY,
}: Readonly<NodeDetailModalProps>) {
  if (!isOpen) return null;

  const { keyword, memo, type, color } = node;

  // YouTube URL을 embed URL로 변환
  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);

      // youtu.be 형식
      if (urlObj.hostname === "youtu.be") {
        const videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // youtube.com/watch?v= 형식
      if (urlObj.hostname.includes("youtube.com")) {
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const renderContent = () => {
    if (type === "image") {
      return (
        <div className="flex items-center justify-center rounded-lg p-4">
          <img
            src={keyword}
            alt="Node content"
            className="max-w-full max-h-[300px] object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML =
                  '<p class="text-center">이미지를 불러올 수 없습니다</p>';
              }
            }}
          />
        </div>
      );
    }

    if (type === "video") {
      const embedUrl = getYouTubeEmbedUrl(keyword);

      if (embedUrl) {
        return (
          <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-lg p-8">
          <span className="text-6xl mb-4">🎥</span>
          <a
            href={keyword}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline break-all"
          >
            {keyword}
          </a>
        </div>
      );
    }

    // text 타입
    return (
      <div className="text-center py-8">
        <p className="text-2xl font-bold font-paperlogy">{keyword}</p>
      </div>
    );
  };

  return (
    <div
      className="absolute z-[100] pointer-events-auto"
      style={{
        left: `${nodeX}px`,
        top: `${nodeY + 100}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-2xl shadow-2xl w-[400px] max-h-[500px] overflow-y-auto"
        style={{
          backgroundColor: color,
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-paperlogy">
              🍀 Ai 요약 내용
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="px-4 pb-4">
          {renderContent()}

          {/* 메모 */}
          {memo && (
            <div className="mt-4 p-3 bg-white/30 rounded-lg">
              <p className="font-paperlogy text-sm whitespace-pre-wrap">
                {memo}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
