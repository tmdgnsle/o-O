import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

interface ModalHeaderProps {
  readonly isEditing: boolean;
  readonly onEdit: () => void;
  readonly onClose: () => void;
}

export function ModalHeader({ isEditing, onEdit, onClose }: ModalHeaderProps) {
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      {!isEditing && (
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 transition bg-[#F6F6F6] rounded-full border border-[#E5E5E5] shadow-md mr-1 hover:bg-primary/90 group"
          title="수정"
        >
          <EditIcon
            sx={{
              color: "#263A6B",
              fontSize: 24,
              ".group:hover &": { color: "white" },
            }}
          />
        </button>
      )}
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 transition bg-[#F6F6F6] rounded-full border border-[#E5E5E5] shadow-md hover:bg-primary/90 group"
        title="닫기"
      >
        <CloseIcon
          sx={{
            color: "#263A6B",
            fontSize: 24,
            ".group:hover &": { color: "white" },
          }}
        />
      </button>
    </div>
  );
}
