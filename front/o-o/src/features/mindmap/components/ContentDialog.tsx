// components/ContentDialog.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";

interface DialogButton {
  text: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

interface ContentDialogProps {
  characterImage?: string;
  title: string;
  buttons: DialogButton[];
  content: string;
  className?: string;
}

const ContentDialog: React.FC<ContentDialogProps> = ({
  characterImage,
  title,
  buttons,
  content,
  className = "",
}) => {
  return (
    <div
      className={`bg-[#DCDFE5] rounded-2xl shadow-2xl max-w-7xl w-full ${className}`}
    >
      <div className="p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {characterImage && (
              <img
                src={characterImage}
                alt="character"
                className="w-20 h-20 object-contain"
              />
            )}
            <h2 className="text-[32px] font-bold text-primary">{title}</h2>
          </div>

          <div className="flex gap-2">
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.onClick}
                variant={button.variant || "outline"}
                className={`
                  px-8 py-3 text-base
                  ${
                    index === buttons.length - 1
                      ? "bg-primary hover:bg-primary text-primary-foreground border-primary"
                      : "bg-white border-gray-400 text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Content with CustomScrollbar */}
        <CustomScrollbar maxHeight="70vh">
          <div className="prose prose-slate max-w-none prose-lg pr-4">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold mb-5 text-gray-900"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-bold mb-4 mt-8 text-gray-900"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-semibold mb-3 mt-6 text-gray-800"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-6 mb-5 space-y-3" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-6 mb-5 space-y-3" {...props} />
                ),
                li: ({ ...props }) => (
                  <li
                    className="text-gray-800 leading-relaxed text-lg"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="mb-4 text-gray-800 leading-relaxed text-lg"
                    {...props}
                  />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-gray-900" {...props} />
                ),
                code: (props) => {
                  const { inline, children, ...rest } =
                    props as React.HTMLAttributes<HTMLElement> & {
                      inline?: boolean;
                    };
                  return inline ? (
                    <code
                      className="bg-gray-300 px-2 py-1 rounded text-base font-mono text-red-600"
                      {...rest}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="block bg-gray-300 p-5 rounded-lg text-base font-mono overflow-x-auto"
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </CustomScrollbar>
      </div>
    </div>
  );
};

export default ContentDialog;
