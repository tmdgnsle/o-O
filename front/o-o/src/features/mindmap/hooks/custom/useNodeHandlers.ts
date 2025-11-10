import { useCallback } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ChildNodeRequest, NodeData } from '../../types';
import type { FocusedButton } from './useNodeFocus';

type UseNodeHandlersParams = {
  id: string;
  x: number;
  y: number;
  initialColor: string;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  setFocusedButton: (button: FocusedButton) => void;
  deleteNodeMutation: UseMutationResult<NodeData[], Error, { nodeId: string; deleteDescendants?: boolean }, unknown>;
  editNodeMutation: UseMutationResult<NodeData[], Error, { nodeId: string; newText?: string; newColor?: string }, unknown>;
  startEdit: () => void;
  cancelEdit: () => void;
  confirmEdit: () => string | null;
  openAddInput: () => void;
  closeAddInput: () => void;
  togglePalette: () => void;
  closePalette: () => void;
  paletteOpen: boolean;
  onCreateChildNode: (request: ChildNodeRequest) => void;
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
  startEdit,
  cancelEdit,
  confirmEdit,
  openAddInput,
  closeAddInput,
  togglePalette,
  closePalette,
  paletteOpen,
  onCreateChildNode,
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

  const handleDelete = useCallback(
    (options?: { deleteDescendants?: boolean }) => {
      deleteNodeMutation.mutate({
        nodeId: id,
        deleteDescendants: options?.deleteDescendants,
      });
      onDeselect();
      setFocusedButton(null);
    },
    [deleteNodeMutation, id, onDeselect, setFocusedButton]
  );

  const handleEdit = useCallback(() => {
    startEdit();
    setFocusedButton('edit');
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
    setFocusedButton('add');
  }, [openAddInput, setFocusedButton]);

  const handleAddCancel = useCallback(() => {
    closeAddInput();
    setFocusedButton(null);
  }, [closeAddInput, setFocusedButton]);

  const handleAddConfirm = useCallback(
    (keyword: string, _description: string) => {
      if (keyword) {
        onCreateChildNode({
          parentId: id,
          parentX: x,
          parentY: y,
          text: keyword,
        });
        closeAddInput();
      }
      setFocusedButton(null);
    },
    [id, x, y, onCreateChildNode, closeAddInput, setFocusedButton]
  );

  const handlePalette = useCallback(() => {
    const willBeOpen = !paletteOpen;
    togglePalette();
    setFocusedButton(willBeOpen ? 'palette' : null);
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
    setFocusedButton('recommend');
  }, [setFocusedButton]);

  const handleRecommendSelect = useCallback(
    (recommendText: string) => {
      onCreateChildNode({
        parentId: id,
        parentX: x,
        parentY: y,
        text: recommendText,
      });
      setFocusedButton(null);
    },
    [id, x, y, onCreateChildNode, setFocusedButton]
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
