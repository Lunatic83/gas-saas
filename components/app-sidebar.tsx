'use client';

import { PanelLeftIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Navigation',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/dashboard/settings' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', href: '/dashboard/profile' },
      { label: 'Billing', href: '/dashboard/billing' },
    ],
  },
];

export function AppSidebar({ className }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className={cn('', className)}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <SidebarTrigger className="size-8" />
          <span className="text-sm font-semibold">Gas SaaS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <nav className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
          <PanelLeftIcon className="size-4" />
          <span>Gas SaaS v0.1</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
