import { useEffect, useState } from \"react\";

const DEFAULT_WINDOW_WIDTH = 1024;

export function useWindowWidth(fallbackWidth: number = DEFAULT_WINDOW_WIDTH) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== \"undefined\" ? window.innerWidth : fallbackWidth
  );

  useEffect(() => {
    if (typeof window === \"undefined\") return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener(\"resize\", handleResize);

    return () => window.removeEventListener(\"resize\", handleResize);
  }, []);

  return windowWidth;
}
