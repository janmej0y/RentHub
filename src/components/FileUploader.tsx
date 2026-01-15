'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function FileUploader({ value, onValueChange }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setUploading(true);

      try {
        const uploadedUrls: string[] = [];

        for (const file of acceptedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${crypto
            .randomUUID()
            .slice(0, 8)}.${fileExt}`;

          const { error } = await supabase.storage
            .from('room-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw error;

          const { data } = supabase.storage
            .from('room-images')
            .getPublicUrl(fileName);

          uploadedUrls.push(data.publicUrl);
        }

        onValueChange([...value, ...uploadedUrls]);
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Image upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [value, onValueChange]
  );

  const removeImage = async (url: string) => {
    try {
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('room-images').remove([fileName]);
      }
    } catch (error) {
      console.error('Failed to remove image:', error);
    }

    onValueChange(value.filter(v => v !== url));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: uploading,
  });

  return (
    <div>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center transition-colors',
          isDragActive && 'border-primary bg-primary/10',
          uploading && 'cursor-not-allowed opacity-60'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="font-semibold">
          {uploading
            ? 'Uploading images...'
            : 'Drag & drop images here, or click to select'}
        </p>
        <p className="text-sm text-muted-foreground">
          Images are uploaded instantly
        </p>
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-video w-full overflow-hidden rounded-md bg-muted"
            >
              <Image
                src={url}
                alt={`Room image ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />

              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => removeImage(url)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
