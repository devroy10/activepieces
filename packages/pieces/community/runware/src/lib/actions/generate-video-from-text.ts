import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import crypto from 'crypto';
import { runwareAuth } from '../common/auth';
import { RunwareVideoInferenceSchema } from '../common/schemas';

export const generateVideoFromText = createAction({
  name: 'generateVideoFromText',
  displayName: 'Generate Video from Text',
  description: 'Generate video from a text prompt. This is an async task; use the returned Task UUID with a "Get Task Result" action to retrieve the video.',
  auth: runwareAuth,
  props: {
    outputType: Property.StaticDropdown({
      displayName: 'Output Type',
      description: 'The output type in which the video is returned. Currently, only URL delivery is supported',
      required: false,
      options: {
        options: [
          { label: "URL", value: "URL" },
        ]
      },
      defaultValue: 'URL',
    }),
    outputFormat: Property.StaticDropdown({
      displayName: 'Output Format',
      description: 'The format of the output video. Supported formats are: MP4 and WEBM',
      required: false,
      options: {
        options: [
          { label: "MPEG-4", value: "MP4" },
          { label: "WebM", value: "WEBM" },
        ]
      },
      defaultValue: 'MP4',
    }),
    outputQuality: Property.Number({
      displayName: 'Output Format',
      description: 'The compression quality of the output video. Higher values preserve more quality but increase file size, and vice versa.',
      required: false,
      defaultValue: 95,
    }),
    webhookURL: Property.ShortText({
      displayName: 'Webhook URL',
      description: 'A webhook URL where JSON responses will be sent via HTTP POST when generation tasks complete.',
      required: false,
    }),
    uploadEndpoint: Property.ShortText({
      displayName: 'Upload Endpoint',
      description: 'A URL where the generated content will be automatically uploaded. For secure uploads to cloud storage, use presigned URLs with temporary authentication credentials. e.g S3 buckets, Google Cloud Storage, or Azure Blob Storage',
      required: false,
    }),
    includeCost: Property.Checkbox({
      displayName: 'Include Cost',
      description: 'If set to true, the cost to perform the task will be included in the response object.',
      required: false,
      defaultValue: false,
    }),
    positivePrompt: Property.LongText({
      displayName: 'Positive Prompt',
      description: 'A detailed description of the what you want to see in the video, including subject matter, visual style, actions, and atmosphere.',
      required: true,
    }),
    negativePrompt: Property.LongText({
      displayName: 'Negative Prompt',
      description: 'Describe what you want to avoid in the video (e.g., "blurry, static, distorted").',
      required: false,
    }),
    width: Property.Number({
      displayName: 'Width',
      description: 'The width of the video in pixels. Must be a multiple of 8.',
      required: false,
    }),
    height: Property.Number({
      displayName: 'Height',
      description: 'The height of the video in pixels. Must be a multiple of 8.',
      required: false,
    }),
    model: Property.ShortText({
      displayName: 'Model ID',
      description: 'The AIR identifier of the video model to use (e.g., "klingai:5@3").',
      required: true,
    }),
    duration: Property.Number({
      displayName: 'Duration (seconds)',
      description: 'The length of the generated video in seconds. Min 1 and Max 10.',
      required: true,
    }),
    fps: Property.Number({
      displayName: 'FPS',
      description: 'Frames per second for the video. Higher values create smoother motion but require more processing time',
      required: false,
      defaultValue: 24,
    }),
    steps: Property.Number({
      displayName: 'Steps',
      description: 'Number of denoising steps. More steps typically result in higher quality but rquire longer time. Min 10 and Max 50',
      required: false,
    }),
    seed: Property.Number({
      displayName: 'Seed',
      description: 'A number to control randomness for reproducible results.',
      required: false,
    }),
    CFGScale: Property.Number({
      displayName: 'CFG Scale',
      description: 'Specifies how strictly the model follows your prompt. Higher values are stricter.',
      required: false,
    }),
    numberResults: Property.Number({
      displayName: 'Number Results',
      description: 'Specifies how many videos to generate for the given parameters. Min 1 and Maax 4',
      required: false,
      defaultValue: 1,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    await propsValidation.validateZod(propsValue, RunwareVideoInferenceSchema);

    const requestBody:any = {
      taskType: 'videoInference',
      taskUUID: crypto.randomUUID(),
      deliveryMethod: 'async',
      positivePrompt: propsValue.positivePrompt,
      model: propsValue.model,
      duration: propsValue.duration,
    };
    // optional request parameters
    if (propsValue.negativePrompt) {
      requestBody.negativePrompt = propsValue.negativePrompt;
    }
    if (propsValue.width) {
      requestBody.width = propsValue.width;
    }
    if (propsValue.height) {
      requestBody.height = propsValue.height;
    }
    if (propsValue.fps) {
      requestBody.fps = propsValue.fps;
    }
    if (propsValue.steps) {
      requestBody.steps = propsValue.steps;
    }
    if (propsValue.seed) {
      requestBody.seed = propsValue.seed;
    }
    if (propsValue.CFGScale) {
      requestBody.CFGScale = propsValue.CFGScale;
    }
    if (propsValue.numberResults) {
      requestBody.numberResults = propsValue.numberResults;
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
