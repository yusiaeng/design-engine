import { defineTool } from "eve/tools";
import { z } from "zod";
import { describeColor, hashSeed, hslToHex } from "../lib/color";

const MOOD_PROFILES: {
  keywords: string[];
  saturation: [number, number];
  dark: boolean;
}[] = [
  { keywords: ["calm", "serene", "minimal", "zen", "soft"], saturation: [25, 40], dark: false },
  { keywords: ["luxury", "elegant", "premium", "sophisticated"], saturation: [30, 55], dark: true },
  { keywords: ["bold", "vibrant", "energetic", "playful", "fun"], saturation: [65, 90], dark: false },
  { keywords: ["dark", "moody", "dramatic", "night"], saturation: [40, 65], dark: true },
  { keywords: ["corporate", "professional", "trustworthy", "clean"], saturation: [35, 55], dark: false },
];

function profileFor(mood: string) {
  const lower = mood.toLowerCase();
  const match = MOOD_PROFILES.find((profile) =>
    profile.keywords.some((keyword) => lower.includes(keyword)),
  );
  return match ?? { keywords: [], saturation: [40, 60] as [number, number], dark: false };
}

export default defineTool({
  description:
    "Generate a candidate colour palette from a project description and mood. Returns a mandatory `background` and `text` colour (the pair contrastCheck must validate) plus an open-ended `colors` list of extra hues sized to fit the mood, each with a free-form descriptive name. The result must be checked with contrastCheck before it is recommended.",
  inputSchema: z.object({
    projectDescription: z.string().min(1),
    mood: z.string().min(1),
    avoidHue: z
      .number()
      .min(0)
      .max(360)
      .optional()
      .describe(
        "A hue (0-360) to steer away from when revising a palette that previously failed contrastCheck.",
      ),
  }),
  async execute({ projectDescription, mood, avoidHue }) {
    const profile = profileFor(mood);
    const seed = hashSeed(`${projectDescription}:${mood}`);
    let baseHue = seed % 360;
    if (avoidHue !== undefined && Math.abs(baseHue - avoidHue) < 20) {
      baseHue = (baseHue + 90) % 360;
    }

    const [satMin, satMax] = profile.saturation;
    const saturation = satMin + (seed % (satMax - satMin + 1));
    const dark = profile.dark;

    const backgroundHsl = { h: baseHue, s: Math.max(10, saturation - 25), l: dark ? 12 : 97 };
    const textHsl = { h: baseHue, s: 15, l: dark ? 95 : 12 };
    const background = hslToHex(backgroundHsl.h, backgroundHsl.s, backgroundHsl.l);
    const text = hslToHex(textHsl.h, textHsl.s, textHsl.l);

    const extraCount = 3 + (seed % 3); // 3-5 extra colours
    const usedNames = new Set<string>();
    const colors = Array.from({ length: extraCount }, (_, index) => {
      const hue = (baseHue + [40, 180, 220, 300, 130][index % 5]) % 360;
      const s = index === 1 ? Math.min(95, saturation + 15) : Math.max(20, saturation - 15 + index * 5);
      const l = dark ? 45 + index * 8 : 40 + index * 6;
      const hex = hslToHex(hue, s, l);
      let name = describeColor(hue, s, l);
      if (usedNames.has(name)) {
        name = `${name} (${hex})`;
      }
      usedNames.add(name);
      return { name, hex };
    });

    return {
      mood,
      baseHue,
      background,
      text,
      colors,
    };
  },
});
