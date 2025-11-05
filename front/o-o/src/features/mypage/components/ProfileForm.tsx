interface ProfileFormProps {
  name: string;
  email: string;
  isEditing: boolean;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileForm({
  name,
  email,
  isEditing,
  onNameChange,
  onEmailChange,
  onSave,
  onCancel,
}: ProfileFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-md font-medium mb-2">
          이름
          {isEditing && <span className="text-[#FF8B8B] ml-1">*</span>}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={!isEditing}
          className={`w-full px-3 py-2 text-sm -m-3 text-deep-gray focus:outline-none ${
            isEditing ? "bg-[#E8E8E8] m-0 rounded-md" : "bg-white"
          } disabled:cursor-not-allowed`}
        />
      </div>
      <div>
        <label className="block text-md font-medium mb-2">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={!isEditing}
          className="m-w-full px-3 py-2 bg-white focus:outline-none text-sm -m-3 text-deep-gray"
        />
      </div>

      {isEditing && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[#E5E5E5] rounded-md hover:bg-gray-50 text-sm leading-none"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="px-4 py-0 bg-primary text-white rounded-md hover:bg-primary/90 text-sm leading-none"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
