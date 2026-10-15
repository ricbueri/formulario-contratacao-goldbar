export const OPEN_BAR_DURATION_OPTIONS = [1, 2, 3, 4, 5, 6].map((hours) => ({
  value: `${hours} ${hours === 1 ? "hora" : "horas"}`,
  label: `${hours} ${hours === 1 ? "hora" : "horas"}`,
}));
