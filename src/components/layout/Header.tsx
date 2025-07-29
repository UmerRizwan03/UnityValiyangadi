
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  UserPlus,
  LayoutDashboard,
  LogIn,
  UserRoundPlus,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { signOutAction } from '@/app/login/actions';
import Image from 'next/image';

// This component handles the active state styling for navigation links.
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  // We check for exact match on home, otherwise startsWith for nested routes
  const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        'text-foreground/80 hover:text-foreground',
        isActive && 'bg-black/10 font-semibold text-foreground'
      )}
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const { authState } = useAuth();
  const { user, isLoggedIn } = authState;

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/members', label: 'Members' },
    { href: '/magazines', label: 'Magazines' },
    { href: '/about', label: 'About' },
  ];

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
      <nav className="flex h-14 items-center gap-4 rounded-full border border-white/20 bg-white/30 px-4 py-2 shadow-2xl pointer-events-auto backdrop-blur-lg">
        {/* Logo */}
        <Link href="/" aria-label="Home">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Image
              src="/unityLogo.png"
              alt="Unity Valiyangadi Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </Button>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="secondary"
                >
                  Logout
                </Button>
              </form>
            ) : (
              <Button
                asChild
                variant="secondary"
              >
                <Link href="/login">Login / Sign Up</Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-foreground hover:bg-black/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isLoggedIn && (
                    <Link
                      href="/add-member"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Add Member
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </nav>
                <div className="absolute bottom-6 left-6 w-[calc(100%-3rem)]">
                  {isLoggedIn ? (
                    <form action={signOutAction} className="w-full">
                      <Button type="submit" variant="outline" className="w-full">
                        Logout
                      </Button>
                    </form>
                  ) : (
                    <div className="grid gap-2">
                      <Button asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}
