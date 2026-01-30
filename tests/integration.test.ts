/**
 * Optional live integration test for NovelAI SDK
 *
 * This test makes a real API call and consumes Anlas credits.
 * Run manually with: npm run test:live
 *
 * Requires environment variable: NAI_TOKEN
 */
import { describe, it, expect } from 'vitest';
import { NovelAIClient, NovelAIModel, NovelAISampler } from '../src';
import * as fs from 'fs';
import * as path from 'path';

// Skip if no token provided
const NAI_TOKEN = process.env.NAI_TOKEN;

describe.skipIf(!NAI_TOKEN)('Live Integration Test', () => {
  it('should generate an image from the live API', async () => {
    const client = new NovelAIClient({ token: NAI_TOKEN! });

    const result = await client.image()
      .setModel(NovelAIModel.V45_Full)
      .setPrompt('1girl, cyberpunk, neon lights, city background')
      .setSize(832, 1216)
      .setSteps(23)
      .setScale(5.0)
      .setSampler(NovelAISampler.EulerAncestral)
      .generate();

    // Verify we got an image
    expect(result.images).toHaveLength(1);
    expect(result.images[0]).toBeInstanceOf(Uint8Array);
    expect(result.images[0].length).toBeGreaterThan(1000); // Should be a real PNG

    // Verify PNG signature
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    for (let i = 0; i < 8; i++) {
      expect(result.images[0][i]).toBe(pngSignature[i]);
    }

    // Optionally save the output for visual inspection
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, `integration-test-${Date.now()}.png`),
      result.images[0]
    );

    console.log('✓ Image generated successfully and saved to output/');
  }, { timeout: 120000 }); // 2 minute timeout for generation
});
