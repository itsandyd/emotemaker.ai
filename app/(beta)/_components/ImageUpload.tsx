'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Upload } from 'lucide-react'
import { resizeImage } from '@/lib/beta/utils /imageProcessing'
import ImagePreview from './ImagePreview'


interface ImageUploadProps {
  setImage: (image: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export default function ImageUpload({ setImage }: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Unsupported file format. Please use JPG, PNG, or GIF.')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit.')
      return false
    }
    return true
  }

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    if (validateFile(file)) {
      try {
        const resizedImage = await resizeImage(file, 1024, 1024)
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            setPreview(e.target.result)
            setImage(e.target.result)
          }
        }
        reader.readAsDataURL(resizedImage)
      } catch (error) {
        console.error('Error resizing image:', error)
        setError('Error processing image. Please try again.')
      }
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    handleFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    multiple: false,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Drag & drop an image here, or click to select</p>
        <p className="text-xs text-gray-400 mt-1">
          Supported formats: JPG, PNG, GIF (max 5MB)
        </p>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          
        </Alert>
      )}
      {preview && <ImagePreview image={preview} />}
    </div>
  )
}

