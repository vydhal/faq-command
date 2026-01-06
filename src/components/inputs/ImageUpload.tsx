import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  previewClassName?: string;
}

export function ImageUpload({ value, onChange, className, previewClassName }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/upload.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      // You might want to show a toast here
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!value ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
          <span>{isUploading ? 'Enviando...' : 'Clique para fazer upload da imagem'}</span>
        </Button>
      ) : (
        <div className={cn("relative aspect-video rounded-lg overflow-hidden border", previewClassName)}>
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
