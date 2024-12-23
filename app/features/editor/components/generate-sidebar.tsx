import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
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

const formSchema = z.object({
  prompt: z.string().min(2, { message: "Prompt must be at least 2 characters." }),
  amount: z.string().default("1"),
  resolution: z.string().default("512x512"),
  emoteType: z.string().default("chibi"),
  model: z.string().default("DALL-E 3"),
  image: z.string().optional(), // Add image field to the schema
});

interface EmoteGeneratorSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  editor: KonvaEditor | undefined;
  emotes: Emote[];
  addEmote: (newEmote: Emote) => void;
  currentPrompt: string;
}export const EmoteGeneratorSidebar = ({ activeTool, onChangeActiveTool, editor, emotes, addEmote, currentPrompt }: EmoteGeneratorSidebarProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompts, setEnhancedPrompts] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedEmote, setSelectedEmote] = useState<Emote | null>(null);
  const [imageSource, setImageSource] = useState<"upload" | "emote" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const { userId } = useAuth();
  const [selectedModel, setSelectedModel] = useState(generation.models[0]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      emoteType: "chibi",
      model: "DALL-E 3"
    }
  });

  // Add this check
  const paginatedEmotes = emotes ? emotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) : [];

  const totalPages = emotes ? Math.ceil(emotes.length / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    try {
      console.log("Submitting with emoteType:", data.emoteType);

      const selectedModel = generation.models.find(model => model.name === data.model);
      if (!selectedModel) {
        throw new Error("Selected model not found");
      }

      const response = await axios.post(selectedModel.apiRoute, {
        prompt: data.prompt,
        amount: parseInt(data.amount),
        resolution: data.resolution,
        emoteType: data.emoteType,
        image: uploadedImage || (selectedEmote ? selectedEmote.imageUrl : null),
      });

      let imageUrls: string[] = [];

      if (response.data.images && Array.isArray(response.data.images)) {
        imageUrls = response.data.images.map((image: any) => image.url);
      } else if (typeof response.data === 'string') {
        imageUrls = [response.data];
      } else {
        throw new Error("Unexpected response format");
      }

      setPhotos(imageUrls);

      // Automatically save each generated image
      for (const imageUrl of imageUrls) {
        await handleSave(imageUrl, data.prompt, userId || '', data.emoteType, data.model);
      }

      toast.success('Emotes generated and saved successfully!');
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error('Failed to generate or save emotes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (imageUrl: string, prompt: string, userId: string, emoteType: string, model: string) => {
    try {
      const saveResponse = await axios.post('/api/saveemote', {
        userId: userId,
        prompt,
        imageUrl,
        style: emoteType,  // This is the emote type
        model: model       // This is the selected model
      });
      console.log(saveResponse.data);
    } catch (error) {
      console.error('Failed to save emote:', error);
      throw error;
    }
  };

  const enhancePrompt = async () => {
    const currentPrompt = form.getValues("prompt");
    setIsEnhancing(true);
    try {
      const response = await axios.post('/api/models/enhance-prompt', { prompt: currentPrompt });
      console.log('API Response:', response.data);
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

  const handleSelectEnhancedPrompt = (selectedPrompt: string) => {
    form.setValue("prompt", selectedPrompt);
  };

  return (
    <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "emote-generator" ? "visible" : "hidden")}>
      <ToolSidebarHeader title="Generate Emotes" description="Generate emotes from a prompt" />
      <ScrollArea className="p-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A space invader" {...field} />
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
                    <SelectValue placeholder="Select enhanced prompt">
                      Select enhanced prompt
                    </SelectValue>
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
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              const newModel = generation.models.find(m => m.name === value);
                              if (newModel) setSelectedModel(newModel);
                            }} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
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
                    control={form.control}
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
              <AccordionItem value="amount">
                <AccordionTrigger>Number of Emotes</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select number of emotes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              {selectedModel.name.toLowerCase().includes("image to image") && (
                <AccordionItem value="imageSelection">
                  <AccordionTrigger>Select Image</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col space-y-4">
                      <Select onValueChange={(value: "upload" | "emote") => setImageSource(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose image source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upload">Upload New Image</SelectItem>
                          <SelectItem value="emote">Select Existing Emote</SelectItem>
                        </SelectContent>
                      </Select>

                      {imageSource === "upload" && (
                        <FormField
                          control={form.control}
                          name="image"
                          render={() => (
                            <FormItem>
                              <FormControl>
                                <FileUpload onChange={(url) => setUploadedImage(url ?? null)} endpoint="imageUploader" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      {imageSource === "emote" && (
                        <div>
                          <ScrollArea className="h-[200px]">
                            <div className="grid grid-cols-2 gap-2">
                              {paginatedEmotes.map((emote) => (
                                <div
                                  key={emote.id}
                                  className={`relative w-full pt-[100%] cursor-pointer border rounded-sm overflow-hidden ${
                                    selectedEmote?.id === emote.id ? 'ring-2 ring-primary' : ''
                                  }`}
                                  onClick={() => setSelectedEmote(emote)}
                                >
                                  <img
                                    src={emote.imageUrl!}
                                    alt={emote.prompt || emote.id}
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                          {totalPages > 0 && (
                            <div className="mt-2 flex justify-between items-center">
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
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
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
        <div className="mt-4 gap-4 grid grid-cols-2">
          {photos && photos.length > 0 && photos.map((url, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-[125px] h-[125px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border">
                <img src={url} alt={`Generated emote ${index}`} className="object-cover w-full h-full" />
                <button
                  onClick={() => {
                    editor?.addGeneratedEmote(url);
                    // You can add logic here to save the emote with the current prompt if needed
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition bg-black bg-opacity-50 flex items-center justify-center text-white"
                >
                  Add to Canvas
                </button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};

