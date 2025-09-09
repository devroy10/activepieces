import { httpClient, HttpMethod, propsValidation } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import crypto from 'crypto';
import { runwareAuth } from '../common/auth';
import { RunwareBgRemovalInputSchema } from '../common/schemas';

export const removeImageBackground = createAction({
  name: 'removeImageBackground',
  displayName: 'Image Background Removal',
  description: 'Remove the background from an image',
  auth: runwareAuth,
  props: {
    inputImage: Property.LongText({
      displayName: 'Input Image',
      description: 'The image to process. Can be a public URL, a base64 encoded string, or a data URI.',
      required: true,
    }),
    model: Property.StaticDropdown({
      displayName: 'Model',
      description: 'The AI model to use for background removal.',
      required: true,
      options: {
        options: [
          { label: "RemBG 1.4", value: "runware:109@1" },
          { label: "Bria RMBG 2.0", value: "runware:110@1" },
          { label: "BiRefNet v1 Base", value: "runware:112@1" },
          { label: "BiRefNet v1 Base - COD", value: "runware:112@2" },
          { label: "BiRefNet Dis", value: "runware:112@3" },
          { label: "BiRefNet General", value: "runware:112@5" },
          { label: "BiRefNet General Resolution 512x512 FP16", value: "runware:112@6" },
          { label: "BiRefNet HRSOD DHU", value: "runware:112@7" },
          { label: "BiRefNet Massive TR DIS5K TR TES", value: "runware:112@8" },
          { label: "BiRefNet Matting", value: "runware:112@9" },
          { label: "BiRefNet Portrait", value: "runware:112@10" },
        ]
      },
      defaultValue: 'runware:109@1',
    }),
    outputType: Property.StaticDropdown({
      displayName: 'Output Type',
      description: ' The type in which the image is returned. Supported values are: dataURI, URL, and base64Data.',
      required: false,
      options: {
        options: [
            { "label": "URL", "value": "URL" },
            { "label": "Base64 Data", "value": "base64Data" },
            { "label": "Data URI", "value": "dataURI" }
          ]
      },
      defaultValue: 'URL',
    }),
    outputFormat: Property.StaticDropdown({
      displayName: 'Output Format',
      description: 'The format of the output image.',
      required: false,
      options: {
        options: [
          { label: 'PNG', value: 'PNG' },
          { label: 'JPG', value: 'JPG' },
          { label: 'WEBP', value: 'WEBP' },
        ]
      },
      defaultValue: 'PNG',
    }),
    outputQuality: Property.Number({
      displayName: 'Output Format',
      description: 'The compression quality of the output image. Higher values preserve more quality but increase file size, and vice versa.',
      required: false,
      defaultValue: 95,
    }),
    uploadEndpoint: Property.ShortText({
      displayName: 'Upload Endpoint',
      description: ' A URL where the generated content will be automatically uploaded. For secure uploads to cloud storage, use presigned URLs with temporary authentication credentials. e.g S3 buckets, Google Cloud Storage, or Azure Blob Storage',
      required: false,
    }),
    includeCost: Property.Checkbox({
      displayName: 'Include Cost',
      description: 'If set to true, the cost to perform the task will be included in the response object.',
      required: false,
      defaultValue: false,
    }),
    rgba: Property.Array({
      displayName: 'Rgba',
      description: 'An array representing the [red, green, blue, alpha] values that define the color of the removed background. The alpha channel controls transparency. e.g 255, 255, 255,0',
      required: false,      
    }),
    postProcessMask: Property.Checkbox({
      displayName: 'Post Process Mask',
      description: 'Controls whether the mask should undergo additional post-processing.',
      required: false,
      defaultValue: false,
    }),
    returnOnlyMask: Property.Checkbox({
      displayName: 'Return Only Mask',
      description: ' Specify whether to return only the mask. Note: The mask is the opposite of the image background removal.',
      required: false,
      defaultValue: false,
    }),
    alphaMatting: Property.Checkbox({
      displayName: 'Alpha Matting',
      description: 'Refine the edges of the foreground object for higher quality. Only supported by the RemBG 1.4 model.',
      required: false,
      defaultValue: false,
    }),
    alphaMattingForegroundThreshold: Property.Number({
      displayName: 'Alpha Matting Foreground Threshold',
      description: 'Threshold to distinguish the foreground (1-255). Only for RemBG 1.4 model.',
      required: false,
      defaultValue: 240,
    }),
    alphaMattingBackgroundThreshold: Property.Number({
      displayName: 'Alpha Matting Background Threshold',
      description: 'Threshold to refine the background areas (1-255). Only for RemBG 1.4 model.',
      required: false,
      defaultValue: 10,
    }),
    alphaMattingErodeSize: Property.Number({
      displayName: 'Alpha Matting Erode Size',
      description: 'Size of the erosion operation to smooth edges (1-255). Only for RemBG 1.4 model ',
      required: false,
      defaultValue: 10,
    }),
  },
  async run(context) {
    const { auth, propsValue } = context;
    await propsValidation.validateZod(propsValue, RunwareBgRemovalInputSchema);

    const requestBody: any = {
      taskType: 'imageBackgroundRemoval',
      taskUUID: crypto.randomUUID(),
      inputImage: propsValue.inputImage,
      model: propsValue.model,
      ...(propsValue.outputType && { outputType: propsValue.outputType }),
      ...(propsValue.outputFormat && { outputFormat: propsValue.outputFormat }),
    };

    // validate settings object
    if (propsValue.model === 'runware:109@1') {
      const settings: any = {};

      if (propsValue.rgba) {
        settings.rgba = propsValue.rgba;
      }
      if (propsValue.postProcessMask) {
        settings.postProcessMask = propsValue.postProcessMask;
      }
      if (propsValue.returnOnlyMask) {
        settings.returnOnlyMask = propsValue.returnOnlyMask;
      }
      if (propsValue.alphaMatting) {
        settings.alphaMatting = propsValue.alphaMatting;
      }
      if (propsValue.alphaMattingForegroundThreshold) {
        settings.alphaMattingForegroundThreshold = propsValue.alphaMattingForegroundThreshold;
      }
      if (propsValue.alphaMattingBackgroundThreshold) {
        settings.alphaMattingBackgroundThreshold = propsValue.alphaMattingBackgroundThreshold;
      }
      if (propsValue.alphaMattingErodeSize) {
        settings.alphaMattingErodeSize = propsValue.alphaMattingErodeSize;
      }
      if (Object.keys(settings).length > 0) requestBody.settings = settings;
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