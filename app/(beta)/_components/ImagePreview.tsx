interface ImagePreviewProps {
    image: string
  }
  
  export default function ImagePreview({ image }: ImagePreviewProps) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Image Preview</h3>
        <div className="border rounded-lg overflow-hidden">
          <img src={image} alt="Preview" className="max-w-full h-auto" />
        </div>
      </div>
    )
  }
  
  