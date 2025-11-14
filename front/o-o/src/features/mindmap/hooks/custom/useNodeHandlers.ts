import { useCallback } from "react";
import type {
  ChildNodeRequest,
  DeleteNodePayload,
  EditNodePayload,
} from "../../types";
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
  deleteNode: (payload: DeleteNodePayload) => void;
  editNode: (payload: EditNodePayload) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  confirmEdit: () => { text: string; memo: string };
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
  deleteNode,
  editNode,
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
      deleteNode({
        nodeId: id,
        deleteDescendants: options?.deleteDescendants,
      });
      onDeselect();
      setFocusedButton(null);
    },
    [deleteNode, id, onDeselect, setFocusedButton]
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
    const { text: newText, memo: newMemo } = confirmEdit();
    if (newText) {
      editNode({ nodeId: id, newText, newMemo });
    }
    setFocusedButton(null);
  }, [confirmEdit, editNode, id, setFocusedButton]);

  const handleAdd = useCallback(() => {
    openAddInput();
    setFocusedButton('add');
  }, [openAddInput, setFocusedButton]);

  const handleAddCancel = useCallback(() => {
    closeAddInput();
    setFocusedButton(null);
  }, [closeAddInput, setFocusedButton]);

  const handleAddConfirm = useCallback(
    (keyword: string, description: string) => {
      if (keyword) {
        onCreateChildNode({
          parentId: id,
          parentX: x,
          parentY: y,
          text: keyword,
          memo: description || undefined,
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
      editNode({ nodeId: id, newColor });
    },
    [id, initialColor, editNode]
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
