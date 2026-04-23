/**
 * Space tokens on a 4px base grid.
 *
 * Layout uses a 12-column grid with an 80px desktop gutter and 80px edge margins,
 * matching ARCHITECTURE.md section 6.4. Containers cap at 1440px; tablet narrows the
 * gutter to 32px.
 */
export declare const space: {
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
export type Space = typeof space;
export type SpaceKey = keyof typeof space.scale;
//# sourceMappingURL=space.d.ts.map