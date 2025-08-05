
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { PT_Sans, Playfair_Display } from 'next/font/google';
import { usePathname } from 'next/navigation';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair-display',
});

// export const metadata: Metadata = {
//   title: 'GlamConnect',
//   description: 'Connecting brands and models seamlessly.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>GlamConnect</title>
        <meta name="description" content="Connecting brands and models seamlessly." />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          ptSans.variable,
          playfairDisplay.variable
        )}
        suppressHydrationWarning
      >
        <div className="relative flex min-h-screen flex-col">
          {!isAdminPage && <Header />}
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
