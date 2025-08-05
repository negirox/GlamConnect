
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  BadgeCheck,
  Users,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth-actions';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/approvals', label: 'Portfolio Approvals', icon: BadgeCheck },
  { href: '/admin/users', label: 'User Management', icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="fixed top-16 h-[calc(100vh-4rem)] z-40">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminNavLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <form action={logout} className="p-2">
              <Button variant="ghost" className="w-full justify-start gap-2">
                  <LogOut />
                  <span>Logout</span>
              </Button>
          </form>
        </Sidebar>
        <main className="flex-1 ml-64 p-8 pt-24">
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
