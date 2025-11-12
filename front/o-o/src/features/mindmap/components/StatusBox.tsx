import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Lock, LockOpen, Headphones, ChevronRight } from "lucide-react";
import popo1 from "@/shared/assets/images/popo1.png";
import popo2 from "@/shared/assets/images/popo2.png";
import popo3 from "@/shared/assets/images/popo3.png";
import popo4 from "@/shared/assets/images/popo4.png";
import { useShareLink } from "../hooks/custom/useShareLink";
import { useCollaborators, type Collaborator, type Permission } from "../hooks/custom/useCollaborators";
import { useAccessType } from "../hooks/custom/useAccessType";

type StatusBoxProps = {
  onStartVoiceChat?: () => void;
  shareLink: string;
};

// 더미 데이터
const initialCollaborators: Collaborator[] = [
  { id: "1", name: "이승훈", avatar: popo1, role: "Maintainer" },
  { id: "2", name: "한퉁근", avatar: popo2, role: "Editor", permission: "can Edit" },
  { id: "3", name: "홍시", avatar: popo3, role: "Viewer", permission: "can View" },
  { id: "4", name: "송진", avatar: popo1, role: "Viewer", permission: "can View" },
  { id: "5", name: "진횬티비", avatar: popo4, role: "Viewer", permission: "can View" },
  { id: "6", name: "박소영", avatar: popo2, role: "Viewer", permission: "can View" },
];

export default function StatusBox({ onStartVoiceChat, shareLink }: Readonly <StatusBoxProps>) {
  // Custom hooks
  const { copied, handleCopyLink } = useShareLink(shareLink);
  const { collaborators, handlePermissionChange } = useCollaborators(initialCollaborators);
  const { accessType, setAccessType } = useAccessType("private");

  // 현재 접속 중인 사용자들
  const activeUsers = collaborators;

  // 화면 크기 상태
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 반응형 아바타 개수 제한
  const getVisibleUsers = () => {
    if (windowWidth < 640) return activeUsers.slice(0, 2); // mobile: 2개
    if (windowWidth < 1024) return activeUsers.slice(0, 3); // tablet: 3개
    return activeUsers; // desktop: 전체
  };

  const visibleUsers = getVisibleUsers();
  const remainingCount = activeUsers.length - visibleUsers.length;

  return (
    <div>
      <Popover>
        {/* 기본 상태: 프로필 이미지들 + 공유하기 버튼 */}
        <div className="flex items-center gap-1 md:gap-2 bg-white rounded-lg shadow-lg px-1.5 py-1 md:px-4 md:py-2">
          {/* 접속 중인 사용자 아바타 */}
          <div className="flex -space-x-2">
            {visibleUsers.map((user) => (
              <Avatar key={user.id} className="w-7 h-7 md:w-10 md:h-10 border-2 border-white">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {remainingCount > 0 && (
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-semibold text-gray-600">+{remainingCount}</span>
              </div>
            )}
          </div>

          {/* 공유하기 버튼 */}
          <PopoverTrigger asChild>
            <Button className="text-xs md:text-sm px-2 py-1.5 md:px-4 md:py-2">
              공유하기
            </Button>
          </PopoverTrigger>
        </div>

        {/* Popover 컨텐츠 */}
        <PopoverContent className="w-[310px] p-6" align="end" alignOffset={-14} sideOffset={18} >
          <div className="space-y-4">
            {/* 사용자 목록 */}
            <div className="space-y-3">
              {collaborators.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 ml-5">
                    <p className="font-paperlogy text-sm">{user.name}</p>
                  </div>

                  {user.role === "Maintainer" ? (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500 w-[110px]">{user.role}</p>
                      {onStartVoiceChat ? (
                        <button
                          type="button"
                          onClick={onStartVoiceChat}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label="Voice chat 열기"
                        >
                          <Headphones className="w-4 h-4 text-gray-500" />
                        </button>
                      ) : (
                        <Headphones className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ) : (
                    <Select
                      value={user.permission}
                      onValueChange={(value) => handlePermissionChange(user.id, value as Permission)}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="can View">can View</SelectItem>
                        <SelectItem value="can Edit">can Edit</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-t pt-4" />

            {/* 링크 섹션 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-primary font-paperlogy font-extrabold">Link</Label>
                {copied && (
                  <p className="text-xs font-paperlogy text-primary">링크가 복사되었습니다!</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1 text-sm bg-gray-50"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 권한 설정 */}
            <Select value={accessType} onValueChange={(value) => setAccessType(value as "private" | "public")}>
              <SelectTrigger className="w-full h-10 justify-between font-paperlogy [&>svg]:hidden">
                <div className="flex items-center">
                  {accessType === "private" ? (
                    <Lock className="w-4 h-4 mr-2" />
                  ) : (
                    <LockOpen className="w-4 h-4 mr-2" />
                  )}
                  <SelectValue />
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private" className="font-paperlogy">
                  Only those invited people
                </SelectItem>
                <SelectItem value="public" className="font-paperlogy">
                  Open to everyone
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
