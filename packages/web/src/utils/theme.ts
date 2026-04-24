export function applyTheme(isDark: boolean): void {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initTheme(): void {
  const stored = localStorage.getItem('theme-storage');
  let isDark = false;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      isDark = parsed?.state?.isDark ?? false;
    } catch {
      isDark = false;
    }
  }
  applyTheme(isDark);
}
