import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { ActiveTool, Editor, videoGeneration, VideoGenerationModel, VideoModelOption } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { Emote } from "@prisma/client";
import * as fal from "@fal-ai/serverless-client";
import { Slider } from "@/components/ui/slider";
import axios from "axios"; // Import axios
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Add this type definition at the top of your file
type FalVideoResponse = {
  video: {
    url: string;
  };
};

// Add this formSchema definition
const formSchema = z.object({
  model: z.string().default(videoGeneration.models[0].name),
  prompt: z.string().min(2, { message: "Prompt must be at least 2 characters." }),
  duration: z.string().default("5"),
  ratio: z.string().default("16:9"),
  seed: z.number().optional(),
});

// Add this near the top of your file, after imports
fal.config({
  proxyUrl: '/api/fal/proxy',
});

interface VideoGenerationSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  editor: Editor | undefined;
  emotes: Emote[];
  setCurrentPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const ITEMS_PER_PAGE = 6;

export const VideoGeneratorSidebar = ({ activeTool, onChangeActiveTool, editor, emotes, setCurrentPrompt }: VideoGenerationSidebarProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const { userId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmote, setSelectedEmote] = useState<Emote | null>(null);
  const [selectedModel, setSelectedModel] = useState<VideoGenerationModel>(videoGeneration.models[0]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: videoGeneration.models[0].name,
      prompt: "",
      duration: "5",
      ratio: "16:9",
      seed: -1,
    }
  });

  const totalPages = Math.ceil(emotes.length / ITEMS_PER_PAGE);
  const paginatedEmotes = emotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!editor && !selectedEmote) {
      toast.error('Please select an emote or use an image from the editor');
      return;
    }

    setIsGenerating(true);
    try {
      let imageUrl: string;
      if (selectedEmote) {
        imageUrl = selectedEmote.imageUrl!;
        console.log("Selected emote image URL:", imageUrl);
      } else {
        imageUrl = editor!.getActiveImageUrl();
        console.log("Active editor image URL:", imageUrl);
      }

      const response = await axios.post(selectedModel.apiRoute, {
        ...data,
        image_url: imageUrl,
      });

      if (response.data.video && response.data.video.url) {
        setGeneratedVideoUrl(response.data.video.url);
        toast.success('Video generated successfully!');
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
        toast.error(`Failed to generate video: ${error.response?.data || error.message}`);
      } else {
        toast.error('Failed to generate video. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "video-generator" ? "visible" : "hidden")}>
      <ToolSidebarHeader title="Generate Video" description="Generate video from an image" />
      <ScrollArea className="flex-grow">
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Select an emote:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {paginatedEmotes.map((emote) => (
                    <div
                      key={emote.id}
                      className={`relative w-full pt-[100%] cursor-pointer border rounded-sm overflow-hidden ${
                        selectedEmote?.id === emote.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedEmote(emote);
                        console.log("Emote selected, image URL:", emote.imageUrl);
                      }}
                    >
                      <img
                        src={emote.imageUrl!}
                        alt={emote.prompt || emote.id}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motion Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe how you want the image to move..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Generation Model</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const newModel = videoGeneration.models.find(m => m.name === value);
                        if (newModel) setSelectedModel(newModel);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select video generation model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {videoGeneration.models.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {selectedModel.options.map((option) => (
                <FormField
                  key={option.name}
                  control={form.control}
                  name={option.name as keyof z.infer<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{option.name}</FormLabel>
                      <FormControl>
                        {(() => {
                          if (option.type === "select") {
                            return (
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={String(field.value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${option.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {option.values.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }
                          
                          if (option.type === "number") {
                            return (
                              <Slider
                                min={option.min}
                                max={option.max}
                                step={option.step}
                                value={[field.value as number]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            );
                          }
                          
                          if (option.type === "string") {
                            return <Textarea {...field} />;
                          }
                          
                          if (option.type === "boolean") {
                            return (
                              <Select 
                                onValueChange={(value) => field.onChange(value === "true")} 
                                defaultValue={String(field.value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${option.name}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            );
                          }
                          
                          return null;
                        })()}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button 
                type="submit" 
                disabled={isGenerating} 
                className="w-full"
              >
                {isGenerating ? <Loader className="animate-spin" /> : "Generate Video"}
              </Button>
            </form>
          </Form>
          
          {generatedVideoUrl && (
            <div className="mt-4">
              <div className="relative aspect-video w-full bg-muted rounded-sm overflow-hidden">
                <video 
                  controls 
                  src={generatedVideoUrl} 
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
                <Button
                  onClick={async () => {
                    if (editor?.addVideo) {
                      try {
                        // Create and configure video element first
                        const videoElement = document.createElement('video');
                        videoElement.crossOrigin = 'anonymous';
                        videoElement.src = generatedVideoUrl;
                        videoElement.autoplay = false;
                        videoElement.muted = true;
                        videoElement.loop = true;
                        videoElement.playsInline = true;
                        
                        // Wait for video to load before adding to canvas
                        await new Promise((resolve) => {
                          videoElement.addEventListener('loadedmetadata', resolve);
                          videoElement.load();
                        });
                        
                        // Now add the video to canvas
                        await editor.addVideo(generatedVideoUrl);
                        toast.success('Video added to canvas');
                      } catch (error) {
                        console.error('Error adding video to canvas:', error);
                        toast.error('Failed to add video to canvas');
                      }
                    }
                  }}
                  className="absolute bottom-2 right-2"
                  size="sm"
                  variant="secondary"
                >
                  Add to Canvas
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
