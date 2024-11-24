type RGB = [number, number, number];

const convertHexToRgb = (hex: string): RGB => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r, g, b];
};

const calcLuminance = (rgbColor: RGB) => {
  const [r8, g8, b8] = rgbColor;
  const rsrgb = r8 / 255;
  const gsrgb = g8 / 255;
  const bsrgb = b8 / 255;
  const r =
    rsrgb <= 0.04045
      ? rsrgb / 12.92
      : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const g =
    gsrgb <= 0.04045
      ? gsrgb / 12.92
      : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const b =
    bsrgb <= 0.04045
      ? bsrgb / 12.92
      : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const calcContrast = (color1: string, color2: string) => {
  const rgb1 = convertHexToRgb(color1);
  const rgb2 = convertHexToRgb(color2);
  const l1 = calcLuminance(rgb1);
  const l2 = calcLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
