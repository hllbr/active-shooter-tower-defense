export const sanitizeColor = (value: string, fallback = '#000000'): string => {
  const trimmed = value.trim();
  return /^#[0-9A-Fa-f]{3,8}$/.test(trimmed) ? trimmed : fallback;
};
