import Image from 'next/image';

interface CoverCardProps {
  title: string;
  imageUrl: string;
  onClick?: () => void;
}

export function CoverCard({ title, imageUrl, onClick }: CoverCardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className="relative h-40 w-full overflow-hidden rounded-2xl text-left hover:scale-[1.02] transition-transform focus-visible:ring"
    >
      <Image src={imageUrl} alt={title} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium">
        {title}
      </div>
    </Component>
  );
}

