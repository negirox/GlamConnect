
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

const navLinks = [
  { href: '/search', label: 'Search', icon: Search },
  { href: '/recommendations', label: 'AI Recs', icon: Sparkles },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/account/profile', label: 'Dashboard', icon: User },
];

export function Header() {
  const pathname = usePathname();

  const NavLink = ({ href, label, icon: Icon }: (typeof navLinks)[0]) => {
    const isActive = pathname.startsWith(href);
    return (
      <Link href={href} legacyBehavior passHref>
        <a
          className={cn(
            'flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
            isActive && 'text-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </a>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
           <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
           <Button asChild className="bg-secondary hover:bg-accent">
             <Link href="/signup">Sign Up</Link>
           </Button>
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
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
                <div className="border-t pt-4 flex flex-col gap-2">
                    <Button asChild variant="ghost">
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild className="bg-secondary hover:bg-accent">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
