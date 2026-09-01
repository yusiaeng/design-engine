export type PaletteColor = { role: string; hex: string };

export function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(100, Math.max(0, s)) / 100;
  const light = Math.min(100, Math.max(0, l)) / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function channelLuminance(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function normalizeHex(hex: string): string {
  const clean = hex.trim().replace(/^#/, "").toLowerCase();
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  return `#${full}`;
}

const HUE_FAMILIES: { max: number; name: string }[] = [
  { max: 15, name: "red" },
  { max: 45, name: "terracotta" },
  { max: 65, name: "amber" },
  { max: 90, name: "gold" },
  { max: 150, name: "sage" },
  { max: 170, name: "green" },
  { max: 195, name: "teal" },
  { max: 220, name: "sky" },
  { max: 250, name: "blue" },
  { max: 280, name: "indigo" },
  { max: 320, name: "plum" },
  { max: 345, name: "magenta" },
  { max: 361, name: "red" },
];

function hueFamily(hue: number): string {
  const wrapped = ((hue % 360) + 360) % 360;
  return HUE_FAMILIES.find((family) => wrapped <= family.max)?.name ?? "grey";
}

/** Turns an HSL colour into a short, free-form descriptive name (e.g. "muted sage", "deep plum"). */
export function describeColor(h: number, s: number, l: number): string {
  const family = hueFamily(h);
  if (s < 15) {
    return l > 80 ? "off-white" : l < 20 ? "charcoal" : "grey";
  }
  const lightnessWord = l < 25 ? "deep" : l < 45 ? "dark" : l > 85 ? "pale" : l > 70 ? "soft" : undefined;
  const saturationWord = s < 35 ? "muted" : s > 75 ? "vivid" : undefined;
  const modifier = lightnessWord ?? saturationWord;
  return modifier ? `${modifier} ${family}` : family;
}
