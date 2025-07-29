
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"
import { Alegreya, Playfair_Display } from 'next/font/google';
import { getAuthState } from '@/lib/auth';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Unity Valiyangadi',
  description: 'Our family, our story.',
};

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['700'],
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authState = await getAuthState();
  
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          'h-full bg-background font-body text-foreground antialiased',
          'flex flex-col',
          alegreya.variable,
          playfair.variable
        )}
        suppressHydrationWarning
      >
        <AuthProvider initialAuthState={authState}>
         <Header />
         <main className="flex-1">
         {children}
         </main>
         <Footer />
         <Toaster />
         </AuthProvider>
      </body>
    </html>
  );
}
