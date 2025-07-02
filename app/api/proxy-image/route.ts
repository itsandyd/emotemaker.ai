import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable static optimization

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    
    // Add cache control headers to prevent Next.js from caching large files
    headers.set('Cache-Control', 'no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(arrayBuffer, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}