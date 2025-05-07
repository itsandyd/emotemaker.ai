import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const SIZE_DIMENSIONS = {
  'full': null, // Original size
  'discord': 128,
  'twitch-small': 28,
  'twitch-medium': 56,
  'twitch-large': 112,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const size = searchParams.get('size') || 'full';
    const filename = searchParams.get('filename') || 'emote';
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Fetch the media
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch media: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    // Get the media data
    const originalBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Check if it's a video file (by content type or URL)
    const isVideo = contentType.startsWith('video/') || imageUrl.match(/\.(mp4|webm|mov)$/i);
    
    // Check if it's a GIF
    const isGif = contentType.includes('gif') || imageUrl.match(/\.gif$/i);
    
    // For videos, use our existing video download endpoint
    if (isVideo) {
      // For full size, just return the video without modification
      if (size === 'full') {
        return new NextResponse(originalBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}_${size}.mp4"`,
            'Cache-Control': 'no-cache',
          },
        });
      }
      
      // Get the base URL (required for redirects)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // For specific sizes, redirect to the video download endpoint with size parameter
      const videoDownloadUrl = `${baseUrl}/api/video/download?url=${encodeURIComponent(imageUrl)}&size=${size}&filename=${encodeURIComponent(filename)}`;
      
      return NextResponse.redirect(videoDownloadUrl);
    }
    
    // Handle Full Size option (no resizing)
    if (size === 'full') {
      return new NextResponse(originalBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}_${size}.${isGif ? 'gif' : 'png'}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }
    
    // Get the dimensions based on size
    const dimension = SIZE_DIMENSIONS[size as keyof typeof SIZE_DIMENSIONS];
    
    if (!dimension) {
      // Return original for unknown sizes
      return new NextResponse(originalBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}_${size}.${isGif ? 'gif' : 'png'}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }
    
    // Process GIFs
    if (isGif) {
      // For GIFs, use special handling to maintain animation
      try {
        const resizedGif = sharp(originalBuffer, { animated: true })
          .resize(dimension, dimension, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
        
        // Maintain GIF format
        const processedBuffer = await resizedGif.gif().toBuffer();
        
        return new NextResponse(processedBuffer, {
          headers: {
            'Content-Type': 'image/gif',
            'Content-Disposition': `attachment; filename="${filename}_${size}.gif"`,
            'Cache-Control': 'no-cache',
          },
        });
      } catch (error) {
        console.error('GIF processing error:', error);
        // Fallback to original if processing fails
        return new NextResponse(originalBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}_${size}.gif"`,
            'Cache-Control': 'no-cache',
          },
        });
      }
    } else {
      // For static images
      try {
        const resizedImage = sharp(originalBuffer)
          .resize(dimension, dimension, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
        
        // Convert to PNG with transparency
        const processedBuffer = await resizedImage.png().toBuffer();
        
        return new NextResponse(processedBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="${filename}_${size}.png"`,
            'Cache-Control': 'no-cache',
          },
        });
      } catch (error) {
        console.error('Image processing error:', error);
        // Fallback to original if processing fails
        return new NextResponse(originalBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}_${size}.png"`,
            'Cache-Control': 'no-cache',
          },
        });
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download emote' }, 
      { status: 500 }
    );
  }
} 