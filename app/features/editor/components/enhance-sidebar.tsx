import { cn } from "@/lib/utils"
import { ActiveTool, Editor, enhancement, ModelOption, EnhancementModel, SelectOption, BooleanOption, NumberOption, StringOption } from "../types"
import { ToolSidebarHeader } from "./tool-sidebar-header"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import axios from "axios"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

// Add this type definition at the top of your file
type FalResponse = {
    image: {
        url: string;
    };
};

const formSchema = z.object({
  model: z.string().default(enhancement.models[0].name),
  upscaling_factor: z.string().default("4"),
  overlapping_tiles: z.string().default("true"),
  checkpoint: z.string().default("v2"),
  model_type: z.string().default("SD_1_5"),
  scale: z.number().min(1).max(4).default(2),
  creativity: z.number().min(0).max(1).default(0.5),
  detail: z.number().min(0).max(2).default(1),
  shape_preservation: z.number().min(0).max(1).default(0.25),
  // Clarity Upscaler specific options
  upscale_factor: z.number().min(1).max(4).default(2),
  resemblance: z.number().min(0).max(1).default(0.6),
  guidance_scale: z.number().min(1).max(20).default(4),
  num_inference_steps: z.number().min(1).max(50).default(18),
  prompt: z.string().default("masterpiece, best quality, highres"),
  negative_prompt: z.string().default("(worst quality, low quality, normal quality:2)"),
  // CCSR specific options
  tile_diffusion: z.enum(["none", "mix", "gaussian"]).default("none"),
  tile_diffusion_size: z.number().min(256).max(2048).default(1024),
  tile_diffusion_stride: z.number().min(128).max(1024).default(512),
  tile_vae: z.boolean().default(false),
  steps: z.number().min(1).max(100).default(50),
  color_fix_type: z.enum(["none", "wavelet", "adain"]).default("adain"),
  seed: z.number().min(-1).max(2147483647).default(-1),
});

interface EnhanceSidebarProps {
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
    editor: Editor | undefined;
}

// Update these type guard functions
function isSelectOption(option: ModelOption): option is Extract<ModelOption, { type: "select" }> {
    return option.type === "select";
}

function isNumberOption(option: ModelOption): option is Extract<ModelOption, { type: "number" }> {
    return option.type === "number";
}

function isBooleanOption(option: ModelOption): option is Extract<ModelOption, { type: "boolean" }> {
    return option.type === "boolean";
}

function isStringOption(option: ModelOption): option is Extract<ModelOption, { type: "string" }> {
    return option.type === "string";
}

export const EnhanceSidebar = ({ activeTool, onChangeActiveTool, editor }: EnhanceSidebarProps) => {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [selectedModel, setSelectedModel] = useState<EnhancementModel>(enhancement.models[0]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            model: enhancement.models[0].name,
            upscaling_factor: "4",
            overlapping_tiles: "true",
            checkpoint: "v2",
            model_type: "SD_1_5",
            scale: 2,
            creativity: 0.5,
            detail: 1,
            shape_preservation: 0.25,
            // Clarity Upscaler default values
            upscale_factor: 2,
            resemblance: 0.6,
            guidance_scale: 4,
            num_inference_steps: 18,
            prompt: "masterpiece, best quality, highres",
            negative_prompt: "(worst quality, low quality, normal quality:2)",
            // CCSR default values
            tile_diffusion: "none",
            tile_diffusion_size: 1024,
            tile_diffusion_stride: 512,
            tile_vae: false,
            steps: 50,
            color_fix_type: "adain",
            seed: -1,
        }
    });

    const onClose = () => {
        onChangeActiveTool("select")
    }

    const handleEnhance = async (data: z.infer<typeof formSchema>) => {
        if (!editor) return;

        setIsEnhancing(true);
        try {
            const selectedModel = enhancement.models.find(model => model.name === data.model);
            if (!selectedModel) {
                throw new Error("Selected model not found");
            }

            const imageUrl = editor.getActiveImageUrl();

            const filteredData = Object.fromEntries(
                Object.entries(data).filter(([key, value]) => 
                    value !== undefined && selectedModel.options.some(option => option.name === key)
                )
            );

            // Convert values to the correct types
            const preparedData = Object.fromEntries(
                Object.entries(filteredData).map(([key, value]) => {
                    if (key === 'upscaling_factor') return [key, parseInt(value as string)];
                    if (key === 'overlapping_tiles') return [key, value === 'true'];
                    return [key, value];
                })
            );

            console.log("Sending data to API:", { image_url: imageUrl, ...preparedData });

            const response = await axios.post(selectedModel.apiRoute, {
                image_url: imageUrl,
                ...preparedData,
            });

            if (response.data && response.data.image && response.data.image.url) {
                // Remove the current active object
                const activeObject = editor.getActiveObject();
                if (activeObject) {
                    activeObject.destroy();
                    editor.layer?.batchDraw();
                }

                // Add the enhanced image to the canvas
                await editor.addImage(response.data.image.url);
                toast.success('Image enhanced successfully!');
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error) {
            console.error('Error enhancing image:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response data:', error.response.data);
            }
            toast.error('Failed to enhance image. Please try again.');
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <aside className={cn("bg-white relative border-r z-[40] w-[300px] h-full flex flex-col", activeTool === "enhance" ? "visible" : "hidden")}>
            <ToolSidebarHeader title="Enhance Image" description="Improve your image using AI" />
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(handleEnhance)}>
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>AI Model</FormLabel>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                const newModel = enhancement.models.find(m => m.name === value);
                                                if (newModel) setSelectedModel(newModel);
                                            }} 
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select AI model" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {enhancement.models.map((model) => (
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
                                            {isSelectOption(option) ? (
                                                <Select 
                                                    onValueChange={field.onChange} 
                                                    defaultValue={String(field.value)}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={`Select ${option.name}`} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {option.values.map((value) => (
                                                            <SelectItem key={value} value={value}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : isBooleanOption(option) ? (
                                                <Select 
                                                    onValueChange={(value) => field.onChange(value === 'true')} 
                                                    defaultValue={String(field.value)}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={`Select ${option.name}`} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                        <SelectItem value="false">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : isNumberOption(option) ? (
                                                <Slider
                                                    min={option.min}
                                                    max={option.max}
                                                    step={option.step}
                                                    value={[field.value as number]}
                                                    onValueChange={(value) => field.onChange(value[0])}
                                                />
                                            ) : isStringOption(option) ? (
                                                <Input {...field} value={String(field.value)} />
                                            ) : null}
                                        </FormItem>
                                    )}
                                />
                            ))}
                            <Button 
                                type="submit"
                                disabled={isEnhancing} 
                                className="w-full"
                            >
                                {isEnhancing ? <Loader className="animate-spin mr-2" /> : null}
                                Enhance Image
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
            <ToolSidebarClose onClick={onClose} />
        </aside>
    )
}
