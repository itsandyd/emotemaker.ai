import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Photo prompt is required"
  }),
  amount: z.string().min(1),
  resolution: z.string().min(1),
  // imageUrl: z.string().min(1, {
  //   message: "Image is required",
  // }),
  // templates: z.string(),
});

export const amountOptions = [
  {
    value: "1",
    label: "1 Photo"
  },
  {
    value: "2",
    label: "2 Photos"
  },
  {
    value: "3",
    label: "3 Photos"
  },
  {
    value: "4",
    label: "4 Photos"
  },
//   {
//     value: "5",
//     label: "5 Photos"
//   }
];

export const resolutionOptions = [
  {
    value: "256x256",
    label: "256x256",
  },
  {
    value: "512x512",
    label: "512x512",
  },
  {
    value: "1024x1024",
    label: "1024x1024",
  },
];

export const templates = [
  {
    value: '1',
    label: 'Anime-Inspired Emote',
    prompt: 'Create an anime-style digital emote for a Twitch stream, focused on expressing ${prompt}. The emote should have clear, bold lines and vibrant colors, with a character showcasing exaggerated anime facial expressions for emotions like joy or shock. The background should be a simple, solid color to make the emote stand out even when scaled down.'
  },
  {
    value: '2',
    label: 'Pixel Art Emote',
    prompt: 'Design a pixel art emote for Twitch, encapsulating ${prompt}. The emote should be reminiscent of classic 8-bit or 16-bit video games, with a limited color palette and pixelated design. Emphasize the emotion through simple yet effective pixelated expressions, suitable for small scale visibility.'
  },
  {
    value: '3',
    label: 'Chibi Style Emote',
    prompt: 'Craft a chibi-style digital emote for a Twitch channel, focusing on the emotion of ${prompt}. The emote should feature a character with oversized head and eyes, and a small body, typical of chibi art. Use bright colors and simple, expressive features to convey emotions like enthusiasm or disappointment. Opt for a clean, solid color background'
  },
  // Add more templates as needed
];
