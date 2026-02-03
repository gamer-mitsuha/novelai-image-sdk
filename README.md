# NovelAI Image SDK

Type-safe TypeScript SDK for the NovelAI V4.5 image generation API.

## Features

- 🎨 **Fluent Builder API** - Chainable methods for intuitive configuration
- 🖥️ **CLI Tool** - Generate images from the command line with `nai-gen`
- 📦 **Isomorphic** - Works in Node.js and browsers
- 🔒 **Type-safe** - Full TypeScript with enums for all API constants
- ⚡ **V4.5 Compliant** - Implements strict schema requirements for `nai-diffusion-4-5-full`
- 🎭 **Multi-character Support** - Built-in support for V4.5 character prompting

## Installation

```bash
# As a library
npm install novelai-image-sdk

# As a CLI tool (global)
npm install -g novelai-image-sdk
```

## CLI Usage

After global install, the `nai-gen` command is available:

```bash
# Set your token
export NAI_TOKEN="pst-..."

# Basic generation
nai-gen --prompt "1girl, silver hair, maid outfit, night window"

# Landscape with custom settings
nai-gen -p "cityscape, neon lights, rain" -s 1216x832 --steps 28 -o ./output

# Multi-character
nai-gen -p "cafe scene" -c "girl, blue hair, eating" -c "boy, red hoodie, drinking"

# Full control
nai-gen -p "1girl, detailed" -n "lowres, bad anatomy" \
  --size 832x1216 --steps 28 --scale 5 --sampler k_euler \
  --smea-dyn --seed 12345 -o /tmp/nai --prefix myimage
```

### CLI Options

| Flag | Default | Description |
|------|---------|-------------|
| `-p, --prompt` | (required) | Base prompt |
| `-c, --character` | — | Character prompt (repeatable for multi-char) |
| `-n, --negative` | — | Negative prompt |
| `-o, --output` | `.` | Output directory |
| `--prefix` | `nai` | Filename prefix |
| `-s, --size` | `832x1216` | Image size (WxH, multiples of 64) |
| `-m, --model` | `nai-diffusion-4-5-full` | Model name |
| `--steps` | `28` | Sampling steps (1-50) |
| `--scale` | `5` | CFG guidance scale (0-10) |
| `--sampler` | `k_euler` | Sampling algorithm |
| `--seed` | random | Random seed for reproducibility |
| `-b, --batch` | `1` | Images per request |
| `--smea` | off | Enable SMEA |
| `--smea-dyn` | off | Enable Dynamic SMEA |
| `-t, --token` | `$NAI_TOKEN` | API token (or use env var) |

## SDK Quick Start

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
| `.setNegativePrompt(base, charNegatives?)` | What to avoid (supports per-character) |
| `.addCharacterNegative(prompt)` | Add per-character negative prompt |
| `.setSeed(seed)` | Random seed for reproducibility |
| `.setSteps(steps)` | Sampling steps (1-50) |
| `.setCfgScale(scale)` | CFG guidance scale (0-10) |
| `.setBatchSize(n)` | Generate multiple images per request |
| `.setSampler(sampler)` | Sampling algorithm |
| `.setNegativePreset(preset)` | Negative preset (Heavy, Light, None) |
| `.enableSMEA(dynamic?)` | Enable SMEA/Dynamic SMEA |
| `.enableDynamicThresholding()` | Enhanced contrast at high CFG |
| `.enableAutoQualityTags(enabled?)` | Auto quality tags (default: true) |
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

### Prompt Length Check

Check if prompts exceed the recommended limit before generation:

```typescript
import { checkPromptLength } from 'novelai-image-sdk';

const warning = checkPromptLength(myLongPrompt);
if (warning.isWarning) {
  console.warn(warning.message); // "Prompt length (2500 chars) exceeds..."
}
```

## Resolution Guidelines

Dimensions must be multiples of 64. Common aspect ratios:

| Aspect | Portrait | Landscape |
|--------|----------|-----------|
| 3:4 | 832×1216 | 1216×832 |
| 1:1 | 1024×1024 | — |
| 2:3 | 768×1152 | 1152×768 |

## Getting Your API Token

1. Go to [NovelAI](https://novelai.net) and log in
2. Navigate to Account Settings
3. Generate a **Persistent API Token** (starts with `pst-`)

> ⚠️ Never commit your token to version control. Use environment variables.

## License

Apache License 2.0 — see [LICENSE](./LICENSE) for details.
