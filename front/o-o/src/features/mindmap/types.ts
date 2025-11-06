// ============================================
// Component Props Types
// ============================================

// AddInputBox.tsx
export type AddInputBoxProps = Readonly<{
  open: boolean;
  onConfirm: (keyword: string, description: string) => void;
  onCancel: () => void;
}>;

// ColorPalette.tsx
export type ColorPaletteProps = Readonly<{
  open: boolean;
  onColorChange?: (color: string) => void;
  onApplyTheme?: (colors: string[]) => void;
  onClose?: () => void;
  value?: string;
  className?: string;
}>;

// CytoscapeCanvas.tsx
export type CytoscapeCanvasProps = Readonly<{
  nodes: NodeData[];
  className?: string;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeUnselect: () => void;
  onApplyTheme: (colors: string[]) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
}>;

export type CytoscapeNodeOverlayProps = {
  node: NodeData;
  x: number;
  y: number;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onApplyTheme: (colors: string[]) => void;
};

// RadialToolGroup.tsx
export type RadialToolGroupProps = Readonly<{
  open: boolean;
  radius?: number;
  paletteOpen?: boolean;
  addInputOpen?: boolean;
  currentColor?: string;
  focusedButton?: "delete" | "add" | "edit" | "palette" | "recommend" | null;
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  onAddConfirm?: (keyword: string, description: string) => void;
  onAddCancel?: () => void;
  onPalette?: () => void;
  onPaletteClose?: () => void;
  onRecommend?: () => void;
  onColorChange?: (color: string) => void;
  onApplyTheme?: (colors: string[]) => void;
}>;

// RecommendNodeOverlay.tsx
export type RecommendNodeData = {
  id: string;
  text: string;
  type: "ai" | "trend";
};

export type RecommendNodeOverlayProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onSelectRecommendation: (text: string) => void;
}>;

// TempNode.tsx
export type TempNodeProps = Readonly<{
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  onApplyTheme: (colors: string[]) => void;
}>;

// Textbox.tsx
export type TextboxProps = Readonly<{
  onAddNode: (text: string) => void;
}>;

// ============================================
// Data Types
// ============================================

export type NodeData = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  parentId?: string;
};
