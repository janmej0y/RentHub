'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { UserNav } from './auth/UserNav';
import { useAuthContext } from '@/context/AuthContext';
import { Home, Menu } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-headline text-lg font-bold sm:inline-block">RentHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Find a Room
            </Link>
            {isAuthenticated && (
              <Link
                href="/recent"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Recent
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/my-wishlist"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                My Wishlist
              </Link>
            )}
            {isAuthenticated && (
                <Link
                    href="/my-bookings"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                    My Bookings
                </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/add-room"
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
                <Link
                  href="/admin/approvals"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Approvals
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/booking-requests"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Booking Requests
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {!isLoading && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[84%] max-w-sm">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Access all RentHub navigation links.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/">Find a Room</Link>
                    </Button>
                  </SheetClose>

                  {isAuthenticated && (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/recent">Recent</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/my-wishlist">My Wishlist</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/my-bookings">My Bookings</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/profile">Profile</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}

                  {isAuthenticated && user?.role === 'admin' && (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/admin/add-room">Add Room</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/my-rooms">My Rooms</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/admin/approvals">Approvals</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/admin/dashboard">Dashboard</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/admin/booking-requests">Booking Requests</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}

                  {!isAuthenticated && (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/login">Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}

          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : isAuthenticated ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/recent">Recent</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/my-wishlist">My Wishlist</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/my-bookings">My Bookings</Link>
              </Button>
              <UserNav />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
