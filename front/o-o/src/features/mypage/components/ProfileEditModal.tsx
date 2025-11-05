interface ProfileEditModalProps {
  onClose: () => void;
  currentName?: string;
  currentEmail?: string;
  currentImage?: string;
}

export function ProfileEditModal({
  onClose,
  currentName = "홍길동",
  currentEmail = "dongni@gmail.com",
  currentImage,
}: ProfileEditModalProps) {
  return (
    <div>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-[#B8B8B8]/50 z-50 backdrop-blur-[2px]"
        onClick={onClose}
      />
    </div>
  );
}
