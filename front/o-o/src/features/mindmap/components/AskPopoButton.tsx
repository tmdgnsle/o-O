import AskPopoIcon from '@/shared/assets/images/AskPopo.webp';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from 'react';

export default function AskPopo() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOrganize = () => {
    console.log('정리하기 실행!');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <img
          src={AskPopoIcon}
          alt="Ask Popo"
          className="cursor-pointer hover:opacity-80 transition-opacity w-20"
        />
      </PopoverTrigger>

      <PopoverContent
        className="w-[320px] p-6 bg-white rounded-2xl shadow-2xl"
        align="end"
        side="top"
        alignOffset={5} sideOffset={10}
      >
        <div className="space-y-4">
          {/* 헤더 */}
          <h2 className="text-2xl font-bold text-primary font-paperlogy">
            Ask Popo
          </h2>

          {/* 설명 */}
          <p className="font-paperlogy text-gray-600 text-sm leading-relaxed">
            Popo가 유사한 아이디어를 자동으로<br />
            병합하고 정리합니다.
          </p>

          {/* 정리하기 버튼 */}
          <Button
            onClick={handleOrganize}
            className="w-full hover:bg-primary text-white font-medium py-6 rounded-xl"
          >
            정리하기
          </Button>

        </div>
      </PopoverContent>
    </Popover>
  );
}