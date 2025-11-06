// shared/ui/CustomScrollbar.tsx
import React from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

interface CustomScrollbarProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  autoHide?: boolean;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  children,
  maxHeight = "100%",
  className = "",
  autoHide = false,
}) => {
  return (
    <SimpleBar
      style={{ maxHeight }}
      className={`custom-simplebar ${className}`}
      autoHide={autoHide}
    >
      {children}
    </SimpleBar>
  );
};

export default CustomScrollbar;
