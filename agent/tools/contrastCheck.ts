import { defineTool } from "eve/tools";
import { z } from "zod";
import { contrastRatio, normalizeHex } from "../lib/color";

const hexColor = z
  .string()
  .regex(/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/, "Must be a hex colour like #1a2b3c");

export default defineTool({
  description:
    "Compute the real WCAG contrast ratio between two hex colours using relative luminance maths, and report whether the pairing passes WCAG AA (4.5:1) and AAA (7:1) for normal text. Always run this on a palette's background/text pair before recommending it.",
  inputSchema: z.object({
    foreground: hexColor.describe("The text/foreground colour as a hex code."),
    background: hexColor.describe("The background colour as a hex code."),
  }),
  async execute({ foreground, background }) {
    const fg = normalizeHex(foreground);
    const bg = normalizeHex(background);
    const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;

    return {
      foreground: fg,
      background: bg,
      ratio,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
    };
  },
});
