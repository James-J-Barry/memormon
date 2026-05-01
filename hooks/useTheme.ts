import { useStore } from "../store/useStore";
import { darkColors, lightColors, UIColors } from "../theme/colors";

export function useTheme(): UIColors {
  const theme = useStore((s) => s.theme);
  return theme === "light" ? lightColors : darkColors;
}
