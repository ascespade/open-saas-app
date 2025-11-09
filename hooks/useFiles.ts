'use client'

import { useState, useEffect } from 'react'
import type { File } from '@/types/database'
import { ALLOWED_FILE_TYPES } from '@/src/file-upload/validation'

export function useFiles() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      setFiles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const createUploadUrl = async (fileType: typeof ALLOWED_FILE_TYPES[number], fileName: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createUploadUrl',
          fileType,
          fileName,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to create upload URL')
      }
      return await response.json()
    } catch (err) {
      throw err
    }
  }

  const addFileToDb = async (s3Key: string, fileType: typeof ALLOWED_FILE_TYPES[number], fileName: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addToDb',
          s3Key,
          fileType,
          fileName,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to add file to database')
      }
      const newFile = await response.json()
      setFiles((prev) => [newFile, ...prev])
      return newFile
    } catch (err) {
      throw err
    }
  }

  const deleteFile = async (id: string) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete file')
      }
      setFiles((prev) => prev.filter((file) => file.id !== id))
    } catch (err) {
      throw err
    }
  }

  const getDownloadUrl = async (s3Key: string) => {
    try {
      const response = await fetch('/api/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key }),
      })
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }
      const { signedUrl } = await response.json()
      return signedUrl
    } catch (err) {
      throw err
    }
  }

  return {
    files,
    loading,
    error,
    createUploadUrl,
    addFileToDb,
    deleteFile,
    getDownloadUrl,
    refetch: fetchFiles,
  }
}
