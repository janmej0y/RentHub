'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Mail, MapPin, Phone, Save, User2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { uploadProfilePhoto } from '@/lib/storageService';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

const PROFILE_PREFS_KEY = 'renthub-profile-prefs';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preferredCity, setPreferredCity] = useState('');
  const [budget, setBudget] = useState('');
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setCity(user.city || '');
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl || '');
    setAvatarFile(null);
    try {
      const raw = window.localStorage.getItem(PROFILE_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          preferredCity?: string;
          budget?: string;
          notifyBookings?: boolean;
          notifyPriceDrop?: boolean;
        };
        setPreferredCity(parsed.preferredCity || '');
        setBudget(parsed.budget || '');
        setNotifyBookings(parsed.notifyBookings ?? true);
        setNotifyPriceDrop(parsed.notifyPriceDrop ?? true);
      }
    } catch {
      setPreferredCity('');
      setBudget('');
      setNotifyBookings(true);
      setNotifyPriceDrop(true);
    }
  }, [user]);

  const userInitials = useMemo(() => {
    const base = name || user?.name || 'User';
    return base
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [name, user?.name]);

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (name.trim()) score += 25;
    if (phone.trim()) score += 20;
    if (city.trim()) score += 20;
    if (bio.trim()) score += 15;
    if (avatarUrl) score += 20;
    return score;
  }, [avatarUrl, bio, city, name, phone]);

  const profileChecklist = [
    { id: 'name', label: 'Add full name', done: Boolean(name.trim()) },
    { id: 'phone', label: 'Add phone number', done: Boolean(phone.trim()) },
    { id: 'city', label: 'Add city', done: Boolean(city.trim()) },
    { id: 'bio', label: 'Write short bio', done: Boolean(bio.trim()) },
    { id: 'avatar', label: 'Upload profile photo', done: Boolean(avatarUrl) },
  ];

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Please upload an image file only.',
      });
      return;
    }

    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      let nextAvatarUrl = avatarUrl;
      let nextAvatarPath = user.avatarPath || '';

      if (avatarFile) {
        const uploaded = await uploadProfilePhoto(user.id, avatarFile);
        nextAvatarUrl = uploaded.publicUrl;
        nextAvatarPath = uploaded.path;
      }

      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bio: bio.trim(),
        avatarUrl: nextAvatarUrl,
        avatarPath: nextAvatarPath,
      });
      window.localStorage.setItem(
        PROFILE_PREFS_KEY,
        JSON.stringify({
          preferredCity: preferredCity.trim(),
          budget: budget.trim(),
          notifyBookings,
          notifyPriceDrop,
        })
      );
      toast({
        title: 'Profile updated',
        description: 'Your profile changes have been saved.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save profile',
        description: error?.message || 'Something went wrong.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your profile details and account preferences.</p>
      </div>

      <Card className="mb-6 border-border/70 bg-card/90">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">Profile Completion</p>
            <Badge variant={profileCompletion >= 80 ? 'default' : 'secondary'}>{profileCompletion}%</Badge>
          </div>
          <Progress value={profileCompletion} />
          <p className="text-xs text-muted-foreground">
            Complete your profile to improve trust and get better recommendations.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Avatar className="h-28 w-28">
              <AvatarImage src={avatarUrl || avatarPlaceholder?.imageUrl} alt={name || user.name} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <Label htmlFor="avatar-upload">Upload Photo</Label>
              <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} />
            </div>

            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <User2 className="h-4 w-4" />
                <span>Role:</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <Label htmlFor="bio">About You</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Write a short bio..."
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/my-bookings">My Bookings</Link>
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/my-wishlist">My Wishlist</Link>
                </Button>
                {user.role === 'admin' && (
                  <Button type="button" variant="outline" asChild>
                    <Link href="/my-rooms">My Rooms</Link>
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Keep your phone updated for booking confirmations.
              </p>
              <p className="mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Your city helps us personalize property suggestions.
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Camera className="h-4 w-4" /> Your uploaded profile photo appears in the top-right account menu.
              </p>
            </div>

            <div className="mt-4 rounded-xl border bg-card/70 p-4">
              <h3 className="font-medium">Account Quick Actions</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Explore Properties</Link>
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/my-bookings">Track Booking Status</Link>
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/my-wishlist">Review Saved Homes</Link>
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-card/70 p-4">
              <h3 className="font-medium">Profile Checklist</h3>
              <div className="mt-3 space-y-2 text-sm">
                {profileChecklist.map(item => (
                  <p key={item.id} className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.done ? '✓' : '○'} {item.label}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-card/70 p-4">
              <h3 className="font-medium">Recommendation Preferences</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pref-city">Preferred City</Label>
                  <Input
                    id="pref-city"
                    value={preferredCity}
                    onChange={e => setPreferredCity(e.target.value)}
                    placeholder="e.g., Bengaluru"
                  />
                </div>
                <div>
                  <Label htmlFor="pref-budget">Monthly Budget (INR)</Label>
                  <Input
                    id="pref-budget"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g., 18000"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-card/70 p-4">
              <h3 className="font-medium">Notifications</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notify-booking"
                    checked={notifyBookings}
                    onCheckedChange={checked => setNotifyBookings(Boolean(checked))}
                  />
                  <Label htmlFor="notify-booking">Booking status updates</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="notify-price"
                    checked={notifyPriceDrop}
                    onCheckedChange={checked => setNotifyPriceDrop(Boolean(checked))}
                  />
                  <Label htmlFor="notify-price">Price drop alerts on saved homes</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
