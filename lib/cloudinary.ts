import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export { cloudinary }

export const BLOG_FOLDER = 'englishwitharik/blog'

export type CloudinaryUploadResult = {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

/**
 * Upload a file buffer or URL to Cloudinary
 */
export async function uploadImage(
  source: string,
  options?: { folder?: string; public_id?: string }
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(source, {
    folder: options?.folder ?? BLOG_FOLDER,
    public_id: options?.public_id,
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })
  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

/**
 * List images in a folder
 */
export async function listImages(folder: string = BLOG_FOLDER, maxResults = 50) {
  const result = await cloudinary.search
    .expression(`folder:${folder}`)
    .sort_by('created_at', 'desc')
    .max_results(maxResults)
    .execute()
  return result.resources
}

/**
 * Build an optimized Cloudinary URL
 */
export function buildImageUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.width || options.height ? 'fill' : undefined,
        quality: options.quality ?? 'auto',
        fetch_format: 'auto',
      },
    ],
    secure: true,
  })
}
