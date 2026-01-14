'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { addRoom } from '@/lib/roomService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PropertyTypes, TenantPreferences } from '@/types/room';
import { FileUploader } from './FileUploader';
import { useState } from 'react';

const roomSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  location: z.string().min(3, 'Location is required.'),
  rent: z.coerce.number().int().positive('Rent must be a positive number.'),
  propertyType: z.enum(PropertyTypes),
  tenantPreference: z.enum(TenantPreferences),
  ownerContact: z.string().regex(/^\d{10}$/, 'Must be a valid 10-digit phone number.'),
  description: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required.'),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export function AddRoomForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      title: '',
      location: '',
      rent: 0,
      ownerContact: '',
      images: [],
    },
  });

  const onSubmit = async (data: RoomFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addRoom({ ...data, ownerId: user.id });
      toast({
        title: 'Success!',
        description: 'Your room has been listed successfully.',
      });
      router.push('/my-rooms');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'There was a problem with your request.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sunny 1BHK with Balcony" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mumbai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PropertyTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenantPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Tenants</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TenantPreferences.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="ownerContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="e.g., 9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Images</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isSubmitting ? 'Submitting...' : 'List My Room'}
        </Button>
      </form>
    </Form>
  );
}
