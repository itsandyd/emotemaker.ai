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
      
      // APPROACH 1: Try using an FFmpeg command first
      console.log("ATTEMPT 1: Using FFmpeg command approach");
      
      // Construct a direct FFmpeg command with explicit trim parameters
      const input1 = {
        ffmpeg_commands: [
          "-ss", startTimeSeconds.toString(),
          "-i", videoUrl,
          "-t", durationSeconds.toString(),
          "-c:v", "libx264",
          "-preset", "medium",
          "-crf", "22",
          "-c:a", "aac",
          "-strict", "-2"
        ]
      };
      
      console.log("Command approach request:", JSON.stringify(input1, null, 2));
      
      let result: FalApiResponse | null = null;
      
      try {
        // Try the command approach first
        result = await fal.subscribe("fal-ai/ffmpeg-api", {
          input: input1,
          logs: true,
          onQueueUpdate: (update) => {
            console.log(`Command approach queue status: ${update.status}`);
            if (update.status === "IN_PROGRESS") {
              update.logs?.map(log => log.message).forEach(message => {
                console.log(`Command log: ${message}`);
              });
            }
          },
        }) as FalApiResponse;
        
        console.log("Command approach response:", JSON.stringify(result, null, 2));
      } catch (cmdError) {
        console.log("Command approach failed:", cmdError);
        // If command approach fails, continue to next approach
      }
      
      // APPROACH 2: If approach 1 failed or if we want to try the compose API anyway
      if (!result || !result.data?.video_url) {
        console.log("ATTEMPT 2: Using Compose API approach");
        
        // Ensure duration is at least 100ms to avoid API errors
        const minDurationMs = Math.max(durationMs, 100);
        
        // Structure the input according to the fal.ai/ffmpeg-api/compose documentation
        const input2 = {
          tracks: [
            {
              id: "video-track",
              type: "video",
              keyframes: [
                {
                  timestamp: 0,                 // Output timestamp at 0ms
                  duration: minDurationMs,      // Duration in output (ms)
                  url: videoUrl,                // Source video URL
                  trim_start: startTimeMs,      // Start time in source (ms)
                  trim_duration: minDurationMs  // Duration to extract (ms)
                }
              ]
            }
          ],
          // Explicitly set output settings with higher quality parameters
          output: {
            format: "mp4",
            video_codec: "h264",
            video_quality: "high",     // Set high quality
            audio_codec: "aac",
            maintain_aspect_ratio: true,
            scale: {                   // Preserve original dimensions
              width: -1,
              height: -1
            }
          }
        };
        
        console.log("Compose approach request:", JSON.stringify(input2, null, 2));
        
        try {
          result = await fal.subscribe("fal-ai/ffmpeg-api/compose", {
            input: input2,
            logs: true,
            onQueueUpdate: (update) => {
              console.log(`Compose approach queue status: ${update.status}`);
              if (update.status === "IN_PROGRESS") {
                update.logs?.map(log => log.message).forEach(message => {
                  console.log(`Compose log: ${message}`);
                });
              }
            },
          }) as FalApiResponse;
          
          console.log("Compose approach response:", JSON.stringify(result, null, 2));
        } catch (composeError) {
          console.log("Compose approach failed:", composeError);
          // Continue to next approach if this fails
        }
      }
      
      // APPROACH 3: Try using the dedicated trim endpoint as a last resort
      if (!result || !result.data?.video_url) {
        console.log("ATTEMPT 3: Using dedicated trim endpoint");
        
        // Use the dedicated trim endpoint which is simpler
        const input3 = {
          input_video: videoUrl,
          start_time: startTimeSeconds,
          end_time: endTimeSeconds
        };
        
        console.log("Trim endpoint request:", JSON.stringify(input3, null, 2));
        
        try {
          result = await fal.subscribe("fal-ai/ffmpeg-api/trim", {
            input: input3,
            logs: true,
            onQueueUpdate: (update) => {
              console.log(`Trim endpoint status: ${update.status}`);
              if (update.status === "IN_PROGRESS") {
                update.logs?.map(log => log.message).forEach(message => {
                  console.log(`Trim log: ${message}`);
                });
              }
            },
          }) as FalApiResponse;
          
          console.log("Trim endpoint response:", JSON.stringify(result, null, 2));
        } catch (trimError) {
          console.log("Trim endpoint failed:", trimError);
        }
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
          approach: result.requestId
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