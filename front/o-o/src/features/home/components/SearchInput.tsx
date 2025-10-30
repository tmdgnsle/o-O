import { useImageUpload } from "../hooks/custom/useImageUpload";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const {
    previewImage,
    imageFile,
    isDragging,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearImage,
  } = useImageUpload();

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
      {previewImage && (
        <div className="w-fit flex items-center gap-2 bg-primary px-2 py-[6px] rounded-full mx-8 mt-3">
          <img
            src={previewImage}
            alt="pasted"
            className="w-4 h-4 object-cover rounded-md"
          />
          <span className="text-xs text-white truncate max-w-[80px]">
            {imageFile?.name}
          </span>
          <button
            onClick={() => {
              clearImage();
            }}
            className="bg-white rounded-full text-primary text-[8px] font-extrabold w-4 h-4 flex items-center justify-center"
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
