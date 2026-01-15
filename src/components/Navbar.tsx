'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { UserNav } from './auth/UserNav';
import { useAuthContext } from '@/context/AuthContext';
import { Home } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <span className="font-bold sm:inline-block">RentHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Find a Room
            </Link>
            {isAuthenticated && ('admin') && (
              <>
                <Link
                  href="/add-room"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Add Room
                </Link>
                <Link
                  href="/my-rooms"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  My Rooms
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
