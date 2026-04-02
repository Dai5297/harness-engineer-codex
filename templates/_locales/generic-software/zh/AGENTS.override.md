# {{projectName}} Codex 协作指南

偏好协作语言：`{{languageDisplay}}`

## 目的

这个仓库采用 file-first 的 harness engineering 方式。Agent 在依赖聊天上下文或临时提示词之前，应先从仓库文档中恢复项目背景。

## 主线程策略

根 Codex 会话只负责编排，不直接落地实现。

1. 先读取仓库上下文并决定委派顺序。
2. 规划、实现、评审、验证都优先交给对应的 subagent。
3. 根会话不要直接写仓库文件，也不要直接实现代码。
4. 如果当前没有合适的可写 subagent，就停止并明确报告阻塞，而不是在根会话里直接实现。

## 优先阅读顺序

1. `.codex/config.toml`
2. 相关的 `.codex/agents/*.toml`
3. `ARCHITECTURE.md`
4. `docs/index.md`
5. 如果存在，再看当前活跃的执行计划
6. 最后才是代码与测试

## 默认角色

{{#list roleSummaries}}

## 职责边界

{{#list roleOwnership}}

## 预期产出

{{#list roleOutputs}}

## 协作顺序

{{#list collaborationSequence}}

## 仓库内事实来源

{{#list documentationAreas}}

## Codex subagents

{{#list subagentUsage}}

项目级 agent 文件：

{{#list subagentPaths}}

## 工作约定

1. 先委派给最合适的子代理，不要让根会话变成实际的实现代理。
2. 当行为、约束或接口发生变化时，在同一变更里同步更新 `ARCHITECTURE.md`、规格或计划。
3. `docs/generated/` 只放本地证据，不要把主观猜测写进去。
4. 评审结论与验证结果要明确写出来，不要藏在叙述里。
5. 如果任务会跨越多个回合，就先创建或更新执行计划，避免实现和上下文逐渐漂移。
