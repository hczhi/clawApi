# 🦁 装修管理系统 API 文档

**版本**: 1.0.0  
**基础 URL**: `http://localhost:3000`  
**状态**: ✅ 运行中

---

## 📚 目录

- [快速开始](#快速开始)
- [认证说明](#认证说明)
- [数据模型](#数据模型)
- [接口列表](#接口列表)
- [错误码](#错误码)

---

## 快速开始

### 1. 数据库初始化

系统使用 SQLite 数据库，首次启动会自动初始化表结构和测试数据。

```bash
cd /home/node/clawd/renovation-api
npm start
```

### 2. 健康检查

```bash
curl http://localhost:3000/api/health
```

---

## 数据模型

### expense_categories (费用分类)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 分类名称（必填） |
| parent_id | INTEGER | 父分类 ID（支持多级） |
| level | INTEGER | 层级深度 |
| sort_order | INTEGER | 排序顺序 |
| color_code | TEXT | 前端色码 |
| notes | TEXT | 备注 |

### vendors (供应商)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 供应商名称（必填） |
| type | TEXT | 类型：designer/contractor/material_supplier/appliance_store/installer/other |
| contact_person | TEXT | 联系人 |
| phone | TEXT | 电话 |
| email | TEXT | 邮箱 |
| rating | DECIMAL | 评分 0-5 |
| status | TEXT | active/inactive/blacklisted |

### quotes (报价对比)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| vendor_id | INTEGER | 供应商 ID（必填） |
| category_id | INTEGER | 分类 ID（必填） |
| project_name | TEXT | 项目名称/品类（必填） |
| amount | DECIMAL | 报价金额 |
| status | TEXT | pending/selected/rejected |
| validity_end | DATE | 有效期截止 |

### expenses (费用清单)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| category_id | INTEGER | 分类 ID（必填） |
| title | TEXT | 支付内容标题（必填） |
| amount | DECIMAL | 金额（必填） |
| payment_method | TEXT | cash/bank_transfer/wechat/alipay/credit_card/other |
| payer_names | TEXT | 支付人列表（逗号分隔，支持多人） |
| payment_date | DATE | 支付日期（必填） |
| quote_id | INTEGER | 关联报价单 |
| receipt_file_path | TEXT | 合同/票据路径 |

### design_concepts (设计方案)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 方案标题（必填） |
| style | TEXT | 风格（现代/北欧/日式等） |
| category | TEXT | 类别（客厅/卧室等） |
| source_type | TEXT | xiaohongshu/haozhu/instagram/pinterest/other |
| image_urls | TEXT | 图片 URL 数组 |
| reference_link | TEXT | 原始链接 |

### purchase_plans (购买计划)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| item_name | TEXT | 物品名称（必填） |
| category_id | INTEGER | 分类 ID（必填） |
| estimated_budget | DECIMAL | 预算金额 |
| actual_price | DECIMAL | 实际购买价 |
| status | TEXT | todo/in_progress/purchased/delivered/installed/cancelled |

### renovation_timeline (日程进度) ⭐
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 事件名称（必填） |
| phase | TEXT | 阶段：拆改/水电/泥木/油漆/安装/保洁 |
| planned_start | DATE | 计划开始日期（必填） |
| planned_end | DATE | 计划结束日期（必填） |
| actual_start | DATE | 实际开始日期 |
| actual_end | DATE | 实际结束日期 |
| status | TEXT | not_started/in_progress/completed/delayed/cancelled |
| progress_percent | INTEGER | 进度 0-100 |
| quality_check_passed | BOOLEAN | 是否通过验收 |

### spaces (空间规划)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| room_name | TEXT | 房间名（唯一，必填） |
| area | DECIMAL | 面积（平方米） |
| priority_level | INTEGER | 优先级 1-5 |

### reminders (提醒事项)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 提醒标题（必填） |
| due_date | DATE | 截止日期（必填） |
| reminder_date | DATE | 提前提醒日期（必填） |
| entity_type | TEXT | 关联实体类型 |
| entity_id | INTEGER | 关联实体 ID |

### renovation_results (装修结果)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 标题（必填） |
| space_name | TEXT | 装修区域（必填） |
| overall_rating | INTEGER | 综合评分 1-10 |
| lessons_learned | TEXT | 经验教训 |

---

## 接口列表

### 🔍 通用查询参数
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20）
- `search`: 全局搜索关键词
- `status`: 过滤状态
- `date_from`: 开始日期 (YYYY-MM-DD)
- `date_to`: 结束日期 (YYYY-MM-DD)

---

### 费用分类 API

#### GET `/api/categories`
获取费用分类列表

**Query Parameters:**
- `level`: 按层级过滤
- `parent_id`: 按父分类过滤

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "硬装",
      "level": 1,
      "sort_order": 1
    }
  ]
}
```

#### POST `/api/categories`
创建新分类

**Request Body:**
```json
{
  "name": "智能设备",
  "parent_id": 3,
  "color_code": "#4CAF50"
}
```

#### PUT `/api/categories/:id`
更新分类

#### DELETE `/api/categories/:id`
删除分类（无子项和无引用时）

---

### 供应商 API

#### GET `/api/vendors`
获取供应商列表

**Query Parameters:**
- `type`: 供应商类型
- `status`: 状态
- `search`: 搜索名称/联系人

**Example:**
```bash
curl 'http://localhost:3000/api/vendors?type=contractor&search=张'
```

#### POST `/api/vendors`
创建供应商

```json
{
  "name": "XX 装修公司",
  "type": "contractor",
  "contact_person": "张三",
  "phone": "13800138000",
  "email": "example@email.com",
  "rating": 4.5
}
```

#### PUT `/api/vendors/:id`
更新供应商信息

---

### 报价对比 API

#### GET `/api/quotes`
获取报价列表（带分页）

**Query Parameters:**
- `vendor_id`: 按供应商过滤
- `category_id`: 按分类过滤
- `status`: pending/selected/rejected
- `priority`: high/medium/low

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vendor_id": 1,
      "project_name": "全屋水电改造",
      "amount": 25000.00,
      "status": "pending",
      "validity_end": "2026-04-30"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### POST `/api/quotes`
创建报价记录

```json
{
  "vendor_id": 1,
  "category_id": 1,
  "project_name": "瓷砖铺贴",
  "description": "含人工和材料",
  "amount": 18000,
  "validity_end": "2026-04-15"
}
```

---

### 费用清单 API

#### GET `/api/expenses`
获取费用记录列表

**特色功能:**
- 支持多支付人追踪
- 可关联原始报价单
- 自动计算报销状态

**示例查询：**
```bash
# 2026 年 3 月所有支出
curl 'http://localhost:3000/api/expenses?date_from=2026-03-01&date_to=2026-03-31'

# 某供应商的所有支出
curl 'http://localhost:3000/api/expenses?vendor_id=1'
```

#### GET `/api/expenses/stats/overview`
📊 获取费用统计概览

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_count": 127,
      "total_amount": 156890.50,
      "avg_amount": 1235.36
    },
    "by_category": [
      {"category": "拆改工程", "count": 5, "amount": 15000},
      {"category": "水电工程", "count": 3, "amount": 28000}
    ],
    "by_payment_method": [
      {"payment_method": "wechat", "count": 89, "amount": 98000},
      {"payment_method": "alipay", "count": 38, "amount": 58890.50}
    ]
  }
}
```

#### POST `/api/expenses`
创建费用记录

```json
{
  "category_id": 2,
  "quote_id": 1,
  "title": "XX 装修公司首付款",
  "amount": 30000,
  "payment_method": "bank_transfer",
  "payer_names": "洪成智，李梅",
  "payment_date": "2026-03-28",
  "reimbursement_status": "partial"
}
```

---

### 设计方案 API

#### GET `/api/design-concepts`
获取设计灵感列表

**过滤选项:**
- `style`: 风格筛选（现代/北欧/日式等）
- `source_type`: 平台来源
- `priority`: 优先级

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "简约现代客厅",
      "style": "现代",
      "category": "客厅",
      "source_type": "xiaohongshu",
      "image_urls": "url1,url2,url3",
      "reference_link": "https://...",
      "budget_min": 50000,
      "budget_max": 80000
    }
  ]
}
```

#### POST `/api/design-concepts`
保存设计灵感

---

### 购买计划 API

#### GET `/api/purchase-plans`
获取待购物品清单

**自动计算功能:**
```bash
# 查看超支情况
GET /api/purchase-plans/stats/budget-analysis
```

**Response:**
```json
{
  "item_name": "海尔中央空调",
  "estimated_budget": 35000,
  "actual_price": 32800,
  "over_under_budget": -2200,
  "status_text": "节省"
}
```

#### POST `/api/purchase-plans`
添加购买计划

```json
{
  "item_name": "林氏家居沙发",
  "category_id": 5,
  "estimated_budget": 8000,
  "estimated_purchase_date": "2026-04-15",
  "installation_required": true,
  "scheduled_installation_date": "2026-04-20"
}
```

---

### 日程进度 API ⭐

#### GET `/api/timeline`
获取装修时间线

**核心功能:**
- 📅 计划 vs 实际时间对比
- 🎯 按阶段分组统计
- ⏰ 延期预警

**Query Parameters:**
- `phase`: 拆改/水电/泥木/油漆/安装/保洁
- `status`: not_started/in_progress/completed/delayed

#### GET `/api/timeline/stats`
📊 项目进度总览

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "total_tasks": 45,
      "completed_tasks": 23,
      "completion_rate": 51.11
    },
    "by_phase": [
      {"phase": "拆改", "total_tasks": 5, "completion_rate": 100},
      {"phase": "水电", "total_tasks": 8, "completion_rate": 75},
      {"phase": "泥木", "total_tasks": 12, "completion_rate": 33.33}
    ],
    "delayed_count": 3,
    "pending_inspections": 5
  }
}
```

