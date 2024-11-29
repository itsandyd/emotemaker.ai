import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import axios from "axios";
import { Loader } from "lucide-react";
import { ActiveTool, Editor, VideoGenerationModel, videoGeneration } from "../types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Emote } from "@prisma/client";

const formSchema = z.object({
  prompt: z.string().min(2, { message: "Prompt must be at least 2 characters." }),
  duration: z.string().default("5"),
  ratio: z.string().default("16:9"),
  model: z.string().default("Minimax"),
  image: z.string().optional(),
});

interface VideoGeneratorSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  editor: Editor | undefined;
  emotes: Emote[];
  setCurrentPrompt: (prompt: string) => void;
}

export const VideoGeneratorSidebar = ({ 
  activeTool, 
  onChangeActiveTool, 
  editor,
  emotes,
  setCurrentPrompt 
}: VideoGeneratorSidebarProps) => {
  const [videos, setVideos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedEmote, setSelectedEmote] = useState<Emote | null>(null);
  const [selectedModel, setSelectedModel] = useState<VideoGenerationModel>(videoGeneration.models[0]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      duration: "5",
      ratio: "16:9",
      model: "Minimax"
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedEmote?.imageUrl && !uploadedImage) {
      toast.error('Please select or upload an image first');
      return;
    }

    setIsGenerating(true);
    try {
      const apiEndpoint = data.model === "Minimax" 
        ? '/api/models/fal/minimax-video/image-to-video'
        : '/api/models/fal/runway-gen3-turbo-image-to-video';

      const response = await axios.post(apiEndpoint, {
        prompt: data.prompt,
        image_url: uploadedImage || selectedEmote?.imageUrl,
        duration: data.duration,
        ratio: data.ratio,
        prompt_optimizer: data.model === "Minimax" ? true : undefined
      });

      if (response.data?.video?.url) {
        setVideos([response.data.video.url]);
        setCurrentPrompt(data.prompt);
        toast.success('Video generated successfully!');
      } else {
        throw new Error("No video URL in response");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside className={cn(
      "bg-white relative border-r z-[40] w-[300px] h-full flex flex-col",
      activeTool === "video-generator" ? "visible" : "hidden"
    )}>
      <ToolSidebarHeader title="Generate Video" description="Generate videos from images" />
      <ScrollArea className="p-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
            <Accordion type="single" collapsible>
              <AccordionItem value="prompt">
                <AccordionTrigger>Motion Description</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder={
                            //   form.watch("model") === "Minimax" 
                                "Describe how you want the image to move..." 
                                // : "A stylish woman walks down a Tokyo street filled with warm glowing neon..."
                            }
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="model">
                <AccordionTrigger>Video Generation Model</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {videoGeneration.models.map((model) => (
                                <SelectItem key={model.name} value={model.name}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          {form.watch("model") === "Minimax" 
                            ? "Minimax model is optimized for creating smooth, natural motion from still images."
                            : "Runway Gen3 Turbo excels at creating cinematic motion with detailed control."
                          }
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="settings">
                <AccordionTrigger>Settings</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 seconds</SelectItem>
                            <SelectItem value="10">10 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aspect Ratio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select aspect ratio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16:9">16:9</SelectItem>
                            <SelectItem value="9:16">9:16</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="image">
                <AccordionTrigger>Source Image</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Select onValueChange={(value: "upload" | "emote") => {
                      setUploadedImage(null);
                      setSelectedEmote(null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose image source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upload">Upload New Image</SelectItem>
                        <SelectItem value="emote">Select Existing Emote</SelectItem>
                      </SelectContent>
                    </Select>

                    <FileUpload 
                      onChange={(url) => setUploadedImage(url ?? null)} 
                      endpoint="imageUploader" 
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {emotes.map((emote) => (
                        <div
                          key={emote.id}
                          className={cn(
                            "relative w-full pt-[100%] cursor-pointer border rounded-sm overflow-hidden",
                            selectedEmote?.id === emote.id && "ring-2 ring-primary"
                          )}
                          onClick={() => setSelectedEmote(emote)}
                        >
                          <img
                            src={emote.imageUrl!}
                            alt={emote.prompt || "Emote"}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button 
              type="submit" 
              disabled={isGenerating} 
              className="w-full"
            >
              {isGenerating ? (
                <Loader className="animate-spin" />
              ) : (
                `Generate Video (${form.watch("model") === "Minimax" ? "5" : "10"} Credits)`
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 space-y-4">
          {videos.map((url, index) => (
            <div key={index} className="relative aspect-video w-full bg-muted rounded-sm overflow-hidden">
              <video
                src={url}
                controls
                className="w-full h-full"
              />
              <Button
                onClick={() => editor?.addVideo(url)}
                className="absolute bottom-2 right-2"
                size="sm"
              >
                Add to Canvas
                
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
}; 