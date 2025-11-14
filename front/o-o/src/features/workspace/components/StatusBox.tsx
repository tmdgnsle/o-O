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
import { useShareLink } from "../hooks/custom/useShareLink";
import { useWindowWidth } from "@/shared/hooks/useWindowWidth";
import { usePeerCursors } from "./PeerCursorProvider";
import { useWorkspaceAccessQuery } from "../hooks/query/useWorkspaceAccessQuery";
import { useAppSelector } from "@/store/hooks";
import { useUpdateMemberRoleMutation } from "../hooks/mutation/useUpdateMemberRoleMutation";
import { useUpdateWorkspaceVisibilityMutation } from "../hooks/mutation/useUpdateWorkspaceVisibilityMutation";
import type { WorkspaceRole, WorkspaceVisibility } from "@/services/dto/workspace.dto";
import { useMemo } from "react";

type StatusBoxProps = {
  onStartVoiceChat?: () => void;
  shareLink: string;
  workspaceId: string;
};

// UI Permission type
type Permission = "can View" | "can Edit";

// Collaborator type combining awareness and workspace data
interface Collaborator {
  id: string; // email or user identifier
  name: string;
  avatar?: string;
  role: "Maintainer" | "Editor" | "Viewer";
  permission?: Permission;
  email?: string;
}

// Convert backend role to UI display text
const roleToDisplay = (role: WorkspaceRole): "Maintainer" | "Editor" | "Viewer" => {
  switch (role) {
    case "MAINTAINER":
      return "Maintainer";
    case "EDIT":
      return "Editor";
    case "VIEW":
      return "Viewer";
  }
};

// Convert UI permission to backend role
const permissionToRole = (permission: Permission): WorkspaceRole => {
  return permission === "can Edit" ? "EDIT" : "VIEW";
};

// Convert backend role to UI permission
const roleToPermission = (role: WorkspaceRole): Permission => {
  return role === "EDIT" ? "can Edit" : "can View";
};

export default function StatusBox({ onStartVoiceChat, shareLink, workspaceId }: Readonly<StatusBoxProps>) {
  // Fetch workspace data
  const { workspace } = useWorkspaceAccessQuery(workspaceId);
  const currentUser = useAppSelector((state) => state.user.user);
  const { peers } = usePeerCursors();
  const { mutate: updateRole } = useUpdateMemberRoleMutation();
  const { mutate: updateVisibility } = useUpdateWorkspaceVisibilityMutation();

  // Custom hooks
  const { copied, handleCopyLink } = useShareLink(shareLink);

  // Get access type from workspace
  const accessType = workspace?.visibility === "PRIVATE" ? "private" : "public";

  // Check if current user is maintainer
  const isMaintainer = workspace?.myRole === "MAINTAINER";

  // Handle visibility change
  const handleVisibilityChange = (value: string) => {
    if (!workspace || !isMaintainer) return;

    const newVisibility: WorkspaceVisibility = value === "private" ? "PRIVATE" : "PUBLIC";
    updateVisibility({
      workspaceId,
      visibility: newVisibility,
    });
  };

  // Handle permission change
  const handlePermissionChange = (_userId: string, _newPermission: Permission) => {
    if (!workspace || !isMaintainer) return;

    // For now, we can't update other users' roles because we don't have their userId (number)
    // This would require a members API endpoint that returns numeric user IDs
    // TODO: Implement when member list API is available, API 연결 후 컴포넌트/훅 분리 작업 필요
    console.warn("Role update not yet implemented - requires member API with user IDs");
  };

  // Combine current user and online peers into collaborators list
  const activeUsers = useMemo<Collaborator[]>(() => {
    const users: Collaborator[] = [];

    // Add current user
    if (currentUser && workspace) {
      users.push({
        id: currentUser.email,
        name: currentUser.nickname,
        avatar: currentUser.profileImage,
        role: roleToDisplay(workspace.myRole),
        permission: workspace.myRole === "MAINTAINER" ? undefined : roleToPermission(workspace.myRole),
        email: currentUser.email,
      });
    }

    // Add online peers (excluding self)
    peers.forEach((peer) => {
      if (peer.email && peer.email !== currentUser?.email) {
        users.push({
          id: peer.email,
          name: peer.name || "Anonymous",
          avatar: peer.profileImage,
          // We don't have peer roles from awareness, default to Viewer for display
          // In real implementation, you'd need to fetch member roles from API
          role: "Viewer",
          permission: "can View",
          email: peer.email,
        });
      }
    });

    return users;
  }, [currentUser, workspace, peers]);

  const windowWidth = useWindowWidth();

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
              {activeUsers.map((user) => (
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
                      {onStartVoiceChat && user.email === currentUser?.email ? (
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
                  ) : isMaintainer && user.email !== currentUser?.email ? (
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
                  ) : (
                    <p className="text-xs text-gray-500 w-[110px]">{user.role}</p>
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
            {isMaintainer ? (
              <Select value={accessType} onValueChange={handleVisibilityChange}>
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
            ) : (
              <div className="w-full h-10 flex items-center px-3 border rounded-md bg-gray-50">
                <div className="flex items-center font-paperlogy text-sm">
                  {accessType === "private" ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Only those invited people</span>
                    </>
                  ) : (
                    <>
                      <LockOpen className="w-4 h-4 mr-2" />
                      <span>Open to everyone</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
