import Link from 'next/link';

import type { LinkProps } from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

export type LinkButtonSize = 'sm' | 'md' | 'lg';
export type LinkButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface LinkButtonProps extends Omit<LinkProps, 'children'> {
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
  children: ReactNode;
  style?: CSSProperties;
  'aria-label'?: string;
}

const paddingBySize: Record<LinkButtonSize, string> = {
  sm: '8px 16px',
  md: '12px 20px',
  lg: '16px 24px',
};

const fontSizeBySize: Record<LinkButtonSize, number> = {
  sm: 13,
  md: 15,
  lg: 17,
};

const minHeightBySize: Record<LinkButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

interface VariantStyle {
  background: string;
  color: string;
  border: string;
}

const variantStyles: Record<LinkButtonVariant, VariantStyle> = {
  primary: { background: '#1A1A1A', color: '#F7F4EE', border: '1px solid #1A1A1A' },
  secondary: { background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A' },
  ghost: { background: 'transparent', color: '#1A1A1A', border: '1px solid transparent' },
};

export function LinkButton({
  size = 'md',
  variant = 'primary',
  children,
  style,
  ...rest
}: LinkButtonProps) {
  const v = variantStyles[variant];
  return (
    <Link
      {...rest}
      style={{
        ...v,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: paddingBySize[size],
        minHeight: minHeightBySize[size],
        fontSize: fontSizeBySize[size],
        fontFamily: 'var(--font-body), system-ui, sans-serif',
        fontWeight: 500,
        textDecoration: 'none',
        borderRadius: 4,
        transition: 'background 120ms ease-in-out',
        ...style,
      }}
    >
      {children}
    </Link>
  );
}
