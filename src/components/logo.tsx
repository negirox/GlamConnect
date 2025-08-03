import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo() {
  return (
    <Link
      href="/"
      className={cn(
        'text-2xl font-headline font-bold text-foreground hover:text-opacity-80 transition-opacity'
      )}
    >
      GlamConnect
    </Link>
  );
}
