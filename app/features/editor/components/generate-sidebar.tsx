import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Loader, Sparkle } from "lucide-react";
import { ActiveTool, generation, KonvaEditor } from "../types";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"; // Import Accordion components
import { generateThemedEmotePrompt } from "../utils";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";
import { SaveAll } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Emote } from "@prisma/client";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageIcon, FileVideo } from "lucide-react";

interface VideoModel {
  name: string;
  description: string;
  apiRoute: string;
  credits: number;
}

const videoGeneration = {
  models: [
    { 
      name: "Kling 1.6",
      description: "Professional model for creating high-quality, cinematic motion from still images.",
      apiRoute: "/api/models/fal/kling-video",
      credits: 10
    },
    { 
      name: "Kling 2",
      description: "Next generation video model with enhanced motion and quality",
      apiRoute: "/api/models/fal/kling-2",
      credits: 10
    },
    { 
      name: "Minimax",
      description: "Fast model optimized for creating smooth, natural motion from still images.",
      apiRoute: "/api/models/fal/minimax-video",
      credits: 10
    },
  ] satisfies VideoModel[]
};

const formSchema = z.object({
  prompt: z.string().min(2, { message: "Prompt must be at least 2 characters." }),
  model: z.string().default("IMAGE 1"),
  emoteType: z.string().default("chibi").optional(),
  // Image-specific options
  num_inference_steps: z.number().optional(),
  guidance_scale: z.number().optional(),
  num_images: z.number().optional(),
  quality: z.string().optional(),
  size: z.string().optional(),
  image_size: z.string().optional(),
  enable_safety_checker: z.boolean().optional(),
  // Video-specific options
  duration: z.string().default("5").optional(),
  ratio: z.string().default("16:9").optional(),
  // Common options
  image: z.string().optional()
});

type ImageFormValues = z.infer<typeof formSchema>;
type VideoFormValues = z.infer<typeof formSchema>;

interface EmoteGeneratorSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  editor: KonvaEditor | undefined;
  emotes: Emote[];
  addEmote: (newEmote: Emote) => void;
  currentPrompt: string;
  initialTab?: "images" | "videos";
}

interface GenerationResponse {
  imageUrl: string;
}

