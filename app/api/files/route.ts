import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUploadFileSignedURLFromS3, checkFileExistsInS3 } from '@/src/file-upload/s3Utils'
import { ALLOWED_FILE_TYPES } from '@/src/file-upload/validation'
import { z } from 'zod'

const createFileInputSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string().min(1),
})

const addFileToDbInputSchema = z.object({
  s3Key: z.string(),
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(files || [])
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action

    if (action === 'createUploadUrl') {
      const { fileType, fileName } = createFileInputSchema.parse(body)

      const uploadData = await getUploadFileSignedURLFromS3({
        fileType,
        fileName,
        userId: authUser.id,
      })

      return NextResponse.json(uploadData)
    } else if (action === 'addToDb') {
      const { s3Key, fileType, fileName } = addFileToDbInputSchema.parse(body)

      const fileExists = await checkFileExistsInS3({ s3Key })
      if (!fileExists) {
        return NextResponse.json(
          { error: 'File not found in S3' },
          { status: 404 }
        )
      }

      const { data: file, error: fileError } = await supabase
        .from('files')
        .insert({
          user_id: authUser.id,
          name: fileName,
          type: fileType,
          s3_key: s3Key,
        })
        .select()
        .single()

      if (fileError) {
        return NextResponse.json({ error: fileError.message }, { status: 500 })
      }

      return NextResponse.json(file, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error handling file operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
