
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Search,
  Sparkles,
  MessageSquare,
  User,
  LogOut,
  Briefcase,
  PlusCircle,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { useEffect, useState } from 'react';
import { getSession, logout } from '@/lib/auth-actions';

type NavLinkItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ('model' | 'brand' | 'guest' | 'admin')[];
};

const allNavLinks: NavLinkItem[] = [
  { href: '/search', label: 'Search', icon: Search, roles: ['model', 'brand', 'guest'] },
  { href: '/gigs', label: 'Gigs', icon: Briefcase, roles: ['model', 'brand', 'guest'] },
  { href: '/recommendations', label: 'AI Recs', icon: Sparkles, roles: ['brand'] },
  { href: '/messages', label: 'Messages', icon: MessageSquare, roles: ['model', 'brand'] },
  { href: '/account/profile', label: 'My Profile', icon: User, roles: ['model'] },
  { href: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['brand'] },
  { href: '/gigs/post', label: 'Post Gig', icon: PlusCircle, roles: ['brand'] },
  { href: '/admin/dashboard', label: 'Admin', icon: Shield, roles: ['admin'] },
];

export function Header() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [visibleLinks, setVisibleLinks] = useState<NavLinkItem[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);

      const currentRole = sessionData.isLoggedIn ? sessionData.role : 'guest';
      
      const filteredLinks = allNavLinks.filter(link => link.roles.includes(currentRole));
      
      // Special handling for brand profile link
      if (currentRole === 'brand') {
          const profileLink = { href: '/brand/profile', label: 'My Profile', icon: User, roles: ['brand'] };
          // Add profile link if not already on a brand page, to avoid redundancy
          if (!pathname.startsWith('/brand/')) {
              filteredLinks.push(profileLink);
          }
      }

      setVisibleLinks(filteredLinks);

    };
    fetchSession();
  }, [pathname]);


  const NavLink = ({ href, label, icon: Icon }: Omit<NavLinkItem, 'roles'>) => {
    const isActive = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
          isActive && 'text-foreground'
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {visibleLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
            {session?.isLoggedIn ? (
                 <form action={logout}>
                    <Button variant="ghost" type="submit">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </form>
            ) : (
                <>
                    <Button asChild variant="ghost">
                    <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild className="bg-secondary hover:bg-accent">
                    <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Logo />
                <nav className="flex flex-col gap-4">
                  {visibleLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
                <div className="border-t pt-4 flex flex-col gap-2">
                   {session?.isLoggedIn ? (
                         <form action={logout}>
                            <Button variant="ghost" type="submit" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </form>
                    ) : (
                        <>
                            <Button asChild variant="ghost">
                                <Link href="/login">Log In</Link>
                            </Button>
                            <Button asChild className="bg-secondary hover:bg-accent">
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