#### POST `/api/timeline`
创建进度里程碑

```json
{
  "title": "水电验收",
  "phase": "水电",
  "milestone_type": "key_milestone",
  "planned_start": "2026-04-05",
  "planned_end": "2026-04-07",
  "responsible_party": "XX 装修公司",
  "vendor_id": 1,
  "notes": "需业主现场确认点位"
}
```

#### PUT `/api/timeline/:id`
更新进度（完成时）

```json
{
  "actual_start": "2026-04-05",
  "actual_end": "2026-04-06",
  "status": "completed",
  "progress_percent": 100,
  "quality_check_passed": true,
  "inspection_notes": "验收合格，无明显问题"
}
```

---

### 空间规划 API

#### GET `/api/spaces`
获取房屋空间列表

```json
{
  "success": true,
  "data": [
    {
      "room_name": "客厅",
      "area": 35.5,
      "priority_level": 1,
      "original_plan": "南北通透，采光好"
    },
    {
      "room_name": "主卧",
      "area": 18.2,
      "priority_level": 2
    }
  ]
}
```

#### POST `/api/spaces`
添加空间配置

```json
{
  "room_name": "次卧",
  "area": 12.5,
  "original_plan": "朝北，较小但方正",
  "priority_level": 3
}
```

---

### 提醒事项 API

