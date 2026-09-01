"use client";

import { useEffect, useId, useState } from "react";
import { CheckIcon, CopyIcon, PaletteIcon, TypeIcon } from "lucide-react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { cn } from "@/lib/utils";

function SectionCard({
  icon,
  title,
  children,
}: {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-full rounded-2xl border bg-card/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SectionLoading({
  icon,
  title,
  label,
}: {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly label: string;
}) {
  return (
    <SectionCard icon={icon} title={title}>
      <Shimmer className="text-sm">{label}</Shimmer>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

type PaletteOutput = {
  readonly background: string;
  readonly text: string;
  readonly colors: readonly { name: string; hex: string }[];
};

function ColorSwatch({ name, hex }: { readonly name: string; readonly hex: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard access can be denied; the swatch still communicates the colour visually.
    }
  };

  return (
    <button
      className="group flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-center transition-colors hover:bg-muted/60"
      onClick={handleClick}
      type="button"
    >
      <span
        className="relative flex aspect-square w-full min-w-16 items-center justify-center rounded-xl border shadow-sm transition-transform group-active:scale-95"
        style={{ backgroundColor: hex }}
      >
        {copied ? (
          <CheckIcon className="size-5 text-white drop-shadow" />
        ) : (
          <CopyIcon className="size-4 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-70" />
        )}
      </span>
      <span className="text-xs font-medium capitalize leading-tight">{name}</span>
      <span className="font-mono text-[10px] text-muted-foreground">{copied ? "Copied!" : hex}</span>
    </button>
  );
}

export function PaletteOutput({ output }: { readonly output: PaletteOutput }) {
  return (
    <SectionCard icon={<PaletteIcon className="size-4" />} title="Colours">
      <div className="space-y-4">
        <div>
          <div
            className="flex flex-col justify-center gap-1 rounded-xl border p-4"
            style={{ backgroundColor: output.background, color: output.text }}
          >
            <span className="text-base font-semibold">Background &amp; text</span>
            <span className="text-sm opacity-80">This is how your text sits on your background.</span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
            {output.background} · {output.text}
          </p>
        </div>

        {output.colors.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Additional colours — tap to copy. Use them where they fit: accents, buttons,
              highlights, borders, illustrations. You don't need to use them all.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {output.colors.map((color, index) => (
                <ColorSwatch hex={color.hex} key={`${color.name}-${index}`} name={color.name} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}

export function PaletteLoading() {
  return (
    <SectionLoading
      icon={<PaletteIcon className="size-4" />}
      label="Building your colour palette…"
      title="Colours"
    />
  );
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

type ContrastOutput = {
  readonly foreground: string;
  readonly background: string;
  readonly ratio: number;
  readonly passesAA: boolean;
  readonly passesAAA: boolean;
};

function PassBadge({ pass, label }: { readonly pass: boolean; readonly label: string }) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border py-3 text-center",
        pass
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-xs">{pass ? "Pass" : "Fail"}</span>
    </div>
  );
}

function contrastSummary({ passesAA, passesAAA }: { passesAA: boolean; passesAAA: boolean }): string {
  if (passesAAA) return "Excellent readability — comfortable for everyone, including low vision.";
  if (passesAA) return "Good readability — comfortable for most people.";
  return "This pairing may be hard to read for some people.";
}

export function ContrastOutput({ output }: { readonly output: ContrastOutput }) {
  return (
    <SectionCard icon={<CheckIcon className="size-4" />} title="Accessibility">
      <div className="flex items-center gap-3">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-xl border font-semibold text-lg"
          style={{ backgroundColor: output.background, color: output.foreground }}
        >
          Aa
        </div>
        <div className="flex flex-1 gap-2">
          <PassBadge label="AA" pass={output.passesAA} />
          <PassBadge label="AAA" pass={output.passesAAA} />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{contrastSummary(output)}</p>
    </SectionCard>
  );
}

export function ContrastLoading() {
  return (
    <SectionLoading
      icon={<CheckIcon className="size-4" />}
      label="Checking accessibility…"
      title="Accessibility"
    />
  );
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

type FontPairOutput = {
  readonly heading: string;
  readonly body: string;
  readonly reason: string;
};

function useGoogleFont(family: string) {
  useEffect(() => {
    const id = `google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }, [family]);
}

function fontSpecimenUrl(family: string): string {
  return `https://fonts.google.com/specimen/${encodeURIComponent(family).replace(/%20/g, "+")}`;
}

export function FontPairOutput({ output }: { readonly output: FontPairOutput }) {
  useGoogleFont(output.heading);
  useGoogleFont(output.body);
  const uid = useId();
  const samePair = output.heading === output.body;

  return (
    <SectionCard icon={<TypeIcon className="size-4" />} title="Typography">
      <div className="space-y-3 rounded-xl border bg-background/60 p-4">
        <p
          className="text-4xl leading-tight"
          style={{ fontFamily: `"${output.heading}", sans-serif`, fontWeight: 700 }}
        >
          Aa Bb Cc
        </p>
        <p
          className="text-sm text-muted-foreground"
          style={{ fontFamily: `"${output.body}", sans-serif` }}
        >
          The quick brown fox jumps over the lazy dog — this is your body text.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Heading: <span className="font-medium text-foreground">{output.heading}</span>
        </span>
        {!samePair ? (
          <span>
            Body: <span className="font-medium text-foreground">{output.body}</span>
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{output.reason}</p>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground/70">
        <a
          className="underline underline-offset-2 hover:text-muted-foreground"
          href={fontSpecimenUrl(output.heading)}
          key={`${uid}-heading`}
          rel="noreferrer"
          target="_blank"
        >
          {output.heading} on Google Fonts
        </a>
        {!samePair ? (
          <a
            className="underline underline-offset-2 hover:text-muted-foreground"
            href={fontSpecimenUrl(output.body)}
            key={`${uid}-body`}
            rel="noreferrer"
            target="_blank"
          >
            {output.body} on Google Fonts
          </a>
        ) : null}
      </div>
    </SectionCard>
  );
}

export function FontPairLoading() {
  return (
    <SectionLoading
      icon={<TypeIcon className="size-4" />}
      label="Choosing your fonts…"
      title="Typography"
    />
  );
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

const SECTION_META = {
  makePalette: { icon: <PaletteIcon className="size-4" />, title: "Colours" },
  contrastCheck: { icon: <CheckIcon className="size-4" />, title: "Accessibility" },
  fontPair: { icon: <TypeIcon className="size-4" />, title: "Typography" },
} as const;

export function StyleAdvisorError({
  toolName,
  errorText,
}: {
  readonly toolName: keyof typeof SECTION_META;
  readonly errorText: string;
}) {
  const meta = SECTION_META[toolName];
  return (
    <SectionCard icon={meta.icon} title={meta.title}>
      <p className="text-sm text-muted-foreground">
        Something went wrong putting this together — try asking again.
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground/60">{errorText}</p>
    </SectionCard>
  );
}
