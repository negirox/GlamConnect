
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Loader2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSession, logout } from '@/lib/auth-actions';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/approvals', label: 'Portfolio Approvals', icon: BadgeCheck },
  { href: '/admin/gig-approvals', label: 'Gig Approvals', icon: Briefcase },
  { href: '/admin/users', label: 'User Management', icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession();
      if (!session.isLoggedIn || session.role !== 'admin') {
        router.push('/login');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar className="fixed top-0 h-screen z-40">
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
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
