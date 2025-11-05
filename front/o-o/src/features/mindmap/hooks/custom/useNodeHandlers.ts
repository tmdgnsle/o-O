import { useCallback } from 'react';
import type { NodeData } from '../../pages/MindmapPage';
import type { FocusedButton } from './useNodeFocus';
import type { UseMutationResult } from '@tanstack/react-query';

type UseNodeHandlersParams = {
  id: string;
  x: number;
  y: number;
  initialColor: string;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  setFocusedButton: (button: FocusedButton) => void;
  deleteNodeMutation: UseMutationResult<NodeData[], Error, string, unknown>;
  editNodeMutation: UseMutationResult<NodeData[], Error, { nodeId: string; newText?: string; newColor?: string }, unknown>;
  addNodeMutation: UseMutationResult<NodeData[], Error, NodeData, unknown>;
  startEdit: () => void;
  cancelEdit: () => void;
  confirmEdit: () => string | null;
  openAddInput: () => void;
  closeAddInput: () => void;
  togglePalette: () => void;
  closePalette: () => void;
  paletteOpen: boolean;
};

export const useNodeHandlers = ({
  id,
  x,
  y,
  initialColor,
  isSelected,
  onSelect,
  onDeselect,
  setFocusedButton,
  deleteNodeMutation,
  editNodeMutation,
  addNodeMutation,
  startEdit,
  cancelEdit,
  confirmEdit,
  openAddInput,
  closeAddInput,
  togglePalette,
  closePalette,
  paletteOpen,
}: UseNodeHandlersParams) => {
  const handleClick = useCallback(() => {
    if (isSelected) {
      onDeselect();
      setFocusedButton(null);
    } else {
      onSelect();
      setFocusedButton(null);
    }
  }, [isSelected, onDeselect, onSelect, setFocusedButton]);

  const handleDelete = useCallback(() => {
    deleteNodeMutation.mutate(id);
    onDeselect();
    setFocusedButton(null);
  }, [deleteNodeMutation, id, onDeselect, setFocusedButton]);

  const handleEdit = useCallback(() => {
    startEdit();
    setFocusedButton("edit");
  }, [startEdit, setFocusedButton]);

  const handleEditCancel = useCallback(() => {
    cancelEdit();
    setFocusedButton(null);
  }, [cancelEdit, setFocusedButton]);

  const handleEditConfirm = useCallback(() => {
    const newText = confirmEdit();
    if (newText) {
      editNodeMutation.mutate({ nodeId: id, newText });
    }
    setFocusedButton(null);
  }, [confirmEdit, editNodeMutation, id, setFocusedButton]);

  const handleAdd = useCallback(() => {
    openAddInput();
    setFocusedButton("add");
  }, [openAddInput, setFocusedButton]);

  const handleAddCancel = useCallback(() => {
    closeAddInput();
    setFocusedButton(null);
  }, [closeAddInput, setFocusedButton]);

  const handleAddConfirm = useCallback((keyword: string, description: string) => {
    if (keyword) {
      const newNode: NodeData = {
        id: Date.now().toString(),
        text: keyword,
        x: x + 200, // 우측에 배치
        y: y,
        color: '#263A6B', // 기본 색상
      };
      addNodeMutation.mutate(newNode);
      closeAddInput();
    }
    setFocusedButton(null);
  }, [x, y, addNodeMutation, closeAddInput, setFocusedButton]);

  const handlePalette = useCallback(() => {
    const willBeOpen = !paletteOpen;
    togglePalette();
    setFocusedButton(willBeOpen ? "palette" : null);
  }, [paletteOpen, togglePalette, setFocusedButton]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      if (newColor === initialColor) {
        return;
      }
      editNodeMutation.mutate({ nodeId: id, newColor });
    },
    [id, initialColor, editNodeMutation]
  );

  const handlePaletteClose = useCallback(() => {
    closePalette();
    setFocusedButton(null);
  }, [closePalette, setFocusedButton]);

  const handleRecommend = useCallback(() => {
    setFocusedButton("recommend");
  }, [setFocusedButton]);

  const handleRecommendSelect = useCallback(
    (recommendText: string) => {
      const newNode: NodeData = {
        id: Date.now().toString(),
        text: recommendText,
        x: x + 200,
        y: y,
        color: '#263A6B',
      };
      addNodeMutation.mutate(newNode);
      setFocusedButton(null);
    },
    [x, y, addNodeMutation, setFocusedButton]
  );

  return {
    handleClick,
    handleDelete,
    handleEdit,
    handleEditCancel,
    handleEditConfirm,
    handleAdd,
    handleAddCancel,
    handleAddConfirm,
    handlePalette,
    handleColorChange,
    handlePaletteClose,
    handleRecommend,
    handleRecommendSelect,
  };
};
