/** Extra offset di bawah notch / di atas home indicator — match referensi UI */
export const safeArea = {
  topExtra: 20,
  bottomExtra: 10,
  navFloatGap: 12,
  scrollBottomPad: 88,
} as const;

export function topPadding(insetTop: number): number {
  return insetTop + safeArea.topExtra;
}

export function bottomPadding(insetBottom: number): number {
  return Math.max(insetBottom, 16) + safeArea.bottomExtra;
}
