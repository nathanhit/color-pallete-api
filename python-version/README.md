# Color Palette API (Python Version)

## Installation

**Option 1: Install via Git + pip**
```bash
git clone https://github.com/nathanhit/color-pallete-api.git
cd color-pallete-api/python-version
pip install -e .
```

**Option 2: Install from PyPI (if published)**
```bash
pip install color-palette-api
```

## Usage

```python
# Python usage
from color_palette_api import get_color_palette, ColorPaletteClient

# Simple usage
colors = get_color_palette("sunset over ocean", 6)
print(colors)  # ['#FF6B35', '#F7931E', '#FFD23F', '#4CAF50', '#2196F3', '#9C27B0']

# Advanced usage
client = ColorPaletteClient()
result = client.generate_with_metadata("forest at dawn", 5)
print(result)
```

## Environment Setup

```bash
# .env file
OPENAI_API_KEY=your_api_key_here
```