export const EmoteGeneratorSidebar = ({ 
  activeTool, 
  onChangeActiveTool, 
  editor, 
  emotes, 
  addEmote, 
  currentPrompt,
  initialTab = "images" 
}: EmoteGeneratorSidebarProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompts, setEnhancedPrompts] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedEmote, setSelectedEmote] = useState<Emote | null>(null);
  const [imageSource, setImageSource] = useState<"upload" | "emote" | null>(null);
  const [sourceImagePage, setSourceImagePage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState<"images" | "videos">("images");
  const [selectedModel, setSelectedModel] = useState(videoGeneration.models[0]);
  const ITEMS_PER_PAGE = 10;
  const { userId } = useAuth();
  const [isAddingToCanvas, setIsAddingToCanvas] = useState(false);

  // Set the initial tab after component mounts
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  const imageForm = useForm<ImageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: "IMAGE 1",
      emoteType: "chibi"
    }
  });

  const videoForm = useForm<VideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: "Kling 2",
      duration: "5",
      ratio: "16:9"
    },
    mode: "onChange"
  });

  const handleSelectEnhancedPrompt = (selectedPrompt: string) => {
    currentTab === "videos" 
      ? videoForm.setValue("prompt", selectedPrompt) 
      : imageForm.setValue("prompt", selectedPrompt);
  };

  const enhancePrompt = async () => {
    const currentPrompt = currentTab === "videos" ? videoForm.getValues("prompt") : imageForm.getValues("prompt");
    setIsEnhancing(true);
    try {
      const response = await axios.post('/api/models/enhance-prompt', { prompt: currentPrompt });
      if (response.data && Array.isArray(response.data.enhancedPrompts)) {
        setEnhancedPrompts(response.data.enhancedPrompts);
        toast.success('Prompt enhanced successfully!');
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Failed to enhance prompt. Using original prompt.');
        setEnhancedPrompts([currentPrompt]);
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error('Failed to enhance prompt. Please try again.');
      setEnhancedPrompts([currentPrompt]);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAddToCanvas = async (url: string) => {
    if (isAddingToCanvas) return;
    
    try {
      setIsAddingToCanvas(true);
      if (!editor) {
        toast.error('Editor not initialized');
        return;
      }
      editor.setActiveLayer('generated');
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      await editor.addGeneratedEmote(proxyUrl);
      toast.success('Added to canvas');
    } catch (error) {
      console.error('Error adding to canvas:', error);
      toast.error('Failed to add to canvas');
    } finally {
      setIsAddingToCanvas(false);
    }
  };

  const onSubmit = async (data: ImageFormValues | VideoFormValues) => {
    if (currentTab === "videos" && !selectedEmote) {
      toast.error('Please select a source image first');
      return;
    }
    
    if (currentTab === "videos" && !data.prompt) {
      toast.error('Please enter a motion description');
      return;
    }

    if (currentTab === "videos") {
      // Handle video generation
      if (!selectedEmote?.imageUrl && !uploadedImage) {
        toast.error('Please select or upload an image first');
        return;
      }

      setIsGenerating(true);
      try {
        const selectedModelData = videoGeneration.models.find(m => m.name === data.model);
        if (!selectedModelData) {
          throw new Error("Invalid model selected");
        }

        const response = await axios.post<{ video: { url: string }, emote: Emote }>(selectedModelData.apiRoute, {
          prompt: data.prompt,
          image_url: uploadedImage || selectedEmote?.imageUrl,
          duration: (data as VideoFormValues).duration,
          ratio: (data as VideoFormValues).ratio,
          prompt_optimizer: true
        });

        // Handle both array responses and single URL responses
        if (Array.isArray(response.data)) {
          setVideos(response.data);
        } else if (response.data?.video?.url) {
          setVideos([response.data.video.url]);
        } else if (typeof response.data === 'string') {
          setVideos([response.data]);
        } else {
          throw new Error("No video URL in response");
        }
        toast.success('Video generated successfully!');
      } catch (error: any) {
        console.error("Error generating video:", error);
        toast.error(error.response?.data || 'Failed to generate video. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Handle image generation
      setIsGenerating(true);
      try {
        const selectedModelData = generation.models.find(m => m.name === data.model);
        if (!selectedModelData) {
          throw new Error("Invalid model selected");
        }

        const response = await axios.post(selectedModelData.apiRoute, {
          prompt: data.prompt,
          emoteType: data.emoteType,
          prompt_optimizer: true
        });

        if (response.data) {
          // Handle both direct URL arrays and object arrays
          const urls = Array.isArray(response.data) 
            ? response.data.map(item => typeof item === 'string' ? item : item.imageUrl)
            : [response.data];
          setPhotos(urls.filter(Boolean));
          
          // Only try to add emotes if the response items are objects
          if (Array.isArray(response.data) && response.data[0] && typeof response.data[0] === 'object') {
            response.data.forEach(item => {
              if ('id' in item && 'prompt' in item) {
                addEmote(item as Emote);
              }
            });
          }
          
          toast.success('Images generated successfully!');
        } else {
          throw new Error("No images were generated");
        }
      } catch (error: any) {
        console.error("Error generating images:", error);
        toast.error(error.response?.data || 'Failed to generate images. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "emote-generator" ? "visible" : "hidden")}>
      <ToolSidebarHeader title="Generate" description="Generate images or videos" />
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "images" | "videos")} className="flex flex-col flex-1">
          <div className="p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
            <div className="p-4 pb-20">
              <TabsContent value="images" className="mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <Form {...imageForm}>
                  <form onSubmit={imageForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={imageForm.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A space invader" 
                              className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      onClick={enhancePrompt} 
                      disabled={isEnhancing || isGenerating} 
                      className="w-full"
                    >
                      {isEnhancing ? <Loader className="animate-spin" /> : "Enhance Prompt (1 Credit)"}
                    </Button>
                    {enhancedPrompts.length > 0 && (
                      <div className="mt-2">
                        <Select onValueChange={handleSelectEnhancedPrompt}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select enhanced prompt" />
                          </SelectTrigger>
                          <SelectContent>
                            {enhancedPrompts.map((prompt, index) => (
                              <SelectItem key={index} value={prompt}>
                                <div className="max-w-[250px] whitespace-normal break-words">
                                  {prompt}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="model">
                        <AccordionTrigger>Model</AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={imageForm.control}
                            name="model"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0">
                                      <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {generation.models.map((model) => (
                                        <SelectItem key={model.name} value={model.name}>
                                          {model.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="emoteType">
                        <AccordionTrigger>Emote Type</AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={imageForm.control}
                            name="emoteType"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select emote type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pixel">Pixel</SelectItem>
                                      <SelectItem value="kawaii">Kawaii</SelectItem>
                                      <SelectItem value="object">Object</SelectItem>
                                      <SelectItem value="cute-bold-line">Cute Bold Line</SelectItem>
                                      <SelectItem value="text-based">Text Based</SelectItem>
                                      <SelectItem value="3d-based">3D Based</SelectItem>
                                      <SelectItem value="pepe-based">Pepe Based</SelectItem>
                                      <SelectItem value="sticker-based">Sticker Based</SelectItem>
                                      <SelectItem value="chibi">Chibi</SelectItem>
                                      <SelectItem value="meme">Meme</SelectItem>
                                      <SelectItem value="ghibli">Ghibli</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <Button 
                      type="submit" 
                      disabled={isGenerating || isEnhancing} 
                      className="w-full"
                    >
                      {isGenerating ? <Loader className="animate-spin" /> : "Generate Emote (1 Credit)"}
                    </Button>
                  </form>
                </Form>
                {photos.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {photos.map((photo, index) => (
                        <div 
                          key={index} 
                          className="relative aspect-square rounded-lg overflow-hidden border group hover:opacity-90 transition cursor-pointer"
                          onClick={() => handleAddToCanvas(photo)}
                        >
                          <Image
                            src={`/api/proxy-image?url=${encodeURIComponent(photo)}`}
                            alt={`Generated emote ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-white font-medium">
                              {isAddingToCanvas ? (
                                <Loader className="h-5 w-5 animate-spin" />
                              ) : (
                                'Add to Canvas'
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <Form {...videoForm}>
                  <form onSubmit={videoForm.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                      <FormField
                        control={videoForm.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Image</FormLabel>
                            <div className="space-y-4">
                              {emotes.filter(emote => !emote.isVideo).length > 0 ? (
                                <>
                                  <div className="max-h-[40vh] min-h-[200px]">
                                    <ScrollArea className="border rounded-md h-[200px]">
                                      <div className="grid grid-cols-2 gap-2 p-2">
                                        {emotes
                                          .filter(emote => !emote.isVideo)
                                          .slice((sourceImagePage - 1) * ITEMS_PER_PAGE, sourceImagePage * ITEMS_PER_PAGE)
                                          .map((emote) => (
                                            <div
                                              key={emote.id}
                                              className={cn(
                                                "relative w-full h-[80px] cursor-pointer border rounded-sm overflow-hidden",
                                                selectedEmote?.id === emote.id && "ring-2 ring-primary"
                                              )}
                                              onClick={() => {
                                                setUploadedImage(null);
                                                setSelectedEmote(emote);
                                                setImageSource("emote");
                                                field.onChange(emote.imageUrl);
                                              }}
                                            >
                                              <img
                                                src={emote.imageUrl!}
                                                alt={emote.prompt || "Emote"}
                                                className="object-cover w-full h-full"
                                              />
                                            </div>
                                          ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSourceImagePage(Math.max(1, sourceImagePage - 1));
                                      }}
                                      disabled={sourceImagePage === 1}
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium">
                                      {sourceImagePage} / {Math.ceil(emotes.filter(emote => !emote.isVideo).length / ITEMS_PER_PAGE)}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSourceImagePage(Math.min(Math.ceil(emotes.filter(emote => !emote.isVideo).length / ITEMS_PER_PAGE), sourceImagePage + 1));
                                      }}
                                      disabled={sourceImagePage === Math.ceil(emotes.filter(emote => !emote.isVideo).length / ITEMS_PER_PAGE)}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <Button 
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setCurrentTab("images")}
                                >
                                  Generate an Image
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={videoForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedModel(videoGeneration.models.find(m => m.name === value) || videoGeneration.models[0]);
                                }} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0">
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
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={videoForm.control}
                        name="prompt"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className={cn(fieldState.error && "text-destructive")}>Motion Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how you want the image to move..."
                                className={cn(
                                  "px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0",
                                  fieldState.error && "border-destructive"
                                )}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        onClick={enhancePrompt} 
                        disabled={isEnhancing || isGenerating} 
                        className="w-full"
                      >
                        {isEnhancing ? <Loader className="animate-spin" /> : "Enhance Prompt (1 Credit)"}
                      </Button>

                      {enhancedPrompts.length > 0 && (
                        <div className="mt-2">
                          <Select onValueChange={handleSelectEnhancedPrompt}>
                            <SelectTrigger className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0">
                              <SelectValue placeholder="Select enhanced prompt" />
                            </SelectTrigger>
                            <SelectContent>
                              {enhancedPrompts.map((prompt, index) => (
                                <SelectItem key={index} value={prompt}>
                                  <div className="max-w-[250px] whitespace-normal break-words">
                                    {prompt}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Accordion type="single" collapsible>
                        <AccordionItem value="settings">
                          <AccordionTrigger>Settings</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <FormField
                              control={videoForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0">
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
                              control={videoForm.control}
                              name="ratio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Aspect Ratio</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-offset-0">
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
                      </Accordion>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isGenerating} 
                      className="w-full"
                    >
                      {isGenerating ? (
                        <Loader className="animate-spin" />
                      ) : (
                        `Generate Video (${videoGeneration.models.find(m => m.name === videoForm.watch("model"))?.credits || 10} Credits)`
                      )}
                    </Button>
                  </form>
                </Form>

                {videos.length > 0 && (
                  <div className="mt-4 space-y-4 pb-4">
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
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};

