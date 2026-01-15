'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '../ui/skeleton';

export function UserNav() {
  const { user, logout, isLoading } = useAuth();
  const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!user) return null;
  
  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
    
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={user.avatarUrl || avatarPlaceholder?.imageUrl} 
              alt={user.name} 
              data-ai-hint="person"
              width={36}
              height={36}
              />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
