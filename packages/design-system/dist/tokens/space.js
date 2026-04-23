/**
 * Space tokens on a 4px base grid.
 *
 * Layout uses a 12-column grid with an 80px desktop gutter and 80px edge margins,
 * matching ARCHITECTURE.md section 6.4. Containers cap at 1440px; tablet narrows the
 * gutter to 32px.
 */
export const space = {
    unit: 4,
    scale: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        '40': '160px',
    },
    container: {
        maxWidth: '1440px',
        columns: 12,
        gutter: '80px',
        gutterTablet: '32px',
        margin: '80px',
    },
    radius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        full: '9999px',
    },
    shadow: {
        none: 'none',
        hairline: '0 1px 0 rgba(26, 26, 26, 0.04)',
        soft: '0 1px 2px rgba(26, 26, 26, 0.06), 0 2px 6px rgba(26, 26, 26, 0.04)',
    },
};
//# sourceMappingURL=space.js.map