import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import crypto from 'crypto';
import { runwareAuth } from '../common/auth';
import { RunwareTextToImageInputSchema } from '../common/schemas';

export const generateImageFromText = createAction({
  name: 'generateImageFromText',
  displayName: 'Generate Image from Text',
  description: 'Produce images from a text description.',
  auth: runwareAuth,
  props: {
    positivePrompt: Property.LongText({
      displayName: 'Prompt',
      description: 'A detailed description of the image you want to generate.',
      required: true,
    }),
    negativePrompt: Property.LongText({
      displayName: 'Negative Prompt',
      description: 'Describe what you want to avoid in the image.',
      required: false,
    }),
    model: Property.ShortText({
      displayName: 'Model ID',
      description: 'The AIR identifier of the model to use for generation (e.g., "runware:101@1", "civitai:120096@135931").',
      required: true,
    }),
    height: Property.Number({
      displayName: 'Height',
      description: 'The height of the image in pixels. Must be divisible by 64.',
      required: true,
      defaultValue: 1024,
    }),
    width: Property.Number({
      displayName: 'Width',
      description: 'The width of the image in pixels. Must be divisible by 64.',
      required: true,
      defaultValue: 1024,
    }),
    steps: Property.Number({
      displayName: 'Steps',
      description: 'Number of iterations for the model. Higher values mean more detail but it will also increase the time it takes to generate the image.',
      required: false,
      defaultValue: 20,
    }),
    CFGScale: Property.Number({
      displayName: 'CFG Scale',
      description: 'How strictly the model follows your prompt. Higher values are stricter.',
      required: false,
      defaultValue: 7,
    }),
    scheduler: Property.ShortText({
      displayName: 'Scheduler',
      description: 'The algorithm used to guide the image generation process (e.g., "DPM++ 2M Karras").',
      required: false,
    }),
    seed: Property.Number({
      displayName: 'Seed',
      description: 'A number to control randomness. Using the same seed with the same settings will produce the same image.',
      required: false,
    }),
    vae: Property.ShortText({
      displayName: 'VAE',
      description: 'The AIR identifier for a specific VAE model to override the default.',
      required: false,
    }),
    clipSkip: Property.Number({
      displayName: 'Clip Skip',
      description: 'Controls which layer of the text encoder is used to interpret the prompt. Affects style and composition.',
      required: false,
    }),

  },
  async run(context) {
    const { auth, propsValue } = context;
    await propsValidation.validateZod(propsValue, RunwareTextToImageInputSchema);

    const requestBody: any = {
      taskType: 'imageInference',
      taskUUID: crypto.randomUUID(),
      positivePrompt: propsValue.positivePrompt,
      model: propsValue.model,
      width: propsValue.width,
      height: propsValue.height,
    }
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
    if (propsValue.seed) {
      requestBody.seed = propsValue.seed;
    }
    if (propsValue.vae) {
      requestBody.vae = propsValue.vae;
    }
    if (propsValue.clipSkip) {
      requestBody.clipSkip = propsValue.clipSkip;
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