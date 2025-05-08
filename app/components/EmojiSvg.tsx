import Image from 'next/image';
import { cn } from '@/lib/utils';

interface EmojiSvgProps {
  type?: string | null;
  className?: string;
}

const EmojiSvg = ({ type, className }: EmojiSvgProps) => {
  // We would normally use the actual emote image here.
  // For now we're just using a placeholder based on the type.
  
  // Placeholder SVG background colors for different styles
  const styleColors: Record<string, string> = {
    pixel: '#7C3AED',
    3: '#EC4899',
    cute: '#F59E0B',
    comic: '#10B981',
    anime: '#3B82F6',
    realistic: '#EF4444',
    default: '#6B7280',
  };
  
  const resolvedType = type?.toLowerCase() || 'default';
  const bgColor = styleColors[resolvedType] || styleColors.default;
  
  return (
    <div
      className={cn(
        "relative aspect-square rounded-md overflow-hidden flex items-center justify-center",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {/* This would be replaced with the actual emote SVG/image */}
      <Image 
        src="/placeholder-emote.png"
        alt={`${type || 'Default'} style emote`}
        width={200}
        height={200}
        className="object-contain p-4"
        priority
      />
    </div>
  );
};

export default EmojiSvg; 