/**
 * Colour tokens.
 *
 * Derived from ARCHITECTURE.md section 6.3. Monochrome cream and ink base with a single
 * teal accent and a three-tone colour-blind-safe severity scale. Every value here is
 * verified against WCAG AA contrast on cream backgrounds by
 * `__tests__/colour-contrast.test.ts`. Severity colours are always paired with an icon
 * and a text label; the design system never conveys state via colour alone.
 */
export declare const colour: {
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
export type Colour = typeof colour;
export type SeverityTone = keyof typeof colour.severity;
//# sourceMappingURL=colour.d.ts.map