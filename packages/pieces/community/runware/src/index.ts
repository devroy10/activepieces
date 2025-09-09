import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { generateImageFromImage } from './lib/actions/generate-image-from-image';
import { generateImageFromText } from './lib/actions/generate-image-from-text';
import { generateVideoFromText } from './lib/actions/generate-video-from-text';
import { removeImageBackground } from './lib/actions/remove-image-background';
import { runwareAuth } from './lib/common/auth';

export const runware = createPiece({
  displayName: 'Runware',
  description: 'Runware.AI is a high-performance, cost-effective AI media generation API specializing in images and videos.',
  auth: runwareAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/runware.png',
  categories: [PieceCategory.ARTIFICIAL_INTELLIGENCE],
  authors: ['devroy10'],
  actions: [
    generateImageFromText,
    generateImageFromImage,
    generateVideoFromText,
    removeImageBackground,
  ],
  triggers: [],
});
