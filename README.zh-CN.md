# harness-engineer

`harness-engineer` 是一个用于初始化仓库级 AI 协作文档的 npm CLI。

安装后会提供 `harness` 命令，用来在仓库里建立一套持久、file-first 的工作上下文，让 Codex 和其他 agent 依赖仓库文件协作，而不是依赖一个越来越长的提示词或一段会消失的聊天记录。

[English README](./README.md)

## 为什么要用它

很多 AI 辅助开发仓库都会遇到同样的问题：

- 规则散落在提示词、聊天记录和个人笔记里
- 架构背景缺失或很快过期
- 多步骤工作没有可追溯的执行记录
- 每次新开 agent 会话都要重新理解仓库

`harness-engineer` 的做法是把这套上下文直接落到仓库里：

- `AGENTS.override.md` 作为 Codex 启动入口和协作契约
- `.codex/config.toml` 与 `.codex/agents/*.toml` 作为项目级 subagent 配置
- `ARCHITECTURE.md` 记录系统边界与改动影响
- `docs/` 记录产品、设计、安全、可靠性、参考资料和执行计划
- `harness-engineer.config.json` 让后续 CLI 命令理解当前仓库的 harness 配置

## 功能特性

- 同时支持空项目初始化和已有仓库补全
- 生成真实文件模板，而不是把 markdown 大段硬编码进 TypeScript
- 提供 `harness enrich`，对已有仓库执行受约束的 `codex exec` 文档补全
- 支持 `en`、`zh`、`bilingual` 三种输出模式
- 通过 `harness status` 检测受管理文档缺失和漂移
- 通过 `harness task` 创建和归档可长期维护的执行计划

## 环境要求

- Node.js `>= 20`
- 任意可安装 npm 包的包管理器，例如 npm 或 pnpm
- 如果要使用 `harness enrich`：本地需要可用的 Codex CLI，并且已经登录

## 安装

全局安装：

```bash
npm install -g harness-engineer
```

安装后会在 PATH 中暴露一个命令：

```bash
harness --version
```

如果安装后仍然找不到 `harness`，通常是 npm global bin 目录还没有加入 PATH。

## 快速开始

### 1. 初始化一个新项目

```bash
mkdir acme-platform
cd acme-platform
harness init . --project-name "Acme Platform" --yes
```

### 2. 补全一个已有仓库

```bash
cd existing-repo
harness enrich . --yes
```

这条命令会：

1. 补齐缺失的 harness 基线文件
2. 不去修改现有业务代码
3. 调用 `codex exec`，基于仓库事实补全文档背景信息

### 3. 创建一个可追踪执行计划

```bash
harness task new 2026-04-02-auth-debug --class B
harness status
```

## 会生成什么

默认的 `generic-software` preset 会生成类似这样的结构：

```text
.
├── AGENTS.override.md
├── ARCHITECTURE.md
├── harness-engineer.config.json
├── .codex/
│   ├── config.toml
│   └── agents/
│       ├── orchestrator.toml
│       ├── planner.toml
│       ├── builder.toml
│       ├── reviewer.toml
│       └── tester.toml
└── docs/
    ├── index.md
    ├── DESIGN.md
    ├── FRONTEND.md
    ├── PLANS.md
    ├── PRODUCT_SENSE.md
    ├── QUALITY_SCORE.md
    ├── RELIABILITY.md
    ├── SECURITY.md
    ├── design-docs/
    ├── exec-plans/
    ├── generated/
    ├── product-specs/
    └── references/
```

## 命令说明

### `harness init`

在新目录或尚未建立 harness 基线的目录中初始化脚手架。

```bash
harness init [target-directory] \
  [--project-name <name>] \
  [--preset generic-software] \
  [--language en|zh|bilingual] \
  [--force] \
  [--yes] \
  [--dry-run]
```

说明：

- `target-directory` 默认为 `.`
- `--project-name` 不传时会根据目录名自动推断
- `--yes` 跳过非空目录确认
- `--force` 刷新受 harness 管理的文件
- `--dry-run` 只预览写入计划，不真正落盘

### `harness enrich`

先补齐已有仓库缺失的 harness 文件，再调用 Codex 补完项目背景文档。

