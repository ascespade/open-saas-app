import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteFileFromS3 } from '@/src/file-upload/s3Utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', authUser.id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', params.id)
      .eq('user_id', authUser.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Delete from S3
    try {
      await deleteFileFromS3({ s3Key: file.s3_key })
    } catch (s3Error) {
      console.error(
        `S3 deletion failed. Orphaned file s3Key: ${file.s3_key}`,
        s3Error
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
