# Video Trimming Functionality

This application implements video trimming using the [fal.ai FFmpeg API Compose](https://fal.ai/models/fal-ai/ffmpeg-api/compose) service through their official client library. This allows users to trim videos without requiring a self-hosted ffmpeg installation.

## Setup

1. Create an account at [fal.ai](https://fal.ai)
2. Get your API key from the dashboard
3. Add the API key to your environment variables:

```
FAL_KEY=your_api_key_here
```

4. Install the required dependency:

```bash
npm install --save @fal-ai/client
```

## How It Works

The implementation consists of two main parts:

### 1. Server-Side (API Endpoint)

The `app/api/video/trim/route.ts` file contains the API endpoint that:

- Receives video URL and trim parameters (start time and end time)
- Uses the @fal-ai/client library to call the fal.ai FFmpeg API Compose
- Returns the URL of the trimmed video

```typescript
// Example of how we use the fal.ai client
const input = {
  tracks: [
    {
      id: "video-track",
      type: "video",
      keyframes: [
        {
          timestamp: 0, // Output timestamp at 0
          duration: duration, // Duration in output
          url: videoUrl, // Source video URL
          trim_start: startTime, // Start time in source
          trim_duration: duration, // Duration to extract
        },
      ],
    },
  ],
};

const result = await fal.subscribe("fal-ai/ffmpeg-api/compose", {
  input,
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log("Processing in progress...");
    }
  },
});
```

### 2. Client-Side (Editor)

The `downloadTrimmedVideo` function in `use-editor.ts`:

- Gets the video and trim parameters from the selected node
- Calls our trim API endpoint
- Downloads the resulting trimmed video

## Limitations

- The fal.ai service has [pricing](https://fal.ai/pricing) based on compute time
- There are rate limits associated with the API that may affect high-volume usage
- Large videos may take longer to process

## Fallback Mechanism

If the API call fails or is not configured, the application will fall back to downloading the original video with the trim points saved in the filename.
