import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type AddInputBoxProps = {
  onConfirm: (keyword: string, description: string) => void;
  onCancel: () => void;
};

export default function AddInputBox({
  onConfirm,
  onCancel,
}: AddInputBoxProps) {
  const [keyword, setKeyword] = useState("");
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    if (keyword.trim()) {
      onConfirm(keyword.trim(), description.trim());
    }
  };

  return (
    <>
      {/* 오버레이 배경 */}
      <div
        className="fixed inset-0 z-40"
        onClick={onCancel}
      />

      {/* AddInputBox */}
      <div
        className="absolute top-1/2 left-full ml-8 -translate-y-1/2 flex flex-col gap-4 bg-[#D8E7F3] p-6 rounded-lg shadow-xl z-50 w-80"
        onClick={(e) => e.stopPropagation()}
      >
      {/* 키워드 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-paperlogy font-semibold">키워드</label>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="키워드 / 사진 / 영상 링크를 첨부해주세요."
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleConfirm();
            }
            if (e.key === "Escape") onCancel();
          }}
          autoFocus
        />
      </div>

      {/* 설명 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-paperlogy font-semibold">설명</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="키워드에 대한 상세 설명을 적고싶으면 적으세요. 싫으면 말아라."
          className="w-full min-h-[100px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
        />
      </div>

      {/* 버튼들 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="font-paperlogy"
        >
          취소
        </Button>
        <Button
          onClick={handleConfirm}
          className="bg-primary hover:bg-primary/90 font-paperlogy"
        >
          입력하기
        </Button>
      </div>
    </div>
    </>
  );
}
