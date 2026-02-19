import { NextRequest, NextResponse } from 'next/server'
import { cloudinary, listImages, deleteImage, BLOG_FOLDER } from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase/server'

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

  const formData = await req.formData()
  const files = formData.getAll('file') as File[]
  const results = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
    const isVideoOrAudio = file.type.startsWith('video/') || file.type.startsWith('audio/')

    const result = await cloudinary.uploader.upload(base64, {
      folder: BLOG_FOLDER,
      resource_type: isVideoOrAudio ? 'video' : 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })
    results.push(result)
  }

  return NextResponse.json({ results })
}

// DELETE - remove media
export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { public_id, resource_type } = await req.json()
  await deleteImage(public_id, resource_type === 'video' || resource_type === 'raw' ? resource_type : 'image')
  return NextResponse.json({ success: true })
}
