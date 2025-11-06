import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { AddInputBoxProps } from "../../types";

export default function AddInputBox({ open, onConfirm, onCancel }: AddInputBoxProps) {
  const [keyword, setKeyword] = useState("");
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    if (keyword.trim()) {
      onConfirm(keyword.trim(), description.trim());
    }
  };

  // label 연결용 id
  const keywordId = "add-node-keyword";
  const descriptionId = "add-node-description";

  if (!open) return null;

  return (
    <>
      {/* 패널 */}
      <section
        className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-[#D8E7F3] p-6 rounded-lg shadow-xl z-50 w-80 flex flex-col gap-4"
        aria-labelledby="add-node-title"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.8)',
          transition: 'opacity 200ms ease, transform 200ms ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
          {/* 시각적 제목: aria-labelledby와 연결 */}
          <h2 id="add-node-title" className="sr-only">
            노드 추가 입력창
          </h2>

          {/* 키워드 입력 */}
          <div className="space-y-2">
            <label htmlFor={keywordId} className="text-sm font-paperlogy font-semibold">
              키워드
            </label>
            <Input
              id={keywordId}
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
            <label htmlFor={descriptionId} className="text-sm font-paperlogy font-semibold">
              설명
            </label>
            <Textarea
              id={descriptionId}
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
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="font-paperlogy"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 font-paperlogy"
            >
              입력하기
            </Button>
          </div>
        </section>
    </>
  );
}
