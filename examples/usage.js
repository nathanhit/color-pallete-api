// Example usage of the Color Palette API in other projects
import getColorPalette, { ColorPaletteClient } from '../src/client.js';

// Example 1: Simple usage
async function simpleExample() {
  try {
    const colors = await getColorPalette("sunset over ocean", 6);
    console.log("Generated palette:", colors);

    // Use colors in your app
    colors.forEach((color, index) => {
      console.log(`Color ${index + 1}: ${color}`);
    });
  } catch (error) {
    console.error("Failed to generate palette:", error.message);
  }
}

// Example 2: Using the client class
async function clientExample() {
  const client = new ColorPaletteClient();

  try {
    // Generate basic palette
    const colors = await client.generate("forest at dawn", 5);
    console.log("Forest palette:", colors);

    // Generate with metadata
    const paletteData = await client.generateWithMetadata("mountain lake", 7);
    console.log("Palette with metadata:", paletteData);

  } catch (error) {
    console.error("Failed to generate palette:", error.message);
  }
}

// Example 3: Simple color palette display (console-based)
function displayPalette(colors, description) {
  console.log(`\n🎨 Color Palette for "${description}":`);
  colors.forEach((color, index) => {
    console.log(`  ${index + 1}. ${color}`);
  });
  console.log('\nYou can use these colors in your HTML/CSS:');
  console.log('background-color:', colors[0]);
  console.log('color:', colors[colors.length - 1] || colors[0]);
}

// Example 4: Node.js backend usage
export async function generateThemeColors(req, res) {
  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const colors = await getColorPalette(theme, 6);

    res.json({
      theme,
      colors,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Palette generation error:', error);
    res.status(500).json({ error: 'Failed to generate palette' });
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🎨 Running Color Palette API Examples...\n");

  simpleExample().then(async () => {
    console.log("\n" + "=".repeat(50) + "\n");

    const client = new ColorPaletteClient();

    try {
      console.log("📋 Example 2: Using ColorPaletteClient");
      const colors = await client.generate("mountain lake", 4);
      displayPalette(colors, "mountain lake");

      console.log("\n" + "=".repeat(50) + "\n");

      console.log("📊 Example 3: With Metadata");
      const paletteData = await client.generateWithMetadata("desert sunset", 3);
      displayPalette(paletteData.colors, paletteData.description);
      console.log(`Generated: ${paletteData.timestamp}`);

    } catch (error) {
      console.error("Failed to generate palette:", error.message);
    }
  }).catch(console.error);
}
