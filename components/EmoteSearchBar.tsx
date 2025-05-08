import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface EmoteSearchBarProps {
  initialValue?: string;
  placeholder?: string;
}

const EmoteSearchBar = ({ 
  initialValue = "", 
  placeholder = "Search emotes..." 
}: EmoteSearchBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialValue || searchParams.get('search') || "");

  // Update search term when URL changes
  useEffect(() => {
    const currentSearch = searchParams.get('search') || "";
    if (currentSearch !== searchTerm) {
      setSearchTerm(currentSearch);
    }
  }, [searchParams, searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when search changes
    params.set('page', '1');
    
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-sm">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pr-10"
      />
      <Button 
        type="submit" 
        variant="ghost" 
        size="icon" 
        className="absolute right-0 top-0 h-full"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default EmoteSearchBar; 