---
name: "issue-troubleshooting"
description: "记录与复用前端/全栈问题排查路径与结论。Invoke when 出现“事件触发但界面不更新/跳转不生效”、疑似多实例状态、或需要沉淀排查案例时。"
---

# 问题排查（Issue Troubleshooting）

用于把“现象 → 定位 → 根因 → 修复 → 验证”沉淀成可复用的排查剧本，尤其适合移动端单页（Vue + vue3-sfc-loader）这类容易出现“看起来点到了但不跳转”的问题。

## 标准排查流程

### 1) 先定性：是没触发点击，还是触发了但状态没生效

- 在点击事件入口处做最小验证：确认 handler 真的被调用（优先用断点/DevTools，不要污染代码）
- 如果 handler 被调用但界面不变：优先怀疑
  - 状态不是同一个实例（多 store、多 app）
  - handler 中途抛异常导致后续逻辑没执行
  - 视图切换条件依赖的字段没变（watch/computed 不在同一响应式图上）

### 2) 快速验证：当前视图切换机制是什么

- 本项目（/public/app）采用 `state.currentView` + `<component :is="currentViewComponent">` 的方式切换
- 所以“跳转不生效”可以等价为：根应用读到的 `state.currentView` 没变

### 3) 检查“同名但不同实例”的高风险点

- `vue3-sfc-loader` 的 `moduleCache` key 必须和组件里实际 `import` 的路径完全一致
- 一旦路径不一致，loader 可能再次加载同一个模块文件，导致：
  - `store.js` 被执行两次
  - `reactive state` 变成两份
  - 组件 A 改的是 state#1，根应用渲染的是 state#2

## 案例库

### 案例：HomeView 点“账单”不跳转，但按钮可点击

**现象**
- 首页左侧“账单”按钮可点击（能点中），但页面不切换到账单列表
- 同时存在“首页总费用进入首页不显示，需要点账单后才显示”的伴随现象

**关键判断**
- 点击事件触发，但根应用视图未更新：优先怀疑“多 store 实例”

**根因**
- `vue3-sfc-loader` 解析 SFC 内 `import { useAppStore } from '../store.js'` 时，实际命中的模块路径 key 与根应用缓存的 key 不一致
- 结果：loader 又加载了一份 store，产生了两套响应式状态
- `HomeView` 调用的 `actions.navigate()` 修改的是“组件自己的 state”，根应用展示的是“另一份 state”，所以看起来“点了但不跳转”

**修复**
- 在 SFC loader 的 `moduleCache` 同时缓存多种可能的路径 key，强制复用同一个 `useAppStore`
- 位置：`public/app/js/app.js` 的 `options.moduleCache`
- 修复示例（已落地）：同时加入 `../store.js`、`./store.js`、`/app/js/store.js` 的映射到同一个 `useAppStore`

**验证**
- 刷新 `/app/`，点击“账单”立即切换到 `ExpensesView`
- 在任意子组件调用 `actions.navigate()`，根应用 `state.currentView` 同步更新

**相关的伴随修复（数据汇总）**
- 首页“总费用”在 `fetchHomeData()` 中的汇总逻辑要避免依赖不一致的 `status` 字段（历史数据可能为空或不同枚举）
- 建议：首页汇总与账单页汇总统一口径，或直接提供后端 `/api/expenses/stats/overview` 作为唯一数据源

## 常见坑位清单（速查）

- 事件触发但 UI 不动：先查是否存在“两个 store / 两个 app / 两份 reactive”
- `vue3-sfc-loader`：`moduleCache` key 必须覆盖实际 import 形式（相对路径、绝对路径、不同层级）
- 全局库：调用 `lucide`、`dayjs` 这类全局对象时，优先使用 `window.xxx` 并做存在性判断，避免抛错中断事件链

