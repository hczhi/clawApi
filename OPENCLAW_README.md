# OpenClaw 项目数据与接口管理指南

这份文档专为 OpenClaw 准备，用于快速了解本装修管理系统的前端功能模块、后端 API 接口以及对应的数据库结构与 SQL 操作。以便 OpenClaw 能够准确地编写代码、调用接口并管理项目数据。

---

## 1. 核心业务流程：购买清单 (Purchase Plans)

以**购买清单**为例，介绍前端功能、后端接口以及数据存储机制。

### 1.1 前端功能模块
购买清单相关的 Vue 组件位于 `public/app/js/components/` 目录下：
- **`PurchasePlansView.vue` (列表页)**：展示所有购买计划，支持按分类、区域、状态、购买方式进行过滤与搜索。
- **`PurchasePlanFormView.vue` (表单页)**：用于**创建**和**编辑**购买计划。包含基本信息填写、图片上传以及多个**购买方案**的添加（以 JSON 数组形式存储）。
- **`PurchasePlanDetailView.vue` (详情页)**：
  - 展示物品状态、预算对比。
  - **查看与选择方案**：可以滑动查看多个备选方案，并点击“设为选用”更新 `selected_plan_id`。
  - **状态变更**：一键将状态标记为“已购买”，触发账单记录。
  - **删除操作**：删除当前购买清单。

### 1.2 后端 API 接口 (`src/routes/purchase-plans.js`)
- `GET /api/purchase-plans`：获取购买计划列表（支持分页和多种条件查询）。
- `GET /api/purchase-plans/:id`：获取单个计划详情，包含预算对比 (`budget_diff`, `budget_ratio`)。
- `POST /api/purchase-plans`：创建新购买计划。
- `PUT /api/purchase-plans/:id`：更新购买计划（如**添加方案**、**选择方案**、修改状态等）。
- `DELETE /api/purchase-plans/:id`：删除指定的购买计划。
- `POST /api/purchase-plans/upload`：上传购买物品相关的图片（支持多图）。

### 1.3 数据库与 SQL (`src/schema.sql`)
表名：`purchase_plans`
主要字段：
- `item_name` (物品名称)
- `category_id` (分类ID)
- `estimated_budget` (预计预算), `actual_price` (实际价格)
- `status` (状态：'计划', '已购买', '取消')
- `plans` (多方案：存储为 JSON 字符串，例如 `[{"id": "1", "name": "方案A", "price": 100}]`)
- `selected_plan_id` (当前选用的方案 ID)

---

## 2. 其它核心前端功能与组件

系统的前端架构基于 Vue 组件，通过 API 与后端通信：
- **首页与空间规划**：`HomeView.vue`, `MyHomeView.vue`, `EditHomeView.vue`, `AreaDetailView.vue`
- **费用清单管理**：`ExpensesView.vue`, `ExpenseFormView.vue`, `ExpenseDetailView.vue`
- **设计灵感与方案**：`ConceptsView.vue`, `ConceptFormView.vue`, `ConceptDetailView.vue`
- **AI 助手**：`AssistantView.vue`

---

## 3. 全局后端 API 概览

所有后端路由注册于 `src/index.js`，通过 `src/routes/` 下的各模块进行处理：

1. **费用分类 (`/api/categories`)**：层级结构的预算分类（硬装、软装、家电等）。
2. **供应商 (`/api/vendors`)**：装修公司、设计师、材料商等信息的增删改查。
3. **报价对比 (`/api/quotes`)**：不同供应商的报价管理。
4. **费用清单 (`/api/expenses`)**：实际支付款项的记录（对应表 `expenses`）。
5. **设计方案 (`/api/design-concepts`)**：灵感图库与设计风格（对应表 `design_concepts`）。
6. **购买清单 (`/api/purchase-plans`)**：详见第1节。
7. **日程进度 (`/api/timeline`)**：装修关键节点与进度管理（对应表 `renovation_timeline`）。
8. **空间规划 (`/api/spaces`)**：房间面积、初始设计等（对应表 `space_planning`）。
9. **提醒事项 (`/api/reminders`)**：支付、收货、验收等重要日期的提醒。
10. **装修结果 (`/api/renovation-results`)**：完工后的实景图与评分反馈。
11. **备忘录 (`/api/memos`)**：记录灵感、笔记或链接等，支持图片与标签（对应表 `memos`）。
12. **日程表 (`/api/schedules`)**：管理装修时间线中的自定义日程和事件安排（对应表 `schedules`）。

---

## 4. 数据库引擎与特性 (`src/database.js`)

系统采用 **SQLite**（通过 `sql.js` 在内存中操作并定期持久化到 `data/renovation.db` 文件）：
- 提供了 `db.all(sql, params)`, `db.get(sql, params)`, `db.run(sql, params)` 接口供路由调用。
- **建表机制**：由于系统配置为**检测到旧表存在时跳过初始化**，当修改 `src/schema.sql` 增加新表（如 `memos`, `schedules`）时，直接启动应用不会创建新表。
  - **迁移方案**：可以使用项目根目录提供的 `node scripts/migrate.js` 脚本来执行增量建表。
- **重要辅助视图**：
  - `expense_overview`：费用预算执行总览。
  - `timeline_summary`：项目各阶段进度统计。
  - `budget_breakeven_analysis`：购买清单的超支/节省情况自动分析。

## 给 OpenClaw 的操作建议

1. **管理数据时**：请优先通过 `GET /api/...` 获取列表与详情，了解数据结构后，再使用 `POST/PUT/DELETE` 接口进行操作。
2. **多方案处理机制**：在处理购买清单（`purchase_plans`）时，若需**添加方案**，请读取原有数据中的 `plans` (JSON)，解析后 append 新方案，再通过 `PUT` 更新回去；若需**选择方案**，则更新 `selected_plan_id` 字段。
3. **关联查询**：数据库结构有较强的一致性设计（例如 `expenses.category_id` 关联 `expense_categories.id`），操作时请务必保证外键的有效性。
