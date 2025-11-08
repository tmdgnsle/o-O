import { useCallback } from "react";
import { COLOR_THEMES, type ColorThemeName } from "../styles/colorThemes";

const THEME_STORAGE_KEY = "mindmap-current-theme";

/**
 * 마인드맵 노드 색상 관리 hook
 * - 사용자가 선택한 테마에서 랜덤 색상 선택 기능 제공
 * - localStorage에 테마 저장/불러오기
 * - 모든 노드 생성 시 일관된 색상 선택 로직 사용
 */
export function useColorTheme() {
  /**
   * localStorage에서 현재 테마 가져오기
   */
  const getCurrentTheme = useCallback((): ColorThemeName => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && stored in COLOR_THEMES) {
        return stored as ColorThemeName;
      }
    } catch (error) {
      console.error("Failed to load theme from localStorage:", error);
    }
    return "Pastel"; // 기본값
  }, []);

  /**
   * localStorage에 현재 테마 저장하기
   */
  const setCurrentTheme = useCallback((theme: ColorThemeName) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error);
    }
  }, []);

  /**
   * 현재 테마에서 랜덤 색상 선택
   */
  const getRandomThemeColor = useCallback(() => {
    const theme = getCurrentTheme();
    const colors = COLOR_THEMES[theme];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }, [getCurrentTheme]);

  /**
   * @deprecated Use getRandomThemeColor instead
   */
  const getRandomPastelColor = getRandomThemeColor;

  return {
    getCurrentTheme,
    setCurrentTheme,
    getRandomThemeColor,
    getRandomPastelColor, // 하위 호환성
  };
}
