import { PieceAuth } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

const authGuide = ` To get your Runware API Key:
1. Sign up or log in on the [Runware website](https://my.runware.ai).
2. Navigate to the **API Keys** page from the dashboard side bar.
3. Click **"Create API Key"**, give it a name, copy the generated key and paste in the API key field below.
`;

export const runwareAuth = PieceAuth.SecretText({
    displayName: 'API Key',
    description: authGuide,
    required: true,
    validate: async ({ auth }) => {
        try {
            const response = await httpClient.sendRequest({
                url: 'https://api.runware.ai/v1',
                method: HttpMethod.POST,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth}`,
                },
                body: [{}],
            });
            if (!response.body.data) {
                return { valid: true };
            }
            return { valid: false, error: 'Invalid API key.' };
        } catch (e) {
            return {
                valid: false,
                error: 'Invalid API key.',
            };
        }
    },
});