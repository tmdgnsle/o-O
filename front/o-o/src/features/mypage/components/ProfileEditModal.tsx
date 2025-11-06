import { useState } from "react";
import { ProfileImage } from "./ProfileImage";
import { ProfileForm } from "./ProfileForm";
import { ModalHeader } from "./ModalHeader";

interface ProfileEditModalProps {
  readonly onClose: () => void;
  readonly currentName?: string;
  readonly currentEmail?: string;
  readonly currentImage?: string;
}

export function ProfileEditModal({
  onClose,
  currentName,
  currentEmail,
  currentImage,
}: ProfileEditModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName || "");
  const [email, setEmail] = useState(currentEmail || "");
  const [image, setImage] = useState(currentImage || "");

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(currentName || "");
    setEmail(currentEmail || "");
    setIsEditing(false);
  };

  const handleImageChange = (newImage: string) => {
    setImage(newImage);
  };

  return (
    <div>
      <div
        className="fixed inset-0 bg-[#B8B8B8]/60 z-50 backdrop-blur-[2px]"
        role="none"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-lg shadow-lg px-4 py-8 w-full max-w-md relative">
          <ModalHeader
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onClose={onClose}
          />

          <div className="flex gap-10 py-3 px-6 items-center">
            <ProfileImage
              currentImage={image}
              isEditing={isEditing}
              onImageChange={handleImageChange}
            />
            <ProfileForm
              name={name}
              email={email}
              isEditing={isEditing}
              onNameChange={setName}
              onEmailChange={setEmail}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
