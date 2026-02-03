<div align="center">

# NovelAI Image SDK

**类型安全的 TypeScript SDK & CLI，用于 NovelAI V4.5 图像生成 API**

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

## ✨ 特性

- 🎨 **流畅的 Builder API** — 链式调用，直觉式配置
- 🖥️ **CLI 工具 (`nai-gen`)** — 命令行直接生成图片
- 📦 **同构** — 支持 Node.js 和浏览器
- 🔒 **类型安全** — 完整 TypeScript 类型 + 枚举
- ⚡ **V4.5 兼容** — 严格实现 `nai-diffusion-4-5-full` 的 schema 要求
- 🎭 **多角色支持** — 内置 V4.5 多角色 prompt 机制
- 🛡️ **完善的错误处理** — 类型化错误（认证、限流、参数校验等）

## 📦 安装

```bash
# 作为库使用
npm install novelai-image-sdk

# 作为全局 CLI 工具
npm install -g novelai-image-sdk
```

## 🖥️ CLI 使用

全局安装后，`nai-gen` 命令即可使用：

```bash
# 设置 token
export NAI_TOKEN="pst-..."

# 基本生成（竖图）
nai-gen --prompt "1girl, silver hair, maid outfit, night window"

# 横图 + 自定义参数
nai-gen -p "cityscape, neon lights, rain" -s 1216x832 --steps 28 -o ./output

# 多角色场景
nai-gen -p "cafe scene" -c "girl, blue hair, eating" -c "boy, red hoodie, drinking"

# 完整控制
nai-gen -p "1girl, detailed" -n "lowres, bad anatomy" \
  --size 832x1216 --steps 28 --scale 5 --sampler k_euler \
  --smea-dyn --seed 12345 -o /tmp/nai --prefix myimage
```

<details>
<summary><b>📋 全部 CLI 选项</b></summary>

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `-p, --prompt` | *（必填）* | 基础 prompt |
| `-c, --character` | — | 角色 prompt（可重复使用，支持多角色） |
| `-n, --negative` | — | 负面 prompt |
| `-o, --output` | `.` | 输出目录 |
| `--prefix` | `nai` | 文件名前缀 |
| `-s, --size` | `832x1216` | 图片尺寸（宽x高，必须是 64 的倍数） |
| `-m, --model` | `nai-diffusion-4-5-full` | 模型名 |
| `--steps` | `28` | 采样步数 (1–50) |
| `--scale` | `5` | CFG 引导强度 (0–10) |
| `--sampler` | `k_euler` | 采样算法 |
| `--seed` | 随机 | 随机种子（用于复现） |
| `-b, --batch` | `1` | 每次生成图片数 |
| `--smea` | 关 | 启用 SMEA |
| `--smea-dyn` | 关 | 启用 Dynamic SMEA |
| `-t, --token` | `$NAI_TOKEN` | API token（也可用环境变量） |
| `-h, --help` | — | 显示帮助 |

</details>

## 🚀 SDK 快速开始

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

## 📖 API 参考

### 客户端配置

```typescript
const client = new NovelAIClient({
  token: 'pst-...',              // 必填：持久化 API Token
  baseUrl: 'https://...',        // 可选：自定义 API 端点
  timeout: 60000,                // 可选：请求超时（毫秒）
});
```

### Builder 方法

| 方法 | 说明 |
|------|------|
| `.setModel(model)` | 设置生成模型 |
| `.setSize(width, height)` | 图片尺寸（64 的倍数） |
| `.setPrompt(base, characters?)` | 设置基础 prompt 和可选角色数组 |
| `.addCharacter(prompt)` | 添加角色 prompt |
| `.setNegativePrompt(base, charNegatives?)` | 设置负面 prompt（支持分角色） |
| `.setSeed(seed)` | 随机种子 |
| `.setSteps(steps)` | 采样步数 (1–50) |
| `.setCfgScale(scale)` | CFG 引导强度 (0–10) |
| `.setBatchSize(n)` | 批量生成数 |
| `.setSampler(sampler)` | 采样算法 |
| `.enableSMEA(dynamic?)` | 启用 SMEA / Dynamic SMEA |
| `.enableAutoQualityTags(enabled?)` | 自动质量标签（默认开启） |
| `.generate()` | 执行生成请求 |

### 多角色 Prompt

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

### 错误处理

```typescript
import { 
  NovelAIAuthError,       // 401 — token 无效
  NovelAIPaymentError,    // 402 — Anlas 不足
  NovelAIValidationError, // 400 — 参数无效
  NovelAIRateLimitError,  // 429 — 限流（包含 retryAfter）
  NovelAIServerError      // 500 — 服务端错误
} from 'novelai-image-sdk';

try {
  await client.image().setPrompt('test').generate();
} catch (error) {
  if (error instanceof NovelAIRateLimitError) {
    console.log(`请在 ${error.retryAfter} 秒后重试`);
  }
}
```

## 📐 推荐尺寸

尺寸必须是 64 的倍数：

| 比例 | 竖图 | 横图 | 方图 |
|------|------|------|------|
| 3:4 | 832×1216 | 1216×832 | — |
| 1:1 | — | — | 1024×1024 |
| 2:3 | 768×1152 | 1152×768 | — |
| 9:16 | 768×1344 | 1344×768 | — |

## 🎨 可用模型

| 模型 | ID | 说明 |
|------|----|------|
| **V4.5 Full** | `nai-diffusion-4-5-full` | 最新模型，最佳画质，支持多角色 |
| V4 Curated | `nai-diffusion-4-curated` | 更保守的审美风格 |
| Inpainting | `nai-diffusion-4-inpainting` | 图像编辑 / 局部重绘 |

## 🔑 获取 API Token

1. 前往 [NovelAI](https://novelai.net) 并登录
2. 进入 **账户设置**
3. 生成 **持久化 API Token**（以 `pst-` 开头）

> ⚠️ 请勿将 token 提交到版本控制中。请使用环境变量。

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

[Apache License 2.0](./LICENSE) — 详见 [LICENSE](./LICENSE) 文件。

---

<div align="center">

为 NovelAI 社区用 ❤️ 打造

</div>