```bash
harness enrich [target-directory] \
  [--project-name <name>] \
  [--preset generic-software] \
  [--language en|zh|bilingual] \
  [--force] \
  [--yes] \
  [--dry-run]
```

说明：

- 面向已有仓库，不适用于空目录
- 在 Codex 运行前，只会创建或刷新受 harness 管理的文档
- 不会修改业务代码、依赖、锁文件或 CI 配置
- `--dry-run` 会同时跳过文件写入和 Codex 调用

### `harness task new`

基于 `docs/exec-plans/template.md` 创建执行计划。

```bash
harness task new <slug> --class A|B|C
```

### `harness task archive`

把活动计划移动到 `docs/exec-plans/completed/`，并在必要时补上收尾章节。

```bash
harness task archive <slug>
```

### `harness status`

检查当前仓库的 harness 健康度。

```bash
harness status
```

会报告：

- 当前活跃计划
- 缺失的受管理文件
- 已漂移的受管理文件
- 缺少必要章节的执行计划

## 语言模式

`harness-engineer` 支持三种语言模式：

- `en`：生成英文文档
- `zh`：生成中文文档
- `bilingual`：在同一份 markdown 中同时生成英文与中文内容

这套语言模式同时适用于 `init`、`enrich`，以及后续 `harness task` 使用的执行计划模板。

## `enrich` 的工作方式

`harness enrich` 默认是保守的。

在调用 Codex 之前，CLI 会先补齐受管理的基础文档。之后它会运行一段受约束的 `codex exec` prompt，明确要求 Codex：

- 只在 harness 管理的文档范围内工作
- 基于仓库证据恢复上下文
- 不修改源码、依赖、锁文件和 CI
- 对不确定的信息明确标注，而不是凭空补全

因此它更适合“给现有代码库补文档背景”，而不是“做一条会改代码的迁移命令”。

## 默认角色模型

默认脚手架会文档化五个协作角色：

- Orchestrator
- Planner
- Builder
- Reviewer
- Tester

这些角色既会出现在生成的文档里，也会生成到 `.codex/agents/` 下作为项目级 Codex custom agents，这样显式 subagent 委派时可以直接复用同一套词汇。

## 典型工作流

```bash
# 初始化一个新仓库
harness init . --project-name "Acme Platform" --language bilingual --yes

# 创建执行计划
harness task new 2026-04-02-onboarding-flow --class B

# 检查当前 scaffold 健康度
harness status

# 或者给已有仓库补文档
harness enrich . --yes
```

## 延伸阅读

如果你想进一步理解这个项目背后的 Codex 工作方式，下面这些 OpenAI 官方资料最值得先看：

- [Codex CLI](https://developers.openai.com/codex/cli)：理解 `harness enrich` 背后依赖的命令行运行方式
- [Codex Subagents](https://developers.openai.com/codex/subagents)：理解项目级自定义 agent 和委派模式
- [Codex Prompting Guide](https://developers.openai.com/codex/prompting)：学习如何编写更强的仓库上下文提示词
- [OpenAI Developers Resources](https://developers.openai.com/resources)：查看更新的 Codex cookbook、指南和工作流文章

## 常见问题

### `harness: command not found`

通常是 npm global bin 目录没有加入 PATH。重新打开终端，或者把 npm global bin 路径加入 shell profile。

### `harness enrich` 提示找不到 Codex

先安装并登录 Codex CLI：

```bash
codex login
```

然后重新执行：

```bash
harness enrich . --yes
```

### 仓库里已经有自己的文档怎么办

这是正常情况。默认模式下，CLI 只会创建缺失的受管理文件。只有在你明确传入 `--force` 时，才会刷新 harness 管理的基线文档。

## 本地开发

```bash
pnpm install
pnpm check
pnpm test:coverage
pnpm build
```

发布前建议执行：

```bash
pnpm release:check
```

## 发布包内容

发布到 npm 的包包含：

- `dist/` 下的运行时代码
- `templates/` 下的 scaffold 模板
- `README.md`、`README.zh-CN.md`、`CHANGELOG.md` 等包级文档

## 贡献

欢迎贡献。如果你想改进 scaffold 结构、命令体验或模板质量，可以先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
