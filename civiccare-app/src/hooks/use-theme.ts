import { useAppTheme } from '@/services/themeContext';

export function useTheme() {
  const { colors } = useAppTheme();
  return colors;
}
