import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { NodeAddInputProps } from "../../types";

export default function NodeAddInput({ open, onConfirm, onCancel, buttonRef }: NodeAddInputProps) {
  const [keyword, setKeyword] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });

  // 입력창이 닫힐 때 입력 필드 초기화
  useEffect(() => {
    if (!open) {
      setKeyword("");
      setDescription("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (keyword.trim()) {
      onConfirm(keyword.trim(), description.trim());
    }
  };

  // label 연결용 id
  const keywordId = "add-node-keyword";
  const descriptionId = "add-node-description";

  /** 버튼 위치 계산 */
  useEffect(() => {
    if (!open || !buttonRef?.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setPosition({
        left: rect.right + 16, // 버튼 오른쪽 + 16px margin
        top: rect.top + rect.height / 2, // 버튼 중앙
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, buttonRef]);

  if (!open) return null;

  const content = (
    <>
      {/* 패널 */}
      <section
        className="fixed bg-[#D8E7F3] p-6 rounded-lg shadow-xl z-[9999] w-80 flex flex-col gap-4"
        aria-labelledby="add-node-title"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: 'translateY(-50%)',
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease',
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
              placeholder="키워드에 대한 상세 설명을 입력하세요."
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

  return createPortal(content, document.body);
}
