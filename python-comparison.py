# Python equivalent of our Node.js API
import os
import json
from openai import OpenAI

def get_color_palette(text, count=5):
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    # This would be the Python equivalent of our ONE API call
    completion = client.chat.completions.create(
        model="gpt-4.1-nano-2025-04-14",
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "...system prompt..."},
            {"role": "user", "content": f"Generate colors for: {text}"}
        ]
    )

    return json.loads(completion.choices[0].message.content)

# Usage in Python:
# from color_palette_api import get_color_palette
# colors = get_color_palette("sunset", 5)

print("Python would work too, but JavaScript has advantages for web projects!")
