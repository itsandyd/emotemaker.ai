import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { fal } from "@fal-ai/client";

export const maxDuration = 300;

// Configure fal client if FAL_KEY is set directly in code
// This is only needed if FAL_KEY environment variable is not set
const FAL_KEY = process.env.FAL_KEY || '';
if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY
  });
}

// Define response type interface based on fal.ai documentation
interface FalApiResponse {
  data: {
    video_url: string;
    thumbnail_url: string;
  };
  requestId: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { videoUrl, startTime, endTime } = await req.json();
    
    if (!videoUrl) {
      return new NextResponse("Missing video URL", { status: 400 });
    }
    
    if (startTime === undefined || endTime === undefined) {
      return new NextResponse("Missing trim parameters", { status: 400 });
    }

    if (!process.env.FAL_KEY && !FAL_KEY) {
      console.error("FAL_KEY is not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    try {
      // Ensure we're working with numeric values and convert to milliseconds
      const startTimeSeconds = Number(startTime);
      const endTimeSeconds = Number(endTime);
      const durationSeconds = endTimeSeconds - startTimeSeconds;
      
      // Convert to milliseconds for the API
      const startTimeMs = Math.round(startTimeSeconds * 1000);
      const durationMs = Math.round(durationSeconds * 1000);
      
      if (durationSeconds <= 0) {
        return new NextResponse("Invalid trim parameters: end time must be greater than start time", { status: 400 });
      }

      console.log("Preparing request to fal.ai FFmpeg API...");
      console.log(`Trim parameters: startTime=${startTimeSeconds}s (${startTimeMs}ms), duration=${durationSeconds}s (${durationMs}ms)`);
      
      // Use ONLY the working Compose API (other endpoints don't exist on fal.ai)
      console.log("🎬 VIDEO TRIM: Using fal-ai/ffmpeg-api/compose (only working endpoint)");
      
      // Ensure duration is at least 100ms to avoid API errors
      const minDurationMs = Math.max(durationMs, 100);
      
      console.log("🔧 TRIM PARAMETERS:", {
        sourceVideo: videoUrl,
        startTimeSeconds: startTimeSeconds,
        endTimeSeconds: endTimeSeconds,
        durationSeconds: durationSeconds,
        startTimeMs: startTimeMs,
        durationMs: minDurationMs,
        expectedOutputDuration: `${(minDurationMs/1000).toFixed(3)}s`
      });
      
      // Use Compose API with corrected trim parameters
      const input = {
        tracks: [
          {
            id: "video-track",
            type: "video", 
            keyframes: [
              {
                timestamp: 0,                    // Output timeline starts at 0
                duration: minDurationMs,         // How long the output should be (ms)
                url: videoUrl,                   // Source video URL
                trim_start: startTimeMs,         // Where to start in source video (ms)
                trim_duration: minDurationMs     // How much to take from source (ms)
              }
            ]
          }
        ],
        output: {
          format: "mp4",
          video_codec: "h264",
          audio_codec: "aac",
          // Add quality settings for better Vercel performance
          video_bitrate: "1500k",  // Lower bitrate for faster processing
          audio_bitrate: "128k"
        }
      };
      
      console.log("📤 Compose API request:", JSON.stringify(input, null, 2));
      
      let result: FalApiResponse | null = null;
      let successfulApproach = "";
      
      try {
        result = await fal.subscribe("fal-ai/ffmpeg-api/compose", {
          input: input,
          logs: true,
          onQueueUpdate: (update) => {
            console.log(`📺 Compose API status: ${update.status}`);
            if (update.status === "IN_PROGRESS") {
              update.logs?.map(log => log.message).forEach(message => {
                console.log(`🎬 Compose log: ${message}`);
                // Log important FFmpeg information
                if (message.includes("Duration:")) {
                  console.log(`⏱️ IMPORTANT: ${message}`);
                }
              });
            }
          },
        }) as FalApiResponse;
        
        console.log("📥 Compose API response:", JSON.stringify(result, null, 2));
        if (result?.data?.video_url) {
          successfulApproach = "compose-api";
          console.log("✅ Video trimming completed successfully");
        }
      } catch (composeError) {
        console.log("❌ Compose API failed:", composeError);
        
        // If Compose API fails, suggest alternative solutions
        return NextResponse.json({
          success: false,
          error: "Video trimming service unavailable",
          message: "The video trimming service is currently unavailable. Please try again later or contact support.",
          debug: {
            startTimeSeconds,
            endTimeSeconds,
            durationSeconds,
            error: composeError instanceof Error ? composeError.message : 'Unknown error'
          }
        }, { status: 503 });
      }
      
      if (!result || !result.data || !result.data.video_url) {
        console.error("No video URL in result:", result);
        return new NextResponse("Video processing failed: No URL returned", { status: 500 });
      }
      
      // Verify the result has a valid video URL that we can access
      try {
        const response = await fetch(result.data.video_url, { method: 'HEAD' });
        if (!response.ok) {
          console.error(`Video URL verification failed: ${response.status}`);
          return new NextResponse("Video processing completed but URL verification failed", { status: 500 });
        }
      } catch (verifyError) {
        console.error("Error verifying video URL:", verifyError);
        // Continue despite verification error - URL might still work
      }
      
      // Return the trimmed video URL
      return NextResponse.json({
        success: true,
        message: "Video trimmed successfully",
        videoUrl: result.data.video_url,
        thumbnailUrl: result.data.thumbnail_url,
        // Include the parameters that were used for debugging
        debug: {
          startTimeSeconds,
          endTimeSeconds,
          durationSeconds,
          startTimeMs,
          durationMs,
          requestId: result.requestId,
          approachUsed: successfulApproach,
          vercelOptimized: true,
          expectedDuration: `${(minDurationMs/1000).toFixed(3)}s`,
          trimParametersUsed: {
            trim_start: startTimeMs,
            trim_duration: minDurationMs,
            output_duration: minDurationMs
          }
        }
      });

    } catch (apiError: any) {
      console.error("Error calling fal.ai API:", apiError);
      // Include more detailed error information
      const errorDetails = apiError.body ? JSON.stringify(apiError.body) : 'Unknown error';
      const errorStatus = apiError.status || 500;
      return new NextResponse(`Video processing service error: ${errorDetails}`, { status: 502 });
    }
    
  } catch (error) {
    console.error("Error trimming video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 