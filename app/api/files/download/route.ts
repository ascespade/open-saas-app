import { NextRequest, NextResponse } from 'next/server'
import { getDownloadFileSignedURLFromS3 } from '@/src/file-upload/s3Utils'
import { z } from 'zod'

const getDownloadFileSignedURLInputSchema = z.object({
  s3Key: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { s3Key } = getDownloadFileSignedURLInputSchema.parse(body)

    const signedUrl = await getDownloadFileSignedURLFromS3({ s3Key })

    return NextResponse.json({ signedUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error getting download URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
