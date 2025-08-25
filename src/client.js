// Client wrapper for easy integration into other projects
import { generatePalette } from './server.js';

// Configuration class for API keys
class ColorPaletteConfig {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey parameter.\n' +
        'Example: new ColorPaletteClient({ apiKey: "your-api-key" })'
      );
    }
    this.apiKey = apiKey;
  }
}

// Get API key from environment or configuration
function getApiKey(config = {}) {
  return config.apiKey || process.env.OPENAI_API_KEY;
}

// Simple wrapper function that returns just the colors
export async function getColorPalette(description, count = 5, config = {}) {
  const apiKey = getApiKey(config);

  try {
    const { result, error } = await generatePalette({
      text: description,
      count,
      apiKey // Pass API key to the palette generator
    });

    if (error) {
      throw new Error(`Palette generation failed: ${error.message}`);
    }

    return result.colors;
  } catch (err) {
    console.error('Error generating palette:', err);
    throw err;
  }
}

// Advanced wrapper with more options
export class ColorPaletteClient {
  constructor(config = {}) {
    const apiKey = getApiKey(config);
    this.config = new ColorPaletteConfig(apiKey);
  }

  async generate(description, count = 5) {
    return await getColorPalette(description, count, { apiKey: this.config.apiKey });
  }

  async generateWithMetadata(description, count = 5) {
    const colors = await this.generate(description, count);

    return {
      colors,
      description,
      count: colors.length,
      timestamp: new Date().toISOString()
    };
  }
}

// Default export for convenience
export default getColorPalette;