#### GET `/api/reminders/upcoming`
获取即将到期的提醒（默认 7 天内）

**Request:**
```bash
# 获取未来 14 天内的提醒
GET /api/reminders/upcoming?days=14
```

#### POST `/api/reminders`
创建提醒

```json
{
  "title": "付第二期工程款",
  "reminder_type": "payment",
  "due_date": "2026-04-15",
  "reminder_date": "2026-04-10",
  "entity_type": "expense",
  "entity_id": 5
}
```

---

### 装修结果 API

#### GET `/api/renovation-results`
获取装修效果记录

#### POST `/api/renovation-results`
记录装修成果

```json
{
  "title": "客厅完工",
  "space_name": "客厅",
  "task_id": 3,
  "photo_before_url": "before.jpg",
  "photo_after_url": "after.jpg",
  "video_url": "tour.mp4",
  "overall_rating": 9,
  "quality_rating": 8,
  "material_rating": 9,
  "aesthetics_rating": 10,
  "experience_notes": "灯光设计很赞，就是插座位置不够",
  "lessons_learned": "卫生间需要做干湿分离",
  "tags": "重点，推荐"
}
```

---

## 辅助视图

系统提供以下内置视图用于统计分析：

```sql
-- 预算执行总览
SELECT * FROM expense_overview;

-- 各阶段进度
SELECT * FROM timeline_summary;

-- 购买预算对比
SELECT * FROM budget_breakeven_analysis;
```

---

## 工作流程示例

### 场景 1: 管理装修公司报价

```bash
# 1. 创建供应商
POST /api/vendors
{
  "name": "宏达装饰",
  "type": "contractor",
  "contact_person": "王经理",
  "phone": "138****1234"
}

# 2. 提交报价
POST /api/quotes
{
  "vendor_id": 1,
  "category_id": 1,
  "project_name": "全包套餐",
  "amount": 128000,
  "validity_end": "2026-04-30"
}

# 3. 对比多个供应商后选定
PUT /api/quotes/1
{
  "status": "selected"
}
```

### 场景 2: 记录施工款项

```bash
# 1. 第一笔工程款
POST /api/expenses
{
  "category_id": 1,
  "quote_id": 1,
  "title": "开工预付款",
  "amount": 38400,
  "payment_method": "bank_transfer",
  "payer_names": "洪成智",
  "payment_date": "2026-03-28"
}

# 2. 水电阶段验收后付款
POST /api/expenses
{
  "category_id": 1,
  "title": "水电中期款",
  "amount": 25000,
  "payment_method": "wechat",
  "payer_names": "洪成智，李梅",
  "payment_date": "2026-04-10"
}
```

### 场景 3: 跟踪施工进度

```bash
# 1. 创建关键节点
POST /api/timeline
{
  "title": "水电进场",
  "phase": "水电",
  "planned_start": "2026-03-30",
  "planned_end": "2026-04-10"
}

# 2. 施工中更新
PUT /api/timeline/1
{
  "actual_start": "2026-03-30",
  "progress_percent": 60,
  "status": "in_progress"
}

# 3. 完工验收
PUT /api/timeline/1
{
  "actual_end": "2026-04-09",
  "status": "completed",
  "quality_check_passed": true
}

# 4. 查看进度统计
GET /api/timeline/stats
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 409 | 冲突（如重复的 room_name） |
| 500 | 服务器内部错误 |

---

## 技术栈

- **后端**: Node.js + Express
- **数据库**: SQLite (纯 JS 实现)
- **ORM**: SQL.js (直接使用原生 SQL)
- **存储**: 本地文件 `data/renovation.db`

---

## 下一步建议

1. **前端开发**: Vue.js / React 管理界面
2. **移动端**: 微信小程序随时查看进度
3. **文件上传**: 集成 OSS 存储照片视频
4. **提醒通知**: 集成企业微信/钉钉提醒
5. **数据导出**: 支持 Excel/PDF 报表导出

---

*API 文档最后更新时间：2026-03-30*
