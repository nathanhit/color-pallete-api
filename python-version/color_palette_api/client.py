import os
import json
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ColorPaletteClient:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = OpenAI(api_key=api_key)

    def generate(self, text: str, count: int = 5) -> List[str]:
        """Generate a color palette from text description"""
        return get_color_palette(text, count, self.client)

    def generate_with_metadata(self, text: str, count: int = 5) -> dict:
        """Generate palette with metadata"""
        colors = self.generate(text, count)
        return {
            'colors': colors,
            'description': text,
            'count': len(colors),
            'timestamp': self._get_timestamp()
        }

    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'

def get_color_palette(text: str, count: int = 5, client: Optional[OpenAI] = None) -> List[str]:
    """
    Generate a color palette from text description.

    Args:
        text: Description of desired colors
        count: Number of colors (5-8)
        client: Optional OpenAI client (creates new one if not provided)

    Returns:
        List of hex color codes
    """
    if not client:
        client = ColorPaletteClient().client

    # Validate inputs
    if not text or not text.strip():
        raise ValueError("Text description is required")

    count = max(5, min(8, count))  # Clamp between 5-8

    # System prompt
    system = """You are a color palette generator.
Return only a JSON object: {"colors": ["#RRGGBB", ...]}.
Exactly {count} colors.
Order strictly: primary, secondary, accent(s), background, high-contrast text.
If fewer than 5 colors, omit background and text.
Colors must be distinct and valid 6-digit hex codes.
No explanations, no extra fields."""

    # User prompt
    user = f"""Generate a color palette that evokes: "{text.strip()}".
Follow the exact ordering specification above.
Consider cultural and natural associations.
Ensure all hex codes are valid 6-digit values."""

    # Make API call
    completion = client.chat.completions.create(
        model="gpt-4.1-nano-2025-04-14",
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system.format(count=count)},
            {"role": "user", "content": user}
        ]
    )

    # Parse response
    content = completion.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned empty response")

    try:
        data = json.loads(content)
        colors = data.get('colors', [])

        # Validate and clean colors
        valid_colors = []
        for color in colors:
            if isinstance(color, str):
                color = color.strip()
                if color.startswith('#'):
                    color = color[1:]
                if len(color) == 6 and all(c in '0123456789abcdefABCDEF' for c in color):
                    valid_colors.append(f'#{color.upper()}')

        return list(set(valid_colors))[:count]  # Remove duplicates, limit count

    except json.JSONDecodeError:
        raise ValueError("Invalid JSON response from OpenAI")
