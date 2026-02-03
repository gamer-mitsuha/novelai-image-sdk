#!/usr/bin/env node
/**
 * NovelAI Image Generation CLI
 *
 * Usage:
 *   nai-gen --prompt "1girl, silver hair" --output /tmp/output
 *   nai-gen --prompt "cyberpunk city" --size 1216x832 --steps 28
 *   nai-gen --prompt "base prompt" --character "girl, blue hair" --character "boy, red hoodie"
 *
 * Environment:
 *   NAI_TOKEN  — NovelAI persistent API token (pst-...)
 */
import { parseArgs } from 'node:util';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Dynamic import of the SDK (works with both built dist and src)
const sdkPath = new URL('../dist/index.cjs', import.meta.url).pathname;
const { NovelAIClient, NovelAIModel, NovelAISampler } = await import(sdkPath);

const { values, positionals } = parseArgs({
  options: {
    prompt: { type: 'string', short: 'p' },
    character: { type: 'string', multiple: true, short: 'c' },
    negative: { type: 'string', short: 'n' },
    output: { type: 'string', short: 'o', default: '.' },
    prefix: { type: 'string', default: 'nai' },
    size: { type: 'string', short: 's', default: '832x1216' },
    model: { type: 'string', short: 'm', default: 'nai-diffusion-4-5-full' },
    steps: { type: 'string', default: '28' },
    scale: { type: 'string', default: '5' },
    sampler: { type: 'string', default: 'k_euler' },
    seed: { type: 'string' },
    batch: { type: 'string', short: 'b', default: '1' },
    smea: { type: 'boolean', default: false },
    'smea-dyn': { type: 'boolean', default: false },
    token: { type: 'string', short: 't' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
  strict: false,
});

if (values.help) {
  console.log(`
NovelAI Image Generation CLI

Usage:
  nai-gen --prompt "1girl, silver hair" [options]
  nai-gen "1girl, silver hair" [options]        (positional prompt)

Options:
  -p, --prompt <text>      Base prompt (required)
  -c, --character <text>   Character prompt (repeatable for multi-char)
  -n, --negative <text>    Negative prompt
  -o, --output <dir>       Output directory (default: .)
      --prefix <name>      Filename prefix (default: nai)
  -s, --size <WxH>         Image size (default: 832x1216)
  -m, --model <model>      Model name (default: nai-diffusion-4-5-full)
      --steps <n>          Sampling steps (default: 28)
      --scale <n>          CFG scale (default: 5)
      --sampler <name>     Sampler (default: k_euler)
      --seed <n>           Random seed
  -b, --batch <n>          Batch size (default: 1)
      --smea               Enable SMEA
      --smea-dyn           Enable Dynamic SMEA
  -t, --token <pst-...>    API token (or set NAI_TOKEN env)
  -h, --help               Show this help

Supported sizes (multiples of 64):
  Portrait:  832x1216, 768x1344, 896x1152
  Landscape: 1216x832, 1344x768, 1152x896
  Square:    1024x1024

Models:
  nai-diffusion-4-5-full   (V4.5 - latest, recommended)
  nai-diffusion-4-curated  (V4 Curated)
  nai-diffusion-4-inpainting

Samplers:
  k_euler, k_euler_ancestral, k_dpmpp_2m,
  k_dpmpp_2s_ancestral, k_dpmpp_sde, ddim_v3
`);
  process.exit(0);
}

// Resolve prompt (flag or positional)
const prompt = values.prompt || positionals.join(' ');
if (!prompt) {
  console.error('Error: --prompt is required');
  process.exit(1);
}

// Resolve token
const token = values.token || process.env.NAI_TOKEN;
if (!token) {
  console.error('Error: NAI_TOKEN environment variable or --token flag is required');
  process.exit(1);
}

// Parse size
const [width, height] = values.size.split('x').map(Number);
if (!width || !height || width % 64 !== 0 || height % 64 !== 0) {
  console.error(`Error: Invalid size "${values.size}". Must be WxH with multiples of 64.`);
  process.exit(1);
}

// Ensure output directory exists
const outputDir = values.output;
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Build and execute
try {
  const client = new NovelAIClient({ token, timeout: 120000 });

  const steps = parseInt(values.steps);
  const scale = parseFloat(values.scale);
  const batch = parseInt(values.batch);
  const characters = values.character || [];

  console.log(`Generating: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);
  console.log(`Model: ${values.model} | Size: ${width}x${height} | Steps: ${steps} | Scale: ${scale}`);
  if (characters.length > 0) {
    console.log(`Characters: ${characters.length}`);
  }

  let builder = client.image()
    .setModel(values.model)
    .setSize(width, height)
    .setSteps(steps)
    .setCfgScale(scale)
    .setSampler(values.sampler)
    .setBatchSize(batch);

  if (characters.length > 0) {
    builder = builder.setPrompt(prompt, characters);
  } else {
    builder = builder.setPrompt(prompt);
  }

  if (values.negative) {
    builder = builder.setNegativePrompt(values.negative);
  }

  if (values.seed) {
    builder = builder.setSeed(parseInt(values.seed));
  }

  if (values.smea || values['smea-dyn']) {
    builder = builder.enableSMEA(values['smea-dyn']);
  }

  const result = await builder.generate();

  // Save images
  for (let i = 0; i < result.images.length; i++) {
    const filename = batch > 1
      ? `${values.prefix}_${i + 1}.png`
      : `${values.prefix}.png`;
    const filepath = join(outputDir, filename);
    writeFileSync(filepath, result.images[i]);
    console.log(`Saved: ${filepath}`);
  }

  // Print metadata
  if (result.metadata?.seed !== undefined) {
    console.log(`Seed: ${result.metadata.seed}`);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
