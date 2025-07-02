import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EmoteFilterProps {
  onFilterChange?: (style: string) => void;
}

const EmoteFilter = ({ onFilterChange }: EmoteFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStyle = searchParams.get('style') || '';
  
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedStyle);
    }
  }, [selectedStyle, onFilterChange]);

  const styles = [
    { value: '', label: 'All Styles' },
    { value: 'pixel', label: 'Pixel' },
    { value: 'kawaii', label: 'Kawaii' },
    { value: 'cute', label: 'Cute' },
    { value: '3d', label: '3D' },
    { value: 'pepe', label: 'Pepe' },
    { value: 'chibi', label: 'Chibi' },
    { value: 'meme', label: 'Meme' }
  ];

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    
    // Update URL with the selected filter
    const params = new URLSearchParams(searchParams.toString());
    if (style) {
      params.set('style', style);
    } else {
      params.delete('style');
    }
    
    const page = params.get('page');
    if (page !== '1' && page !== null) {
      params.set('page', '1'); // Reset to page 1 when filter changes
    }
    
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">Filter by Style</h2>
      <div className="flex flex-wrap gap-2">
        {styles.map((style) => (
          <Button
            key={style.value}
            variant={selectedStyle === style.value ? "default" : "outline"}
            onClick={() => handleStyleChange(style.value)}
            className="rounded-full text-sm"
          >
            {style.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EmoteFilter; 