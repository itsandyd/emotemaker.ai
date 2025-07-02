import Link from 'next/link';
import Image from 'next/image';

interface SimilarEmote {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  style?: string | null;
}

interface SimilarEmotesProps {
  emotes: SimilarEmote[];
}

const SimilarEmotes = ({ emotes }: SimilarEmotesProps) => {
  if (!emotes || emotes.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Similar Emotes</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {emotes.map((emote) => (
          <Link 
            key={emote.id} 
            href={`/emote/${emote.id}`}
            className="bg-dark-lighter rounded-lg overflow-hidden transition hover:scale-105"
          >
            <div className="h-24 flex items-center justify-center bg-dark-light p-2">
              <Image
                src={emote.imageUrl || '/placeholder-emote.png'}
                alt={emote.name}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <div className="p-2">
              <h3 className="text-xs font-medium truncate">{emote.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted">{emote.style}</span>
                <span className="text-xs font-medium">${emote.price.toFixed(2)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarEmotes; 