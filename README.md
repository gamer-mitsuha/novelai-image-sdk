<div align="center">

# NovelAI Image SDK

**Type-safe TypeScript SDK & CLI for the NovelAI V4.5 Image Generation API**

[![npm version](https://img.shields.io/npm/v/novelai-image-sdk.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/novelai-image-sdk)
[![npm downloads](https://img.shields.io/npm/dm/novelai-image-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/novelai-image-sdk)
[![npm weekly](https://img.shields.io/npm/dw/novelai-image-sdk.svg?style=flat-square&color=green)](https://www.npmjs.com/package/novelai-image-sdk)
[![license](https://img.shields.io/npm/l/novelai-image-sdk.svg?style=flat-square)](https://github.com/gamer-mitsuha/novelai-image-sdk/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/novelai-image-sdk.svg?style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![GitHub stars](https://img.shields.io/github/stars/gamer-mitsuha/novelai-image-sdk?style=flat-square&logo=github)](https://github.com/gamer-mitsuha/novelai-image-sdk)

[English](./README.md) · [中文](./README.zh-CN.md)

</div>

---

## ✨ Features

- 🎨 **Fluent Builder API** — Chainable methods for intuitive configuration
- 🖥️ **CLI Tool (`nai-gen`)** — Generate images directly from the command line
- 📦 **Isomorphic** — Works in Node.js and browsers
- 🔒 **Type-safe** — Full TypeScript with enums for all API constants
- ⚡ **V4.5 Compliant** — Implements strict schema requirements for `nai-diffusion-4-5-full`
- 🎭 **Multi-character Support** — Built-in support for V4.5 character prompting
- 🛡️ **Robust Error Handling** — Typed errors for auth, rate limits, validation, and more

## 📦 Installation

```bash
# As a library
npm install novelai-image-sdk

# As a global CLI tool
npm install -g novelai-image-sdk
```

## 🖥️ CLI Usage

After global install, the `nai-gen` command is available:

```bash
# Set your token
export NAI_TOKEN="pst-..."

# Basic generation (portrait)
nai-gen --prompt "1girl, silver hair, maid outfit, night window"

# Landscape with custom settings
nai-gen -p "cityscape, neon lights, rain" -s 1216x832 --steps 28 -o ./output

# Multi-character scene
nai-gen -p "cafe scene" -c "girl, blue hair, eating" -c "boy, red hoodie, drinking"

# Full control
nai-gen -p "1girl, detailed" -n "lowres, bad anatomy" \
  --size 832x1216 --steps 28 --scale 5 --sampler k_euler \
  --smea-dyn --seed 12345 -o /tmp/nai --prefix myimage
```

<details>
<summary><b>📋 All CLI Options</b></summary>

| Flag | Default | Description |
|------|---------|-------------|
| `-p, --prompt` | *(required)* | Base prompt |
| `-c, --character` | — | Character prompt (repeatable for multi-char) |
| `-n, --negative` | — | Negative prompt |
| `-o, --output` | `.` | Output directory |
| `--prefix` | `nai` | Filename prefix |
| `-s, --size` | `832x1216` | Image size (WxH, multiples of 64) |
| `-m, --model` | `nai-diffusion-4-5-full` | Model name |
| `--steps` | `28` | Sampling steps (1–50) |
| `--scale` | `5` | CFG guidance scale (0–10) |
| `--sampler` | `k_euler` | Sampling algorithm |
| `--seed` | random | Random seed for reproducibility |
| `-b, --batch` | `1` | Images per request |
| `--smea` | off | Enable SMEA |
| `--smea-dyn` | off | Enable Dynamic SMEA |
| `-t, --token` | `$NAI_TOKEN` | API token (or use env var) |
| `-h, --help` | — | Show help |

</details>

## 🚀 SDK Quick Start

```typescript
import { NovelAIClient, NovelAIModel } from 'novelai-image-sdk';
import fs from 'fs';

const client = new NovelAIClient({ 
  token: process.env.NAI_TOKEN!
});

const result = await client.image()
  .setModel(NovelAIModel.V45_Full)
  .setPrompt('1girl, cyberpunk city, neon lights')
  .setSize(832, 1216)
  .generate();

fs.writeFileSync('output.png', result.images[0]);
```

## 📖 API Reference

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
| `.setModel(model)` | Set generation model |
| `.setSize(width, height)` | Image dimensions (multiples of 64) |
| `.setPrompt(base, characters?)` | Set base prompt and optional character array |
| `.addCharacter(prompt)` | Add a character prompt |
| `.setNegativePrompt(base, charNegatives?)` | What to avoid (supports per-character) |
| `.addCharacterNegative(prompt)` | Add per-character negative prompt |
| `.setSeed(seed)` | Random seed for reproducibility |
| `.setSteps(steps)` | Sampling steps (1–50) |
| `.setCfgScale(scale)` | CFG guidance scale (0–10) |
| `.setBatchSize(n)` | Generate multiple images per request |
| `.setSampler(sampler)` | Sampling algorithm |
| `.setNegativePreset(preset)` | Negative preset (Heavy, Light, None) |
| `.enableSMEA(dynamic?)` | Enable SMEA / Dynamic SMEA |
| `.enableDynamicThresholding()` | Enhanced contrast at high CFG |
| `.enableAutoQualityTags(enabled?)` | Auto quality tags (default: true) |
| `.generate()` | Execute the request |

### Multi-Character Prompting

```typescript
const result = await client.image()
  .setPrompt(
    'A busy cafeteria scene',
    [
      'girl, blue hair, eating',
      'boy, red hoodie, drinking'
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

The SDK provides typed error classes for all API error scenarios:

```typescript
import { 
  NovelAIAuthError,       // 401 — Invalid token
  NovelAIPaymentError,    // 402 — Insufficient Anlas
  NovelAIValidationError, // 400 — Invalid parameters
  NovelAIRateLimitError,  // 429 — Rate limited (includes retryAfter)
  NovelAIServerError      // 500 — Server error
} from 'novelai-image-sdk';

try {
  await client.image().setPrompt('test').generate();
} catch (error) {
  if (error instanceof NovelAIAuthError) {
    console.error('Check your API token');
  } else if (error instanceof NovelAIRateLimitError) {
    console.log(`Retry after ${error.retryAfter}s`);
  }
}
```

### Browser Usage

```typescript
const result = await client.image()
  .setPrompt('anime girl')
  .generate();

import { toDataURL } from 'novelai-image-sdk';
const dataUrl = toDataURL(result.images[0]);
document.getElementById('img').src = dataUrl;
```

## 📐 Resolution Guidelines

Dimensions must be multiples of 64. Recommended sizes:

| Aspect | Portrait | Landscape | Square |
|--------|----------|-----------|--------|
| 3:4 | 832×1216 | 1216×832 | — |
| 1:1 | — | — | 1024×1024 |
| 2:3 | 768×1152 | 1152×768 | — |
| 9:16 | 768×1344 | 1344×768 | — |

## 🎨 Models

| Model | ID | Description |
|-------|----|-------------|
| **V4.5 Full** | `nai-diffusion-4-5-full` | Latest model, best quality, multi-character |
| V4 Curated | `nai-diffusion-4-curated` | Conservative aesthetic choices |
| Inpainting | `nai-diffusion-4-inpainting` | Image editing and inpainting |

## 🔑 Getting Your API Token

1. Go to [NovelAI](https://novelai.net) and log in
2. Navigate to **Account Settings**
3. Generate a **Persistent API Token** (starts with `pst-`)

> ⚠️ Never commit your token to version control. Use environment variables.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Apache License 2.0](./LICENSE) — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Made with ❤️ for the NovelAI community

</div>
