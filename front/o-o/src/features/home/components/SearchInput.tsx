// SearchInput.tsx
import { useMediaUpload } from "../hooks/custom/useMediaUpload";
import youtube from "@/shared/assets/images/youtube.png";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const {
    mediaData,
    isDragging,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearMedia,
  } = useMediaUpload();

  return (
    <div
      className={`
        w-[clamp(300px,80%,1200px)]
        bg-white/60 shadow-md transitional-all duration-300 rounded-full
        focus:ring-1 focus:ring-primary border-none
        ${isDragging ? "ring-2 ring-primary bg-white/80" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 이미지 미리보기 */}
      {mediaData.type === "image" && mediaData.imageUrl && (
        <div
          className="w-fit flex items-center bg-primary rounded-full mx-8 mt-3"
          style={{
            gap: "clamp(0.25rem, 0.5vw, 0.5rem)",
            padding:
              "clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem)",
          }}
        >
          <img
            src={mediaData.imageUrl}
            alt="pasted"
            className="object-cover rounded-md flex-shrink-0"
            style={{
              width: "clamp(14px, 1.5vw, 20px)",
              height: "clamp(14px, 1.5vw, 20px)",
            }}
          />
          <span
            className="text-white truncate font-medium"
            style={{
              fontSize: "clamp(10px, 1vw, 12px)",
              maxWidth: "clamp(100px, 30vw, 400px)",
            }}
          >
            {mediaData.imageFile?.name}
          </span>
          <button
            onClick={clearMedia}
            className="bg-white rounded-full text-primary font-extrabold flex items-center justify-center flex-shrink-0"
            style={{
              width: "clamp(14px, 1.5vw, 18px)",
              height: "clamp(14px, 1.5vw, 18px)",
              fontSize: "clamp(8px, 0.8vw, 10px)",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 유튜브 링크 미리보기 */}
      {mediaData.type === "youtube" && mediaData.youtubeUrl && (
        <div
          className="w-fit flex items-center bg-primary rounded-full mx-8 mt-3"
          style={{
            gap: "clamp(0.25rem, 0.5vw, 0.5rem)",
            padding:
              "clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem)",
          }}
        >
          <div
            className="rounded flex items-center justify-center flex-shrink-0"
            style={{
              width: "clamp(14px, 1.5vw, 20px)",
              height: "clamp(14px, 1.5vw, 20px)",
            }}
          >
            <img
              src={youtube}
              alt="youtube icon"
              className="object-cover rounded-md flex-shrink-0"
              style={{
                width: "clamp(14px, 1.5vw, 20px)",
                height: "clamp(14px, 1.5vw, 20px)",
              }}
            />
          </div>
          <span
            className="text-white truncate font-medium"
            style={{
              fontSize: "clamp(10px, 1vw, 12px)",
              maxWidth: "clamp(100px, 30vw, 400px)",
            }}
          >
            {mediaData.youtubeUrl}
          </span>
          <button
            onClick={clearMedia}
            className="bg-white rounded-full text-primary font-extrabold flex items-center justify-center flex-shrink-0"
            style={{
              width: "clamp(14px, 1.5vw, 18px)",
              height: "clamp(14px, 1.5vw, 18px)",
              fontSize: "clamp(8px, 0.8vw, 10px)",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="마인드맵을 생성할 아이디어를 입력해주세요."
        onPaste={handlePaste}
        className="
          w-full
          h-[clamp(60px,2vw,100px)] 
          px-6 text-center font-semibold 
          text-[clamp(16px,1.5vw,36px)] 
          text-semi-deep-grey rounded-full
          bg-transparent 
          focus:placeholder-transparent"
        style={{
          border: "none",
          outline: "none",
        }}
      />
    </div>
  );
}
