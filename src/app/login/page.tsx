'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [isAdminLogin, setIsAdminLogin] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    const email = isAdminLogin ? 'admin@example.com' : 'user@example.com';
    const password = 'password'; // Replace with actual password logic
    login(email, password);
  };

  if (isLoading || isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to continue to RentHub</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={isAdminLogin ? 'sam.owner@example.com' : 'alex.renter@example.com'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required defaultValue="password" />
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                  <Label htmlFor="role-switch">User</Label>
                  <Switch
                    id="role-switch"
                    checked={isAdminLogin}
                    onCheckedChange={setIsAdminLogin}
                    aria-label="Switch between admin and user login"
                  />
                  <Label htmlFor="role-switch">Admin</Label>
              </div>
              <div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Sign in
                </Button>
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Not a member?{' '}
              <Link href="/signup" className="font-semibold leading-6 text-accent-foreground hover:underline">
                Sign up now
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
