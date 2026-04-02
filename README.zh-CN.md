# harness-engineer

`harness-engineer` 是一个开源的 Codex 优先仓库脚手架 CLI，用来把“harness 作为文件结构”的协作方式封装成可复用 npm 包。

它可以在空白仓库中一次性生成固定角色、长期记忆、runbook、记录系统文档以及执行计划闭环，让 AI 协作方式能够直接沉淀到仓库本身。

> 许可证：[MIT](./LICENSE)
> npm 包地址：[harness-engineer](https://www.npmjs.com/package/harness-engineer)
> 更新记录：[CHANGELOG.md](./CHANGELOG.md)

## 为什么现在是这个结构

默认 preset 已按 OpenAI 的 harness engineering 文章思路调整：

- 让 Codex 入口文件保持简短
- 把仓库文档当成记录系统
- 把执行计划当成一等工件进行版本化
- 通过渐进式披露提供上下文，而不是塞一个巨大说明书

文章里使用的是 `AGENTS.md` 概念；这个工具面向 Codex，因此实际生成的是 `AGENTS.override.md`。

## 它会生成什么

- `AGENTS.override.md` 作为简短的 Codex 协作地图
- `.codex/config.toml` 和 `.codex/agents/` 下的固定角色文件
- `.codex/memory/` 下的长期记忆
- `ARCHITECTURE.md` 以及 `docs/design-docs/`、`docs/product-specs/`、`docs/generated/`、`docs/references/` 下的记录系统文档
- `docs/exec-plans/` 下的执行计划，以及 `logs/codex/` 下的运行产物
- 机器可读配置 `harness-engineer.config.json`

## 快速开始

当前版本已经发布到 npm，最快的初始化方式是：

```bash
pnpm dlx harness-engineer@latest init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes

harness-engineer task new 2026-04-02-auth-debug --class B
harness-engineer status
```

如果你是在当前源码仓库里本地运行：

```bash
pnpm install
pnpm build

node dist/cli.js init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes
```

## 安装方式

### 直接从 npm 运行

```bash
pnpm dlx harness-engineer@latest init . \
  --preset generic-software \
  --project-name "Acme Platform" \
  --language bilingual \
  --yes
```

### 安装到现有项目中

```bash
npm install -D harness-engineer
npx harness-engineer init . --preset generic-software --project-name "Acme Platform"
```

### 直接从 GitHub 安装

```bash
npm install -D git+https://github.com/Dai5297/harness-engineer-codex.git
npx harness-engineer init . --preset generic-software --project-name "Acme Platform"
```

## 预设

### `generic-software`

默认的通用 Codex 软件仓库预设。

固定角色：

- `architect-backend`
- `architect-frontend`
- `runtime-integrations`
- `product-ui`
- `reviewer`
- `qa-guard`

记录系统文档按以下结构组织：

- `ARCHITECTURE.md`
- `docs/design-docs/`
- `docs/product-specs/`
- `docs/generated/`
- `docs/references/`
- `docs/exec-plans/`

## 语言模式

`init` 支持三种输出模式：

- `en`：仅英文 harness 文件
- `zh`：中文本地化 harness 文件
- `bilingual`：双语 harness 文档，包括 `AGENTS.override.md`

三种模式都保持相同的标准文件路径。

## CLI 命令

### `init`

```bash
harness-engineer init [dir] \
  --preset <preset> \
  --project-name <name> \
  [--language en|zh|bilingual] \
  [--dev-command "<cmd>"] \
  [--force] \
  [--yes]
```

说明：

- 默认只生成缺失文件，不覆盖已有模板
- 使用 `--force` 可以覆盖受管理模板
- 传入 `--dev-command` 时会生成 `.codex/environments/environment.toml`
- `init` 会把 `harness-engineer` 自动加入 `devDependencies`

### `task new`

```bash
harness-engineer task new <slug> --class A|B|C
```

会创建：

- `docs/exec-plans/active/<slug>.md`
- `logs/codex/active/<slug>/run.md`
- `logs/codex/active/<slug>/handoff.md`

### `task archive`

```bash
harness-engineer task archive <slug>
```

会把任务从 active 移到 completed，并在 plan 中补齐结果段落。

### `status`

```bash
harness-engineer status
```

会报告：

- 当前 active 任务
- 缺失的受管理文件
- 漂移的受管理模板
- 不一致的任务产物

## 本地开发

```bash
pnpm install
pnpm test
pnpm test:coverage
pnpm build
```

仓库以源码为主，`dist/`、`coverage/` 和 `node_modules/` 都是本地产物，不应该提交。

## 测试策略

- 单元测试：渲染、配置、预设选择
- 集成测试：init、任务生命周期、CLI smoke、status 漂移检查
- 独立性校验：确保生成结果不再残留外部项目标识或本机绝对路径

## 仓库结构

```text
src/      CLI 与生成器源码
tests/    单元与集成测试
```

## 开源发布说明

准备发布更新前，请先阅读 [OPEN_SOURCE_RELEASE_CHECKLIST.md](./OPEN_SOURCE_RELEASE_CHECKLIST.md)。
