# harness-engineer

`harness-engineer` 是一个面向 Codex 的仓库协作脚手架 CLI，用来把“harness 作为文件结构”的工作方式封装成可复用 npm 包。

它可以在一个空白仓库里一次性生成固定角色、长期记忆、runbook、任务计划与 handoff 结构，适合团队把 AI 协作流程沉淀为仓库内真源。

> 许可证：[MIT](./LICENSE)
> npm 包地址：[harness-engineer](https://www.npmjs.com/package/harness-engineer)

## 它会生成什么

- `AGENTS.md` 作为最短协作入口
- `.codex/config.toml` 和 `.codex/agents/` 下的固定角色文件
- `.codex/memory/` 下的长期记忆
- `docs/index.md`、runbook 和真源文档占位
- `docs/plans/` 与 `logs/codex/` 下的任务闭环目录
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

真源文档落在 `docs/source-of-truth/`。

### `agentadmin-codex`

从 AgentAdmin harness 抽取出来的兼容预设。

它保留 AgentAdmin 当前的文档分层方式（`dev-docs/ + spec/`）和固定角色命名：

- `architect-backend`
- `architect-frontend`
- `runtime-executor`
- `console-ui`
- `reviewer`
- `qa-guard`

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

- 默认只生成缺失文件，不覆盖已有模板。
- 使用 `--force` 可以覆盖受管理模板。
- 传入 `--dev-command` 时会生成 `.codex/environments/environment.toml`。
- `init` 会把 `harness-engineer` 自动加入 `devDependencies`。
- `--language bilingual` 会保留标准 `AGENTS.md`，并额外生成双语版 `AGENTS.override.md` 与本地化核心 harness 文档。

### `task new`

```bash
harness-engineer task new <slug> --class A|B|C
```

会创建：

- `docs/plans/active/<slug>.md`
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
- 兼容性测试：`tests/integration/agentadmin-golden.test.ts`

## 仓库结构

```text
src/      CLI 与生成器源码
tests/    单元、集成与 fixture 兼容性测试
```

## 开源发布说明

准备发布更新前，请先阅读 [OPEN_SOURCE_RELEASE_CHECKLIST.md](./OPEN_SOURCE_RELEASE_CHECKLIST.md)。
