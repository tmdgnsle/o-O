// components/ContentDialog.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";

function hasReadableText(children: React.ReactNode) {
  // 자식 노드 중 하나라도 텍스트가 있으면 true
  return React.Children.toArray(children).some((child) => {
    if (typeof child === "string") return child.trim().length > 0;
    if (typeof child === "number") return true;
    // 링크/이모지/인라인요소 등은 스크린리더가 읽을 수 있으므로 존재만으로 true 처리
    if (React.isValidElement(child)) return true;
    return false;
  });
}

export const MarkdownH1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  if (!hasReadableText(children)) return null; // S6850: 빈 헤딩 회피
  return (
    <h1
      className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-5 text-gray-900"
      {...props}
    >
      {children}
    </h1>
  );
};

export const MarkdownH2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  if (!hasReadableText(children)) return null;
  return (
    <h2
      className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 mt-4 sm:mt-6 lg:mt-8 text-gray-900"
      {...props}
    >
      {children}
    </h2>
  );
};

export const MarkdownH3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  if (!hasReadableText(children)) return null;
  return (
    <h3
      className="text-base sm:text-lg lg:text-xl font-semibold mb-2 lg:mb-3 mt-3 sm:mt-4 lg:mt-6 text-gray-800"
      {...props}
    >
      {children}
    </h3>
  );
};

export const MarkdownUL: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({
  children,
  ...props
}) => (
  <ul
    className="list-disc pl-4 sm:pl-5 lg:pl-6 mb-3 sm:mb-4 lg:mb-5 space-y-1.5 sm:space-y-2 lg:space-y-3"
    {...props}
  >
    {children}
  </ul>
);

export const MarkdownOL: React.FC<React.HTMLAttributes<HTMLOListElement>> = ({
  children,
  ...props
}) => (
  <ol
    className="list-decimal pl-4 sm:pl-5 lg:pl-6 mb-3 sm:mb-4 lg:mb-5 space-y-1.5 sm:space-y-2 lg:space-y-3"
    {...props}
  >
    {children}
  </ol>
);

export const MarkdownLI: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({
  children,
  ...props
}) => (
  <li
    className="text-gray-800 leading-relaxed text-sm sm:text-base lg:text-lg"
    {...props}
  >
    {children}
  </li>
);

export const MarkdownP: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, ...props }) => (
  <p
    className="mb-2 sm:mb-3 lg:mb-4 text-gray-800 leading-relaxed text-sm sm:text-base lg:text-lg"
    {...props}
  >
    {children}
  </p>
);

export const MarkdownStrong: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  ...props
}) => (
  <strong className="font-bold text-gray-900" {...props}>
    {children}
  </strong>
);

type CodeProps = React.HTMLAttributes<HTMLElement> & { inline?: boolean };
export const MarkdownCode: React.FC<CodeProps> = ({
  inline,
  children,
  ...rest
}) => {
  if (inline) {
    return (
      <code
        className="bg-gray-300 px-1 sm:px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs sm:text-sm lg:text-base font-mono text-red-600"
        {...rest}
      >
        {children}
      </code>
    );
  }
  return (
    <code
      className="block bg-gray-300 p-3 sm:p-4 lg:p-5 rounded-lg text-xs sm:text-sm lg:text-base font-mono overflow-x-auto"
      {...rest}
    >
      {children}
    </code>
  );
};

interface DialogButton {
  id: string;
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
      className={`bg-[#DCDFE5] rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-7xl mx-auto ${className}`}
    >
      {/* 반응형 패딩 */}
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 mb-6 lg:mb-8">
          {/* Left: Character + Title */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
            {characterImage && (
              <img
                src={characterImage}
                alt="character"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain flex-shrink-0"
              />
            )}
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-[32px] font-bold text-primary break-words leading-tight">
              {title}
            </h2>
          </div>

          {/* Right: Buttons */}
          <div className="flex gap-2 flex-shrink-0 self-end xl:self-auto">
            {buttons.map((button, index) => (
              <Button
                key={button.id}
                onClick={button.onClick}
                variant={button.variant || "outline"}
                className={`
                  px-3 sm:px-4 md:px-6 lg:px-8 
                  py-1.5 sm:py-2 md:py-2.5 lg:py-3
                  text-xs sm:text-sm md:text-base
                  whitespace-nowrap
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
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none pr-2 sm:pr-3 lg:pr-4">
            <ReactMarkdown
              components={{
                h1: MarkdownH1,
                h2: MarkdownH2,
                h3: MarkdownH3,
                ul: MarkdownUL,
                ol: MarkdownOL,
                li: MarkdownLI,
                p: MarkdownP,
                strong: MarkdownStrong,
                code: MarkdownCode,
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
