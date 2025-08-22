## Color Palette API

Generate cohesive color palettes from text (e.g., locations) using a low-cost OpenAI model. Responses are strict JSON with hex codes only.

### Requirements
- Node.js 18+ (built-in `fetch` used in examples)
- An OpenAI API key with access to `gpt-4.1-nano-2025-04-14`

### Setup
1) Configure environment
```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=<your_key>
# Optional: change PORT (default 3000)
# Optional: tune rate limit via RATE_WINDOW_MS and RATE_MAX
```

2) Install and run
```bash
npm install
npm start
# Server: http://localhost:3000
```

3) Health check
```bash
curl -s http://localhost:3000/health
```

### API
- Model: `gpt-4.1-nano-2025-04-14` (very low cost, sufficient for palette semantics)
- Palette size: min 5, max 8 (default 5)
- Ordering rules in `colors` array:
  - If count ≥ 5: `[primary, secondary, ...accents, background, high-contrast text]`
  - If count < 5: `[primary, secondary, ...accents]` (server currently enforces minimum 5)

#### POST /palette
Generate a palette from request body.

Request body
```json
{ "text": "string (required)", "count": 5 }
```

Response
```json
{ "colors": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"] }
```

Example
```bash
curl -s -X POST http://localhost:3000/palette \
  -H 'Content-Type: application/json' \
  -d '{"text":"Santorini at sunset","count":5}' | jq
```

#### GET /palette
URL-encoded variant, convenient for quick tests.

Query params
- `text` (required)
- `count` (optional, 5–8)

Example
```bash
curl -s "http://localhost:3000/palette?text=Santorini%20at%20sunset&count=5" | jq
```

### Quick tests (copy-paste)

Node.js one-file POST test (save as `test.js` then `node test.js`)
```js
const url = 'http://localhost:3000/palette';
const body = { text: 'Tokyo neon at night', count: 6 };

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Simple browser GET demo (save as `demo.html` and open)
```html
<!doctype html>
<html>
  <body>
    <input id="q" value="Provence lavender fields" size="40" />
    <button id="go">Generate</button>
    <div id="out" style="margin-top:12px;"></div>
    <script>
      document.getElementById('go').onclick = async () => {
        const text = encodeURIComponent(document.getElementById('q').value);
        const res = await fetch(`http://localhost:3000/palette?text=${text}&count=5`);
        const { colors } = await res.json();
        const out = document.getElementById('out');
        out.innerHTML = '';
        (colors || []).forEach((hex, i) => {
          const label = ['Primary','Secondary','Accent','Accent','Background','Text'][i] || 'Accent';
          const sw = document.createElement('div');
          sw.style.cssText = `display:flex;align-items:center;margin:6px 0;`;
          sw.innerHTML = `<div style=\"width:64px;height:24px;background:${hex};border:1px solid #ccc;margin-right:8px\"></div>` +
                         `<code>${i}: ${label} - ${hex}</code>`;
          out.appendChild(sw);
        });
      };
    </script>
  </body>
  </html>
```

### Troubleshooting
- 401/403: Verify `OPENAI_API_KEY` and model access.
- 502 from API: Model produced malformed JSON; server retries via extraction but may still fail for very short/ambiguous prompts.
- Empty/short palettes: Increase `count` (up to 8) or provide richer `text`.
- 429 rate limit: Adjust `RATE_WINDOW_MS` or `RATE_MAX` in `.env`.

### Notes
- For higher reliability at slightly higher cost, consider fallback to `gpt-4o-mini` if nano is unavailable.

