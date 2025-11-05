// components/ConfirmDialog.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogButton {
  text: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  characterImage: string;
  title: string;
  description: string;
  buttons: ConfirmDialogButton[];
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  characterImage,
  title,
  description,
  buttons,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 bg-white rounded-none shadow-2xl max-w-2xl w-full p-8">
        <div className="flex gap-6 items-center">
          {/* Character Image */}
          <div className="flex-shrink-0">
            <img
              src={characterImage}
              alt="character"
              className="w-40 h-40 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Title */}
            <h2 className="text-2xl font-bold text-primary">{title}</h2>

            {/* Description */}
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {description}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-2">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  onClick={button.onClick}
                  variant={button.variant}
                  className={`
                    px-6 py-2.5 text-base font-semibold
                    ${
                      button.variant === "outline"
                        ? "bg-transparent text-primary hover:underline shadow-none border-none"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }
                  `}
                  style={{ borderRadius: "13px" }}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
