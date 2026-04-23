/**
 * Typography tokens.
 *
 * Pair a serif display face with a sans body and a mono for data. ARCHITECTURE.md section
 * 6.2 picks the free fallback stack (Source Serif 4, IBM Plex Sans, JetBrains Mono); CSS
 * variables are populated by next/font in apps/web/app/layout.tsx.
 */
export declare const typography: {
    readonly font: {
        readonly display: "var(--font-display), \"Source Serif 4\", Georgia, serif";
        readonly body: "var(--font-body), \"IBM Plex Sans\", system-ui, sans-serif";
        readonly mono: "var(--font-mono), \"JetBrains Mono\", Consolas, Menlo, monospace";
    };
    readonly scale: {
        readonly displayMax: {
            readonly size: "72px";
            readonly lineHeight: "76px";
            readonly tracking: "-0.02em";
            readonly weight: 500;
        };
        readonly displayLarge: {
            readonly size: "56px";
            readonly lineHeight: "60px";
            readonly tracking: "-0.02em";
            readonly weight: 500;
        };
        readonly displayMedium: {
            readonly size: "40px";
            readonly lineHeight: "44px";
            readonly tracking: "-0.015em";
            readonly weight: 500;
        };
        readonly displaySmall: {
            readonly size: "28px";
            readonly lineHeight: "32px";
            readonly tracking: "-0.01em";
            readonly weight: 500;
        };
        readonly bodyLarge: {
            readonly size: "17px";
            readonly lineHeight: "26px";
            readonly tracking: "0";
            readonly weight: 400;
        };
        readonly body: {
            readonly size: "15px";
            readonly lineHeight: "22px";
            readonly tracking: "0";
            readonly weight: 400;
        };
        readonly bodySmall: {
            readonly size: "13px";
            readonly lineHeight: "18px";
            readonly tracking: "0.005em";
            readonly weight: 400;
        };
        readonly label: {
            readonly size: "12px";
            readonly lineHeight: "16px";
            readonly tracking: "0.08em";
            readonly weight: 500;
            readonly textTransform: "uppercase";
        };
        readonly monoLarge: {
            readonly size: "15px";
            readonly lineHeight: "20px";
            readonly tracking: "0";
            readonly weight: 400;
        };
        readonly mono: {
            readonly size: "13px";
            readonly lineHeight: "18px";
            readonly tracking: "0";
            readonly weight: 400;
        };
        readonly monoSmall: {
            readonly size: "11px";
            readonly lineHeight: "14px";
            readonly tracking: "0";
            readonly weight: 400;
        };
    };
};
export type Typography = typeof typography;
export type TypographyScale = keyof typeof typography.scale;
//# sourceMappingURL=typography.d.ts.map