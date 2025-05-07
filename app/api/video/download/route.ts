import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Define size dimensions matching the emote sizes
const SIZE_DIMENSIONS = {
  'discord': 128,
  'twitch-small': 28,
  'twitch-medium': 56,
  'twitch-large': 112,
};

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    const start = request.nextUrl.searchParams.get('start') || '0'
    const end = request.nextUrl.searchParams.get('end') || null
    const size = request.nextUrl.searchParams.get('size') || null
    const filename = request.nextUrl.searchParams.get('filename') || 'emote'

    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 })
    }

    // For now, we're simply proxying the original video
    // In a real implementation with size parameter, you would use the fal.ai service 
    // or another video processing service to resize the video
    const response = await fetch(url)
    if (!response.ok) {
      return new NextResponse('Failed to fetch video', { status: response.status })
    }

    // Get the content type and other headers from the original response
    const headers = new Headers()
    response.headers.forEach((value, key) => {
      // Copy all headers except those that might interfere with the proxy
      if (!['content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })

    // Set content disposition to force download with a relevant filename
    let outputFilename = filename
    
    // Add size to filename if provided
    if (size && SIZE_DIMENSIONS[size as keyof typeof SIZE_DIMENSIONS]) {
      outputFilename += `_${size}`
    }
    
    // Add trim points if provided
    if (start !== '0' || end) {
      outputFilename += `_trim-${start}s${end ? `-${end}s` : ''}`
    }
    
    headers.set('Content-Disposition', `attachment; filename="${outputFilename}.mp4"`)
    
    // Ensure CORS headers are set
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    
    // Add a note in the response that we would resize here in production
    if (size && SIZE_DIMENSIONS[size as keyof typeof SIZE_DIMENSIONS]) {
      console.log(`In production, would resize video to ${SIZE_DIMENSIONS[size as keyof typeof SIZE_DIMENSIONS]}x${SIZE_DIMENSIONS[size as keyof typeof SIZE_DIMENSIONS]} pixels`)
      // For actual implementation, use fal.ai API as shown in the trim endpoint
      // or implement server-side ffmpeg processing
    }

    // Stream the response
    return new NextResponse(response.body, {
      headers,
      status: response.status,
    })
  } catch (error) {
    console.error('Error downloading video:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 