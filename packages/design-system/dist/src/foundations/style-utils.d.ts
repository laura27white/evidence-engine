/**
 * Shared style helpers. Returns plain CSS style objects keyed against the token files so
 * components can be authored without a Tailwind dependency (useful for consumers that do
 * not ship Tailwind and for Storybook, which runs without it).
 */
import { type TypographyScale } from '../../tokens/typography';
import type { CSSProperties } from 'react';
export declare function scaleStyle(variant: TypographyScale): CSSProperties;
export declare function focusRingStyle(): CSSProperties;
export declare const fontFamily: {
    readonly display: "var(--font-display), \"Source Serif 4\", Georgia, serif";
    readonly body: "var(--font-body), \"IBM Plex Sans\", system-ui, sans-serif";
    readonly mono: "var(--font-mono), \"JetBrains Mono\", Consolas, Menlo, monospace";
};
export declare const tokens: {
    colour: {
        readonly paper: {
            readonly cream: "#F7F4EE";
            readonly creamElevated: "#FBF9F4";
            readonly white: "#FFFFFF";
        };
        readonly ink: {
            readonly primary: "#1A1A1A";
            readonly secondary: "#4A4A4A";
            readonly tertiary: "#7A7A7A";
            readonly quaternary: "#B8B8B8";
            readonly inverse: "#F7F4EE";
        };
        readonly accent: {
            readonly teal: "#0E6B6B";
            readonly tealMuted: "#0E6B6B20";
            readonly tealDeep: "#094949";
        };
        readonly severity: {
            readonly safe: "#6B8E7F";
            readonly safeSoft: "#6B8E7F18";
            readonly warning: "#D97534";
            readonly warningSoft: "#D9753418";
            readonly critical: "#B3261E";
            readonly criticalSoft: "#B3261E18";
        };
        readonly line: {
            readonly hairline: "#E6E1D8";
            readonly regular: "#D3CDC2";
            readonly strong: "#4A4A4A";
        };
    };
    typography: {
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
    space: {
        readonly unit: 4;
        readonly scale: {
            readonly '0': "0px";
            readonly '1': "4px";
            readonly '2': "8px";
            readonly '3': "12px";
            readonly '4': "16px";
            readonly '5': "20px";
            readonly '6': "24px";
            readonly '8': "32px";
            readonly '10': "40px";
            readonly '12': "48px";
            readonly '16': "64px";
            readonly '20': "80px";
            readonly '24': "96px";
            readonly '32': "128px";
            readonly '40': "160px";
        };
        readonly container: {
            readonly maxWidth: "1440px";
            readonly columns: 12;
            readonly gutter: "80px";
            readonly gutterTablet: "32px";
            readonly margin: "80px";
        };
        readonly radius: {
            readonly none: "0px";
            readonly sm: "4px";
            readonly md: "8px";
            readonly full: "9999px";
        };
        readonly shadow: {
            readonly none: "none";
            readonly hairline: "0 1px 0 rgba(26, 26, 26, 0.04)";
            readonly soft: "0 1px 2px rgba(26, 26, 26, 0.06), 0 2px 6px rgba(26, 26, 26, 0.04)";
        };
    };
};
//# sourceMappingURL=style-utils.d.ts.map