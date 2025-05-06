import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    const start = request.nextUrl.searchParams.get('start') || '0'
    const end = request.nextUrl.searchParams.get('end') || null

    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 })
    }

    // For now, we're simply proxying the original video
    // In a real implementation, you would use ffmpeg or similar to actually trim the video
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

    // Set content disposition to force download with a filename that includes trim points
    const filename = `trimmed-video-${start}s-${end}s.mp4`
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    
    // Ensure CORS headers are set
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')

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