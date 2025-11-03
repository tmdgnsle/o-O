import { useState } from 'react';

export const useNodeEdit = (initialText: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialText);

  const startEdit = () => {
    setEditValue(initialText);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValue(initialText);
    setIsEditing(false);
  };

  const confirmEdit = () => {
    setIsEditing(false);
    return editValue.trim();
  };

  return {
    isEditing,
    editValue,
    setEditValue,
    startEdit,
    cancelEdit,
    confirmEdit,
  };
};