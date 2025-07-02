import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 })
    }

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

    // Ensure CORS headers are set
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')

    // Stream the response
    return new NextResponse(response.body, {
      headers,
      status: response.status,
    })
  } catch (error) {
    console.error('Error proxying video:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 