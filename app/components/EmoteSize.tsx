interface EmoteSizeProps {
  size: string;
  label: string;
}

const EmoteSize = ({ size, label }: EmoteSizeProps) => {
  return (
    <div className="flex flex-col items-center bg-dark p-2 rounded">
      <div className="w-full h-12 flex items-center justify-center border border-dark-light rounded mb-1">
        <span className="text-xs text-muted">{size}</span>
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

export default EmoteSize; 