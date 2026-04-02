# {{projectName}} 文档索引

把这个文件当成面向人和 agent 的仓库地图。

## 核心文档

{{#list documentationAreas}}

- `AGENTS.override.md` 是 Codex 的启动入口与协作指南
- `.codex/config.toml` 用于仓库级 subagent 运行参数
- `.codex/agents/*.toml` 用于项目级自定义 agent，服务显式 subagent 工作流

## 推荐阅读顺序

1. `AGENTS.override.md`
2. `.codex/config.toml` 以及相关的 `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. `docs/` 下最相关的文档
5. 如果存在，再看当前活跃执行计划
6. 最后才是代码与测试

## 文档规则

- 优先新增一份锋利的文档，而不是把 `AGENTS.override.md` 越写越肿。
- 每份文档都应足够有判断力，能支持真实决策。
- 如果文档过时了，就更新它，或者明确标出漂移。
- 生成型产物应放在 `docs/generated/`，不要塞进手写设计文档。

