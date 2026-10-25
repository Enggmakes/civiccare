import { useAppTheme } from '@/services/themeContext';

export function useColorScheme() {
  const { themeMode } = useAppTheme();
  return themeMode;
}
