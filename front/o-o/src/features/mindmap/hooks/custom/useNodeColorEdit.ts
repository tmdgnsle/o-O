import { useState } from 'react';

export const useNodeColorEdit = (initialColor: string = "#2D71B9") => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [color, setColor] = useState(initialColor);

  const togglePalette = () => {
    setPaletteOpen((prev) => !prev);
  };

  const closePalette = () => {
    setPaletteOpen(false);
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    // closePalette();
  };

  return {
    paletteOpen,
    color,
    togglePalette,
    closePalette,
    changeColor,
  };
};