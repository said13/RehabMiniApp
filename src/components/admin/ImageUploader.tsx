import { useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseClasses = [
    'w-full h-40 flex items-center justify-center',
    'border-2 border-dashed border-neutral-700',
    'rounded-lg text-sm cursor-pointer overflow-hidden',
  ].join(' ');

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) {
        throw new Error('Missing Cloudinary configuration');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      }
    } catch (err) {
      console.error('Cloudinary upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      upload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={baseClasses}
    >
      {uploading ? (
        <span>Uploading...</span>
      ) : value ? (
        <img src={value} alt="cover" className="object-cover w-full h-full" />
      ) : (
        <span>Drag & drop or click to upload</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
