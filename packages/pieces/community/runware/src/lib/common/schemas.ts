import { z } from 'zod';

export const RunwareTextToImageInputSchema = {
    positivePrompt: z.string()
        .min(2, "Prompt must be at least 2 characters")
        .max(3000, "Prompt must not exceed 3000 characters")
        .describe("A detailed description of the image you want to generate"),

    negativePrompt: z.string()
        .min(2, "Negative prompt must be at least 2 characters")
        .max(3000, "Negative prompt must not exceed 3000 characters")
        .optional()
        .describe("Describe what you want to avoid in the image"),

    model: z.string()
        .min(1, "Model ID is required")
        .describe("The AIR identifier of the model to use for generation (e.g., 'runware:101@1', 'civitai:120096@135931')"),

    height: z.number()
        .min(128, "Height must be at least 128")
        .max(2048, "Height must not exceed 2048")
        .refine(val => val % 64 === 0, "Height must be divisible by 64")
        .default(1024)
        .describe("The height of the image in pixels. Must be divisible by 64"),

    width: z.number()
        .min(128, "Width must be at least 128")
        .max(2048, "Width must not exceed 2048")
        .refine(val => val % 64 === 0, "Width must be divisible by 64")
        .default(1024)
        .describe("The width of the image in pixels. Must be divisible by 64"),

    steps: z.number()
        .min(1, "Steps must be at least 1")
        .max(100, "Steps must not exceed 100")
        .default(20)
        .optional()
        .describe("Number of iterations for the model. Higher values mean more detail but increase generation time"),

    CFGScale: z.number()
        .min(0, "CFG Scale must be at least 0")
        .max(50, "CFG Scale must not exceed 50")
        .default(7)
        .optional()
        .describe("How strictly the model follows your prompt. Higher values are stricter"),

    scheduler: z.string()
        .min(1, "Scheduler must not be empty")
        .optional()
        .describe("The algorithm used to guide the image generation process (e.g., 'DPM++ 2M Karras')"),

    seed: z.number()
        .min(1, "Seed must be at least 1")
        .max(9223372036854776000, "Seed exceeds maximum value")
        .optional()
        .describe("A number to control randomness. Using the same seed with same settings produces the same image"),

    vae: z.string()
        .min(1, "VAE must not be empty")
        .optional()
        .describe("The AIR identifier for a specific VAE model to override the default"),

    clipSkip: z.number()
        .min(0, "Clip Skip must be at least 0")
        .max(2, "Clip Skip must not exceed 2")
        .optional()
        .describe("Controls which layer of the text encoder is used to interpret the prompt. Affects style and composition")
};

// Helper function to validate image input formats
const createImageInputValidator = () => {
    return z.string()
        .min(1, "Image input cannot be empty")
        .refine((value) => {
            // UUID v4 pattern
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            // Data URI pattern
            const dataUriPattern = /^data:image\/(png|jpg|jpeg|webp);base64,/i;

            // Base64 pattern (without data URI prefix)
            const base64Pattern = /^[A-Za-z0-9+/=]+$/;

            // URL pattern
            const urlPattern = /^https?:\/\/[^\s]+\.(png|jpg|jpeg|webp)(\?[^\s]*)?$/i;

            // Check if it matches any valid format
            return uuidPattern.test(value) ||
                dataUriPattern.test(value) ||
                base64Pattern.test(value) ||
                urlPattern.test(value);
        }, "Image must be a valid UUID v4, data URI, base64 string, or public URL");
};

export const RunwareImageToImageInputSchema = {
    seedImage: createImageInputValidator()
        .describe("The starting image for transformation. Can be a public URL, base64 string, or data URI"),

    strength: z.number()
        .min(0, "Strength must be at least 0")
        .max(1, "Strength must not exceed 1")
        .default(0.8)
        .describe("Determines influence of seed image. Lower preserves original more, higher allows more creative deviation"),

    positivePrompt: z.string()
        .min(2, "Prompt must be at least 2 characters")
        .max(3000, "Prompt must not exceed 3000 characters")
        .describe("A detailed description of the transformation you want to apply"),

    height: z.number()
        .min(128, "Height must be at least 128")
        .max(2048, "Height must not exceed 2048")
        .refine(val => val % 64 === 0, "Height must be divisible by 64")
        .default(1024)
        .describe("The height of the output image in pixels. Must be divisible by 64"),

    width: z.number()
        .min(128, "Width must be at least 128")
        .max(2048, "Width must not exceed 2048")
        .refine(val => val % 64 === 0, "Width must be divisible by 64")
        .default(1024)
        .describe("The width of the output image in pixels. Must be divisible by 64"),

    model: z.string()
        .min(1, "Model ID is required")
        .describe("The AIR identifier of the model to use (e.g., 'runware:101@1')"),

    steps: z.number()
        .min(1, "Steps must be at least 1")
        .max(100, "Steps must not exceed 100")
        .optional()
        .describe("Number of iterations for the model. Only a portion are used, depending on the strength"),

    negativePrompt: z.string()
        .min(2, "Negative prompt must be at least 2 characters")
        .max(3000, "Negative prompt must not exceed 3000 characters")
        .optional()
        .describe("Describe what you want to avoid in the transformed image"),

    CFGScale: z.number()
        .min(0, "CFG Scale must be at least 0")
        .max(50, "CFG Scale must not exceed 50")
        .optional()
        .describe("How strictly the model follows your prompt. Higher values are stricter"),

    scheduler: z.string()
        .min(1, "Scheduler must not be empty")
        .optional()
        .describe("The algorithm used to guide the image generation process (e.g., 'DDIM')")
};

