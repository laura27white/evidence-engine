'use client';

import { AppShell, Text, type NavItem } from '@tp/design-system';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { RecomputeButton } from './RecomputeButton';

import type { AnchorHTMLAttributes, ReactNode } from 'react';

const NAV_ITEMS: NavItem[] = [
  { label: 'Horizon', href: '/horizon' },
  { label: 'Trace', href: '/trace' },
  { label: 'Cascade', href: '/cascade' },
  { label: 'Brief', href: '/brief' },
];

function NextAnchor({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href === undefined) {
    return <a {...rest}>{children}</a>;
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

export interface DashboardShellProps {
  ribbon?: ReactNode;
  recomputeSummary?: string;
  children: ReactNode;
}

export function DashboardShell({ ribbon, recomputeSummary, children }: DashboardShellProps) {
  const pathname = usePathname() ?? undefined;
  const activePath = pathname ? activeFromPath(pathname) : undefined;
  return (
    <AppShell
      navItems={NAV_ITEMS}
      activePath={activePath}
      NavAnchor={NextAnchor}
      headerActions={<RecomputeButton initialSummary={recomputeSummary} />}
      footer={<DashboardFooter />}
    >
      {ribbon}
      {children}
    </AppShell>
  );
}

function activeFromPath(pathname: string): string {
  if (pathname.startsWith('/horizon')) return '/horizon';
  if (pathname.startsWith('/cascade')) return '/cascade';
  if (pathname.startsWith('/trace')) return '/trace';
  if (pathname.startsWith('/brief')) return '/brief';
  return pathname;
}

function DashboardFooter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text variant="label" tone="tertiary">
        Evidence Engine
      </Text>
    </div>
  );
}
