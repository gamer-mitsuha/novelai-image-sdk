# NovelAI Image SDK

Type-safe TypeScript SDK for the NovelAI V4.5 image generation API.

## Features

- 🎨 **Fluent Builder API** - Chainable methods for intuitive configuration
- 📦 **Isomorphic** - Works in Node.js and browsers
- 🔒 **Type-safe** - Full TypeScript with enums for all API constants
- ⚡ **V4.5 Compliant** - Implements strict schema requirements for `nai-diffusion-4-5-full`
- 🎭 **Multi-character Support** - Built-in support for V4.5 character prompting

## Installation

```bash
npm install novelai-image-sdk
```

## Quick Start

```typescript
import { NovelAIClient, NovelAIModel } from 'novelai-image-sdk';
import fs from 'fs';

const client = new NovelAIClient({ 
  token: process.env.NAI_TOKEN! // Your pst-... token
});

const result = await client.image()
  .setModel(NovelAIModel.V45_Full)
  .setPrompt('1girl, cyberpunk city, neon lights')
  .setSize(832, 1216)
  .generate();

fs.writeFileSync('output.png', result.images[0]);
```

## API Reference

### Client Configuration

```typescript
const client = new NovelAIClient({
  token: 'pst-...',              // Required: Persistent API Token
  baseUrl: 'https://...',        // Optional: Custom API endpoint
  timeout: 60000,                // Optional: Request timeout in ms
});
```

### Builder Methods

| Method | Description |
|--------|-------------|
| `.setModel(model)` | Set generation model (V45_Full, V4_Curated, Inpainting) |
| `.setSize(width, height)` | Image dimensions (must be multiples of 64) |
| `.setPrompt(base, characters?)` | Set base prompt and optional character array |
| `.addCharacter(prompt)` | Add a character prompt |
| `.setNegativePrompt(prompt)` | What to avoid in generation |
| `.setSeed(seed)` | Random seed for reproducibility |
| `.setSteps(steps)` | Sampling steps (1-50) |
| `.setScale(scale)` | Guidance scale / CFG (0-10) |
| `.setSampler(sampler)` | Sampling algorithm |
| `.setUCPreset(preset)` | UC preset (Heavy, Light, None) |
| `.enableSMEA(dynamic?)` | Enable SMEA/Dynamic SMEA |
| `.setQualityToggle(enabled)` | Auto quality tags |
| `.generate()` | Execute the request |

### Multi-Character Prompting

```typescript
const result = await client.image()
  .setPrompt(
    'A busy cafeteria scene',     // Base prompt
    [
      'girl, blue hair, eating',   // Character 1
      'boy, red hoodie, drinking'  // Character 2
    ]
  )
  .enableSMEA(true)
  .generate();
```

### Available Enums

```typescript
import { 
  NovelAIModel,    // V45_Full, V4_Curated, Inpainting
  NovelAISampler,  // Euler, EulerAncestral, DPM_2M, DPM_SDE, DDIM
  UCPreset,        // Heavy, Light, None
  NoiseSchedule    // Native, Karras, Exponential, Polyexponential
} from 'novelai-image-sdk';
```

### Error Handling

```typescript
import { 
  NovelAIAuthError,       // 401 - Invalid token
  NovelAIPaymentError,    // 402 - Insufficient Anlas
  NovelAIValidationError, // 400 - Invalid parameters
  NovelAIRateLimitError,  // 429 - Rate limited
  NovelAIServerError      // 500 - Server error
} from 'novelai-image-sdk';

try {
  await client.image().setPrompt('test').generate();
} catch (error) {
  if (error instanceof NovelAIAuthError) {
    console.error('Check your API token');
  }
}
```

### Browser Usage

The SDK automatically detects the environment and uses appropriate ZIP parsing:

```typescript
const result = await client.image()
  .setPrompt('anime girl')
  .generate();

// Convert to data URL for <img> src
import { toDataURL } from 'novelai-image-sdk';
const dataUrl = toDataURL(result.images[0]);
document.getElementById('img').src = dataUrl;
```

## Resolution Guidelines

Dimensions must be multiples of 64. Common aspect ratios:

| Aspect | Portrait | Landscape |
|--------|----------|-----------|
| 3:4 | 832×1216 | 1216×832 |
| 1:1 | 1024×1024 | - |
| 2:3 | 768×1152 | 1152×768 |

## Getting Your API Token

1. Go to [NovelAI](https://novelai.net) and log in
2. Navigate to Account Settings
3. Generate a **Persistent API Token** (starts with `pst-`)

> ⚠️ Never commit your token to version control. Use environment variables.

## License

Apache License 2.0 - see [LICENSE](./LICENSE) for details.
