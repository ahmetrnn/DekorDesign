# Dekor Virtual Staging System

Dekor is an AI-assisted virtual staging workflow built with Next.js 14 App Router and TypeScript. It scrapes furniture products, removes backgrounds, analyzes room imagery with OpenAI Vision, and generates photorealistic staged renders through Fal.ai with a Sharp.js fallback compositor.

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

- `FAL_KEY` – Fal.ai serverless API key for `fal-ai/nano-banana/edit`
- `OPENAI_API_KEY` – OpenAI API key with vision access

## Available Scripts

- `npm run dev` – start the Next.js development server
- `npm run build` – production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint
- `npm run test` – execute Vitest unit/UI tests

## Project Structure

```
src/app/(dekor)/dekor
  ├─ components        # Client UI for ingest → gallery workflow
  ├─ lib               # Typed utilities (Fal, OpenAI, prompts, fs helpers)
  ├─ page.tsx          # Main Dekor experience (client component)
  └─ layout.tsx        # Section layout shell
src/app/(dekor)/api
  ├─ ingest            # Product ingestion & background removal
  ├─ room-analyze      # Room vision analysis (OpenAI)
  ├─ stage-nano        # Fal.ai staging + Sharp fallback
  └─ gallery-dekor     # Paginated gallery endpoint
public/
  ├─ products/original   # Original ingested assets
  ├─ products/processed  # Background-removed assets + metadata
  └─ staging             # Rooms, composites, metadata
```

## API Reference

### `POST /api/ingest`
Ingest a furniture item via product URL or image upload.

- Body: `multipart/form-data`
  - `url` (optional) – product page URL to scrape
  - `file` (optional) – product image upload (`image/*`)
- Response (`200`):

```json
{
  "success": true,
  "data": {
    "id": "product_123",
    "title": "Sofa",
    "images": [
      {
        "id": "img_1",
        "originalPath": "/products/original/product_123/img_1.jpg",
        "processedPath": "/products/processed/product_123/img_1.png",
        "backgroundRemoved": true,
        "confidence": 0.85
      }
    ]
  }
}
```

### `POST /api/room-analyze`
Analyze a room photo for palette, lighting, and style.

- Body: `multipart/form-data`
  - `file` (required) – room image (`image/*`)
- Response (`200`):

```json
{
  "success": true,
  "data": {
    "roomPath": "/staging/rooms/room_456.png",
    "analysis": {
      "wallColor": "#F7F4EA",
      "floorColor": "#EBD9D1",
      "palette": ["#F7F4EA", "#EBD9D1", "#B87C4C"],
      "brightness": 0.62,
      "style": "Modern"
    }
  }
}
```

### `POST /api/stage-nano`
Generate a staged composite with Fal.ai, fallback to Sharp.js when necessary.

- Body: `application/json`

```json
{
  "roomPath": "/staging/rooms/room_456.png",
  "roomAnalysis": {
    "wallColor": "#F7F4EA",
    "floorColor": "#EBD9D1",
    "palette": ["#F7F4EA", "#EBD9D1", "#B87C4C"],
    "brightness": 0.62,
    "style": "Modern"
  },
  "selections": [
    { "productId": "product_123", "imageId": "img_1" }
  ]
}
```

- Response (`200`):

```json
{
  "success": true,
  "data": {
    "id": "stage_789",
    "outputImagePath": "/staging/staged/stage_789.png",
    "prompt": "Place the selected furniture into the uploaded room photo...",
    "generator": "fal",
    "confidence": 0.9
  }
}
```

### `GET /api/gallery-dekor`
Paginated gallery of generated assets.

- Query params: `page` (default `1`), `pageSize` (default `12`, max `48`)
- Response (`200`):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "stage_789",
        "outputImagePath": "/staging/staged/stage_789.png",
        "downloadUrl": "/staging/staged/stage_789.png",
        "generator": "fal",
        "confidence": 0.9,
        "prompt": "Place the selected furniture..."
      }
    ],
    "total": 1,
    "page": 1
  }
}
```

## UI Flow

1. **Product Ingestion** – paste a product URL or upload images. Scraping + background removal populate the product grid.
2. **Selection Grid** – choose one or more processed product views. Glassmorphism cards use the Color Hunt palette (#A8BBA3, #F7F4EA, #EBD9D1, #B87C4C).
3. **Room Image** – upload a room photo (saved under `/public/staging/rooms`) or paste an existing path.
4. **Staging Controls** – send the chosen room and product selections to Fal.ai. Sharp.js fallback ensures a result even if Fal.ai fails.
5. **Gallery** – view hi-res renders, inspect prompts, and download deliverables. Results auto-refresh after each staging run.

## Testing

Run the Vitest suite:

```bash
npm run test
```

- `tests/ingest.test.ts` validates filesystem helpers (IDs, sanitization, URL derivation).
- `tests/stage.test.ts` checks prompt composition integrity.
- `tests/ui.test.tsx` exercises the ingest UI and fetch contract with mocked responses.

## Notes

- All image assets and metadata remain under `public/` for straightforward hosting or CDN migration.
- API routes expect Node 18+ with native `fetch` and `FormData` support (matching the Next.js 14 runtime).
- `@fal-ai/serverless-client` is used exclusively for generation—do not install `@fal-ai/client`.
