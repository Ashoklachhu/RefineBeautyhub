'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { uploadFile } from '@/services/storage.service'

type Bucket = 'gallery' | 'services' | 'staff' | 'courses' | 'avatars'

export function useUpload(bucket: Bucket, userId: string) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress,    setProgress]    = useState(0)

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true)
      setProgress(10)

      const result = await uploadFile(bucket, file, userId)

      setProgress(100)
      setIsUploading(false)

      if (result.error) {
        toast.error(result.error.message)
        return null
      }

      toast.success('File uploaded successfully')
      return result.data.publicUrl
    },
    [bucket, userId]
  )

  return { upload, isUploading, progress }
}
