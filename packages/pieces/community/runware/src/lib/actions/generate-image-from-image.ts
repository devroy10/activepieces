import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import crypto from 'crypto';
import { runwareAuth } from '../common/auth';
import { RunwareImageToImageInputSchema } from '../common/schemas';

export const generateImageFromImage = createAction({
  name: 'generateImageFromExistingImage',
  displayName: 'Generate Images from Existing Image',
  description: 'Generate new images based on a provided image (image-to-image).',
  auth: runwareAuth,
  props: {
    seedImage: Property.LongText({
      displayName: 'Seed Image',
      description: 'The starting image for the transformation. Can be a public URL, a base64 encoded string, or a data URI.',
      required: true,
    }),
    strength: Property.Number({
      displayName: 'Strength',
      description: 'Determines the influence of the seed image. A lower value preserves the original more, while a higher value allows more creative deviation. Must be between 0 and 1.',
      required: true,
      defaultValue: 0.8,
    }),
    positivePrompt: Property.LongText({
      displayName: 'Prompt',
      description: 'A detailed description of the transformation you want to apply.',
      required: true,
    }),
    height: Property.Number({
      displayName: 'Height',
      description: 'The height of the output image in pixels. Must be divisible by 64 eg: 128...512, 576, 640...2048..',
      required: true,
      defaultValue: 1024,
    }),
    width: Property.Number({
      displayName: 'Width',
      description: 'The width of the output image in pixels. Must be divisible by 64. eg: 128...512, 576, 640...2048.',
      required: true,
      defaultValue: 1024,
    }),
    model: Property.ShortText({
      displayName: 'Model ID',
      description: 'The AIR identifier of the model to use for generation (e.g., "runware:101@1").',
      required: true,
    }),
    steps: Property.Number({
      displayName: 'Steps',
      description: 'Number of iterations for the model. Only a portion are used, depending on the strength.',
      required: false,
    }),
    // confirm this prop is supported here
    negativePrompt: Property.LongText({
      displayName: 'Negative Prompt',
      description: 'Describe what you want to avoid in the transformed image.',
      required: false,
    }),
    CFGScale: Property.Number({
      displayName: 'CFG Scale',
      description: 'How strictly the model follows your prompt. Higher values are stricter.',
      required: false,
    }),
    scheduler: Property.ShortText({
      displayName: 'Scheduler',
      description: 'The algorithm used to guide the image generation process (e.g., "DDIM").',
      required: false,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    await propsValidation.validateZod(propsValue, RunwareImageToImageInputSchema);

    const requestBody: any = {
      taskType: 'imageInference',
      taskUUID: crypto.randomUUID(),
      seedImage: propsValue.seedImage,
      strength: propsValue.strength,
      positivePrompt: propsValue.positivePrompt,
      model: propsValue.model,
      width: propsValue.width,
      height: propsValue.height,
    };
    // optional request parameters
    if (propsValue.negativePrompt) {
      requestBody.negativePrompt = propsValue.negativePrompt;
    }
    if (propsValue.steps) {
      requestBody.steps = propsValue.steps;
    }
    if (propsValue.CFGScale) {
      requestBody.CFGScale = propsValue.CFGScale;
    }
    if (propsValue.scheduler) {
      requestBody.scheduler = propsValue.scheduler;
    }

    const response = await httpClient.sendRequest<{
      data: unknown[];
    }>({
      url: 'https://api.runware.ai/v1',
      method: HttpMethod.POST,
      body: [requestBody],
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`,
      },
    });

    return response.body.data;
  },
});