'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuthContext } from '@/context/AuthContext';
import { addRoom } from '@/lib/roomService';
import { useToast } from '@/hooks/use-toast';
import { PropertyTypes, TenantPreferences } from '@/types/room';
import { FileUploader } from './FileUploader';

/**
 * Validation schema
 */
const roomSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  location: z.string().min(3, 'Location is required'),
  rent: z.coerce.number().positive('Rent must be positive'),
  propertyType: z.enum(PropertyTypes),
  tenantPreference: z.enum(TenantPreferences),
  contactNumber: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit number'),
  imageUrls: z.array(z.string()).min(1, 'At least one image is required'),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export function AddRoomForm() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      title: '',
      location: '',
      rent: 0,
      contactNumber: '',
      imageUrls: [],
    },
  });

  const onSubmit = async (values: RoomFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please login to add a room.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addRoom({
        title: values.title,
        location: values.location,
        rent: values.rent,
        propertyType: values.propertyType,
        tenantPreference: values.tenantPreference,
        contactNumber: values.contactNumber,
        imageUrls: values.imageUrls,
      });

      toast({
        title: 'Room listed successfully 🎉',
        description: 'Your room is now visible to users.',
      });

      router.push('/my-rooms');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add room',
        description: error?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Title</FormLabel>
              <FormControl>
                <Input placeholder="Sunny 1BHK with balcony" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location & Rent */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
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
                <FormLabel>Monthly Rent (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Property Type & Tenant Preference */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PropertyTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
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
                <FormLabel>Tenant Preference</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TenantPreferences.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact */}
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <FormField
          control={form.control}
          name="imageUrls"
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

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Listing Room...' : 'List My Room'}
        </Button>
      </form>
    </Form>
  );
}
