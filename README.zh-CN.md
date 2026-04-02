# harness-engineer

`harness-engineer` 是一个轻量的 npm CLI，用来在仓库里初始化一套“文档即 harness”的协作骨架。

它的目标不是生成一个复杂 agent 框架，而是把未来协作真正需要长期保存的上下文落到仓库文件里，比如：

- `AGENTS.override.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `ARCHITECTURE.md`
- `docs/design-docs/...`
- `docs/exec-plans/...`
- `docs/generated/db-schema.md`
- `docs/product-specs/...`
- `docs/references/...`
- `docs/DESIGN.md`
- `docs/FRONTEND.md`
- `docs/PLANS.md`
- `docs/PRODUCT_SENSE.md`
- `docs/QUALITY_SCORE.md`
- `docs/RELIABILITY.md`
- `docs/SECURITY.md`

## 为什么这样设计

这套 CLI 默认采用 file-first 的 harness engineering 方式：

- 项目级 Codex subagent 配置也放在仓库里，而不是只存在个人本地配置
- `AGENTS.override.md` 作为唯一的 Codex 启动与协作文档
- 架构、产品、设计、可靠性、安全等知识拆到独立文档
- 多步骤任务用执行计划沉淀，而不是只存在于聊天上下文里
- Reviewer / Tester 可以直接依赖仓库内文档完成协作

## 快速开始

优先采用全局安装，这样后续可以直接使用 `harness` 命令：

```bash
npm install -g harness-engineer
```

在空项目里初始化一套 harness 文档基线：

```bash
harness init . --project-name "Acme Platform" --yes
```

在已有仓库里补齐基线并调用 Codex 补充背景文档：

```bash
harness enrich . --yes
```

然后创建一个长期任务计划：

```bash
harness task new 2026-04-02-auth-debug --class B
harness status
```

如果全局安装后找不到 `harness`，请检查 npm global bin 目录是否已经加入 PATH。

`harness enrich` 依赖本地可用的 Codex CLI；如果 Codex 已安装但尚未认证，请先执行 `codex login`。

## CLI 用法

### `init`

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

- `target-directory` 默认是 `.`
- `--project-name` 可选，不传时会根据目录名推断
- `--language en` 生成英文文档，`--language zh` 生成中文文档，`--language bilingual` 会在同一份 markdown 中同时输出英文版与中文版
- `--yes` 跳过非空目录确认
- `--force` 覆盖受管理的 harness 文件
- `--dry-run` 只预览将要写入的内容，不真正落盘

### `enrich`

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

- `enrich` 面向已有仓库，不用于空目录
- CLI 会先补齐缺失的 harness 基线文件
- `--language` 用于控制补全文档输出为英文、中文或中英双语
- 然后调用 Codex，用仓库限定提示补全文档背景信息
- `--force` 会先刷新受 harness 管理的文件，再交给 Codex
- `--dry-run` 会同时跳过文件写入和 Codex 调用

### `task new`

```bash
harness task new <slug> --class A|B|C
```

会基于 `docs/exec-plans/template.md` 生成 `docs/exec-plans/active/<slug>.md`。

### `task archive`

```bash
harness task archive <slug>
```

会把活动计划归档到 `docs/exec-plans/completed/`，并自动补齐收尾段落。

### `status`

```bash
harness status
```

会检查：

- 当前 active task
- 缺失的受管理文件
- 已漂移的受管理文件
- 缺少关键章节的执行计划

## 默认协作角色

默认模板会文档化五个协作角色：

- Orchestrator
- Planner
- Builder
- Reviewer
- Tester

现在这些角色不只是文档概念，也会同时生成到 `.codex/agents/` 里，作为 project-scoped Codex custom agents，方便显式使用 subagent 工作流。

## 本地开发

```bash
pnpm install
pnpm check
pnpm test:coverage
pnpm build
```

## 发布内容

发布包包含 `dist/` 下的编译产物，以及 `templates/` 目录里的真实模板文件。

## License

[MIT](./LICENSE)
