'use client';

import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function FileUploader({ value, onValueChange }: FileUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(value || []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const fileUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      const newPreviews = [...previews, ...fileUrls];
      setPreviews(newPreviews);
      onValueChange(newPreviews);
    },
    [onValueChange, previews]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onValueChange(newPreviews);
    URL.revokeObjectURL(previews[index]);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'hover:bg-accent/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        {isDragActive ? (
          <p className="font-semibold">Drop the files here ...</p>
        ) : (
          <p className="font-semibold">Drag & drop some files here, or click to select files</p>
        )}
        <p className="text-sm text-muted-foreground">Upload at least one image of your room</p>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-video w-full overflow-hidden rounded-md">
              <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => removeImage(index)}
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
