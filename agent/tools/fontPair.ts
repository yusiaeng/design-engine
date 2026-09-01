import { defineTool } from "eve/tools";
import { z } from "zod";

const FONT_PROFILES: {
  keywords: string[];
  heading: string;
  body: string;
  reason: string;
}[] = [
  {
    keywords: ["playful", "fun", "friendly"],
    heading: "Baloo 2",
    body: "Nunito Sans",
    reason: "A rounded, high-personality display face paired with a warm, easy-reading sans for a playful feel.",
  },
  {
    keywords: ["luxury", "elegant", "premium", "sophisticated"],
    heading: "Playfair Display",
    body: "Lato",
    reason: "A high-contrast serif signals refinement, balanced by a clean sans for readable body copy.",
  },
  {
    keywords: ["corporate", "professional", "trustworthy", "clean"],
    heading: "Inter",
    body: "Source Sans 3",
    reason: "Neutral, highly legible sans-serifs that read as professional and trustworthy at any size.",
  },
  {
    keywords: ["minimal", "modern", "calm", "serene", "zen"],
    heading: "Sora",
    body: "Inter",
    reason: "Geometric, understated forms keep the interface quiet and modern.",
  },
  {
    keywords: ["bold", "vibrant", "energetic", "tech", "futuristic"],
    heading: "Space Grotesk",
    body: "Work Sans",
    reason: "A distinctive geometric display face brings energy, grounded by a versatile workhorse body font.",
  },
];

const DEFAULT_PAIR = {
  heading: "Inter",
  body: "Inter",
  reason: "A single, highly legible variable font family keeps the type system simple and consistent.",
};

export default defineTool({
  description:
    "Suggest a heading/body typography pairing (real Google Fonts) that fits a given mood, with a short reason.",
  inputSchema: z.object({
    mood: z.string().min(1),
  }),
  async execute({ mood }) {
    const lower = mood.toLowerCase();
    const match = FONT_PROFILES.find((profile) =>
      profile.keywords.some((keyword) => lower.includes(keyword)),
    );
    const { heading, body, reason } = match ?? DEFAULT_PAIR;
    return { mood, heading, body, reason };
  },
});
