// Client wrapper for easy integration into other projects
import { generatePalette } from './server.js';

// Simple wrapper function that returns just the colors
export async function getColorPalette(description, count = 5) {
  try {
    const { result, error } = await generatePalette({ text: description, count });

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
  constructor() {
    // Client is ready to use
  }

  async generate(description, count = 5) {
    return await getColorPalette(description, count);
  }

  async generateWithMetadata(description, count = 5) {
    const { result, error } = await generatePalette({ text: description, count });

    if (error) {
      throw new Error(`Palette generation failed: ${error.message}`);
    }

    return {
      colors: result.colors,
      description,
      count: result.colors.length,
      timestamp: new Date().toISOString()
    };
  }
}

// Default export for convenience
export default getColorPalette;