// Helper RGBA color array validator
const rgbaValidator = z.array(z.number())
    .length(4, "RGBA array must contain exactly 4 values")
    .refine((values) => {
        // Check RGB values (0-255)
        const [r, g, b, a] = values;
        return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
    }, "RGB values must be between 0 and 255")
    .refine((values) => {
        // Check alpha value (0-1)
        const [, , , a] = values;
        return a >= 0 && a <= 1;
    }, "Alpha value must be between 0 and 1");

export const RunwareBgRemovalInputSchema = {
    inputImage: createImageInputValidator()
        .describe("The image to process. Can be a public URL, base64 string, or data URI"),

    model: z.enum([
        "runware:109@1",
        "runware:110@1",
        "runware:112@1",
        "runware:112@2",
        "runware:112@3",
        "runware:112@5",
        "runware:112@6",
        "runware:112@7",
        "runware:112@8",
        "runware:112@9",
        "runware:112@10"
    ])
        .default("runware:109@1")
        .describe("The AI model to use for background removal"),

    outputType: z.enum(["URL", "base64Data", "dataURI"])
        .default("URL")
        .describe("The type in which the image is returned"),

    outputFormat: z.enum(["PNG", "JPG", "WEBP"])
        .default("PNG")
        .describe("The format of the output image"),

    outputQuality: z.number()
        .min(20, "Output quality must be at least 20")
        .max(99, "Output quality must not exceed 99")
        .default(95)
        .describe("Compression quality of output image. Higher values preserve more quality"),

    uploadEndpoint: z.string()
        .url("Upload endpoint must be a valid URL")
        .optional()
        .describe("URL where the generated content will be automatically uploaded"),

    includeCost: z.boolean()
        .default(false)
        .describe("Include task cost in the response"),

    rgba: rgbaValidator
        .optional()
        .describe("Array of [red, green, blue, alpha] values for removed background color"),

    postProcessMask: z.boolean()
        .default(false)
        .describe("Whether the mask should undergo additional post-processing"),

    returnOnlyMask: z.boolean()
        .default(false)
        .describe("Whether to return only the mask (opposite of background removal)"),

    alphaMatting: z.boolean()
        .default(false)
        .describe("Enable alpha matting for edge refinement (RemBG 1.4 only)"),

    alphaMattingForegroundThreshold: z.number()
        .min(1, "Foreground threshold must be at least 1")
        .max(255, "Foreground threshold must not exceed 255")
        .default(240)
        .optional()
        .describe("Threshold to distinguish foreground from background (RemBG 1.4 only)"),

    alphaMattingBackgroundThreshold: z.number()
        .min(1, "Background threshold must be at least 1")
        .max(255, "Background threshold must not exceed 255")
        .default(10)
        .optional()
        .describe("Threshold to refine background areas (RemBG 1.4 only)"),

    alphaMattingErodeSize: z.number()
        .min(1, "Erode size must be at least 1")
        .max(255, "Erode size must not exceed 255")
        .default(10)
        .optional()
        .describe("Size of erosion operation to smooth edges (RemBG 1.4 only)")
};

export const RunwareVideoInferenceSchema = {
    outputType: z.enum(['URL']).optional().default('URL').describe('The output type in which the video is returned. Currently, only URL delivery is supported'),

    outputFormat: z
        .enum(['MP4', 'WEBM'])
        .optional()
        .default('MP4')
        .describe('The format of the output video. Supported formats are: MP4 and WEBM'),

    outputQuality: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .default(95)
        .describe('The compression quality of the output video. Higher values preserve more quality but increase file size, and vice versa'),

    webhookURL: z
        .string()
        .url()
        .optional()
        .describe('A webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete'),

    uploadEndpoint: z
        .string()
        .url()
        .optional()
        .describe('A URL where the generated content will be automatically uploaded. For secure uploads to cloud storage, use presigned URLs with temporary authentication credentials'),

    includeCost: z
        .boolean()
        .optional()
        .default(false)
        .describe('If set to true, the cost to perform the task will be included in the response object'),

    positivePrompt: z
        .string()
        .min(1)
        .describe('A detailed description of what you want to see in the video, including subject matter, visual style, actions, and atmosphere'),

    negativePrompt: z
        .string()
        .optional()
        .describe('Describe what you want to avoid in the video (e.g., "blurry, static, distorted")'),

    width: z
        .number()
        .multipleOf(8)
        .positive()
        .optional()
        .describe('The width of the video in pixels. Must be a multiple of 8'),

    height: z
        .number()
        .multipleOf(8)
        .positive()
        .optional()
        .describe('The height of the video in pixels. Must be a multiple of 8'),

    model: z
        .string()
        .min(1)
        .describe('The AIR identifier of the video model to use (e.g., "klingai:5@3")'),

    duration: z
        .number()
        .min(1)
        .max(10)
        .describe('The length of the generated video in seconds. Min 1 and Max 10'),

    fps: z
        .number()
        .positive()
        .optional()
        .default(24)
        .describe('Frames per second for the video. Higher values create smoother motion but require more processing time'),

    steps: z
        .number()
        .min(10)
        .max(50)
        .optional()
        .describe('Number of denoising steps. More steps typically result in higher quality but require longer time. Min 10 and Max 50'),

    seed: z
        .number()
        .optional()
        .describe('A number to control randomness for reproducible results'),

    CFGScale: z
        .number()
        .positive()
        .optional()
        .describe('Specifies how strictly the model follows your prompt. Higher values are stricter'),

    numberResults: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .default(1)
        .describe('Specifies how many videos to generate for the given parameters. Min 1 and Max 4')
};