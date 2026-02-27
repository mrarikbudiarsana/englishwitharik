import { NextRequest, NextResponse } from 'next/server'
import { cloudinary, listImages, deleteImage, BLOG_FOLDER } from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_MAX_FILE_SIZE_MB = 10
const SERVER_SAFE_MAX_FILE_SIZE_MB = 4

function getMaxFileSizeBytes() {
  const fromServerEnv = Number(process.env.ADMIN_MEDIA_MAX_FILE_SIZE_MB)
  const fromPublicEnv = Number(process.env.NEXT_PUBLIC_ADMIN_MEDIA_MAX_FILE_SIZE_MB)
  const maxMb = Number.isFinite(fromServerEnv) && fromServerEnv > 0
    ? fromServerEnv
    : Number.isFinite(fromPublicEnv) && fromPublicEnv > 0
      ? fromPublicEnv
      : DEFAULT_MAX_FILE_SIZE_MB
  return Math.round(Math.min(maxMb, SERVER_SAFE_MAX_FILE_SIZE_MB) * 1024 * 1024)
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles').select('role, is_admin').eq('id', user.id).single()
  return profile && (profile.role === 'admin' || profile.is_admin)
}

// GET - list media from Cloudinary
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const resources = await listImages(BLOG_FOLDER, 100)
  return NextResponse.json({ resources })
}

// POST - upload media
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const maxFileSizeBytes = getMaxFileSizeBytes()
    const formData = await req.formData()
    const files = formData.getAll('file').filter((item): item is File => item instanceof File)
    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const results = []

    for (const file of files) {
      if (file.size > maxFileSizeBytes) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds ${Math.round(maxFileSizeBytes / (1024 * 1024))}MB limit` },
          { status: 413 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const isVideoOrAudio = file.type.startsWith('video/') || file.type.startsWith('audio/')

      const result = await new Promise<Awaited<ReturnType<typeof cloudinary.uploader.upload>>>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: BLOG_FOLDER,
            resource_type: isVideoOrAudio ? 'video' : 'image',
            ...(isVideoOrAudio ? {} : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error('Upload failed'))
              return
            }
            resolve(uploaded)
          }
        )
        upload.end(buffer)
      })

      results.push(result)
    }

    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - remove media
export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { public_id, resource_type } = await req.json()
  await deleteImage(public_id, resource_type === 'video' || resource_type === 'raw' ? resource_type : 'image')
  return NextResponse.json({ success: true })
}
