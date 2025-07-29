
import React from 'react';
import { Mail, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Footer() {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/members', label: 'Members' },
    { href: '/magazines', label: 'Magazines' },
    { href: '/about', label: 'About' },
  ];

  return (
    <footer 
      className="border-t border-white/20 bg-black/10 backdrop-blur-lg"
    >
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative h-10 w-10">
                <Image 
                  src="/unityLogo.png" 
                  alt="Unity Valiyangadi Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-headline font-bold">Unity Valiyangadi</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A digital tapestry of our shared history, stories, and connections.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-center md:text-left">Quick Links</h4>
            <ul className="space-y-2 flex flex-col items-center md:items-start">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Social */}
          <div>
             <h4 className="font-semibold mb-4 text-center md:text-left">Connect</h4>
             <div className="flex flex-col items-center md:items-start space-y-4">
                 <a href="mailto:historian@unityvaliyangadi.family" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    <span>Contact Admin</span>
                 </a>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-black/10" asChild>
                         <a href="#" aria-label="Facebook">
                           <Facebook className="h-5 w-5" />
                        </a>
                    </Button>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-black/10" asChild>
                        <a href="#" aria-label="Instagram">
                           <Instagram className="h-5 w-5" />
                        </a>
                    </Button>
                </div>
             </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>Unity Valiyangadi © {new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
