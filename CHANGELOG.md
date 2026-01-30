# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-30

### Changed (BREAKING)
- Renamed `setScale()` → `setCfgScale()` for clarity
- Renamed `setUCPreset()` → `setNegativePreset()` for clarity
- Renamed `setQualityToggle()` → `enableAutoQualityTags()` with default `true`

## [1.1.1] - 2026-01-30

### Changed
- Updated README with 1.1.0 features documentation

## [1.1.0] - 2026-01-30

### Added
- `enableDynamicThresholding()` method for enhanced contrast at high CFG scales
- Per-character negative prompts via `setNegativePrompt(base, characters[])` 
- `addCharacterNegative()` for incremental per-character negative prompts
- `setBatchSize(n)` to generate multiple images in a single request
- `checkPromptLength()` utility for soft warnings on long prompts (>2000 chars)
- `PromptWarning` type export for prompt length checking

### Fixed
- License field in package.json now correctly set to `Apache-2.0`

## [1.0.0] - 2026-01-30

### Added
- Initial release
- `NovelAIClient` for API authentication and configuration
- `ImageRequestBuilder` with fluent API for request construction
- V4.5 API compliance with strict schema requirements (mixed casing)
- V4-specific prompt structures (`v4_prompt`, `v4_negative_prompt`)
- Multi-character prompting support
- Isomorphic ZIP parsing (Node.js with `adm-zip`, browser with `fflate`)
- Type-safe enums: `NovelAIModel`, `NovelAISampler`, `UCPreset`, `NoiseSchedule`
- Comprehensive error hierarchy: `NovelAIAuthError`, `NovelAIPaymentError`, etc.
- Validation utilities: `validateResolution`, `validateSteps`, `validateScale`, `validateSeed`
- Helper utilities: `toBase64`, `toDataURL` for image conversion
