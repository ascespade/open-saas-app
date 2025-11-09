'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useFiles } from '@/hooks/useFiles'
import type { File } from '@/types/database'
import { Download, Trash } from 'lucide-react'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Progress } from '@/src/components/ui/progress'
import { toast } from '@/src/hooks/use-toast'
import { cn } from '@/src/lib/utils'
import { uploadFileWithProgress, validateFile } from '@/src/file-upload/fileUploading'
import { ALLOWED_FILE_TYPES } from '@/src/file-upload/validation'

export default function FileUploadPage() {
  const { files, createUploadUrl, addFileToDb, deleteFile, getDownloadUrl, refetch } = useFiles()
  const [fileKeyForS3, setFileKeyForS3] = useState<string>('')
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0)
  const [fileToDelete, setFileToDelete] = useState<Pick<
    File,
    'id' | 's3_key' | 'name'
  > | null>(null)

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (fileKeyForS3.length > 0) {
      getDownloadUrl(fileKeyForS3)
        .then((url) => {
          if (url) {
            window.open(url, '_blank')
          }
        })
        .catch((error) => {
          console.error('Error fetching download URL', error)
          toast({
            title: 'Error fetching download link',
            description: 'Please try again later.',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setFileKeyForS3('')
        })
    }
  }, [fileKeyForS3, getDownloadUrl])

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const formElement = e.target
      if (!(formElement instanceof HTMLFormElement)) {
        throw new Error('Event target is not a form element')
      }

      const formData = new FormData(formElement)
      const formDataFileUpload = formData.get('file-upload')

      if (
        !formDataFileUpload ||
        !(formDataFileUpload instanceof File) ||
        formDataFileUpload.size === 0
      ) {
        toast({
          title: 'No file selected',
          description: 'Please select a file to upload.',
          variant: 'destructive',
        })
        return
      }

      const file = formDataFileUpload
      const fileType = file.type as typeof ALLOWED_FILE_TYPES[number]

      if (!validateFile(file)) {
        return
      }

      const { s3UploadUrl, s3UploadFields, s3Key } = await createUploadUrl(
        fileType,
        file.name
      )

      await uploadFileWithProgress({
        file,
        s3UploadUrl,
        s3UploadFields,
        onProgress: (percent) => {
          setUploadProgressPercent(percent)
        },
      })

      await addFileToDb(s3Key, fileType, file.name)

      toast({
        title: 'File uploaded successfully',
        description: 'Your file has been uploaded.',
      })

      setUploadProgressPercent(0)
      formElement.reset()
      refetch()
    } catch (error: unknown) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error uploading file',
        description:
          error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      })
      setUploadProgressPercent(0)
    }
  }

  const handleDelete = async () => {
    if (!fileToDelete) return

    try {
      await deleteFile(fileToDelete.id)
      toast({
        title: 'File deleted',
        description: 'Your file has been deleted.',
      })
      setFileToDelete(null)
      refetch()
    } catch (error: unknown) {
      console.error('Error deleting file:', error)
      toast({
        title: 'Error deleting file',
        description:
          error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="mt-10 px-6">
      <Card className="mb-4 lg:m-8">
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold leading-6">
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select a file</Label>
              <Input
                id="file-upload"
                name="file-upload"
                type="file"
                accept={ALLOWED_FILE_TYPES.join(',')}
                required
                disabled={uploadProgressPercent > 0 && uploadProgressPercent < 100}
              />
            </div>
            {uploadProgressPercent > 0 && uploadProgressPercent < 100 && (
              <div className="space-y-2">
                <Progress value={uploadProgressPercent} />
                <p className="text-sm text-muted-foreground">
                  Uploading... {Math.round(uploadProgressPercent)}%
                </p>
              </div>
            )}
            <Button
              type="submit"
              disabled={uploadProgressPercent > 0 && uploadProgressPercent < 100}
            >
              Upload
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-4 lg:m-8">
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold leading-6">
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {files.length === 0 ? (
            <p className="text-muted-foreground text-center">
              No files uploaded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setFileKeyForS3(file.s3_key)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setFileToDelete(file)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {fileToDelete?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFileToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
