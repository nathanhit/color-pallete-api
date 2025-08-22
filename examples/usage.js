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

// Example 3: React component usage
export function ColorPaletteGenerator() {
  const [palette, setPalette] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePalette = async (description) => {
    setLoading(true);
    setError(null);

    try {
      const colors = await getColorPalette(description, 5);
      setPalette(colors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => generatePalette("tropical paradise")}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Palette'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {palette.map((color, index) => (
          <div
            key={index}
            style={{
              backgroundColor: color,
              width: '50px',
              height: '50px',
              border: '1px solid #ccc'
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
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
  console.log("Running Color Palette API examples...\n");

  simpleExample().then(() => {
    console.log("\n---\n");
    return clientExample();
  }).catch(console.error);
}
