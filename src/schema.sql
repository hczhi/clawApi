-- SQLite Schema - 装修管理系统数据库
-- 创建时间：2026-03-30
-- 数据库类型：SQLite（轻量级，无需独立服务）
-- 用途：房屋装修全周期管理

-- -----------------------------
-- 核心表结构
-- -----------------------------

-- 1. 费用分类表
CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    level INTEGER DEFAULT 1,
    path TEXT,
    sort_order INTEGER DEFAULT 0,
    color_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY(parent_id) REFERENCES expense_categories(id)
);

-- 2. 供应商表
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('designer', 'contractor', 'material_supplier', 'appliance_store', 'installer', 'other')),
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    company_name TEXT,
    business_license TEXT,
    quote_summary TEXT,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'inactive', 'blacklisted')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 3. 报价对比表
CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    design_concept_id INTEGER,
    project_name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    status TEXT CHECK(status IN ('pending', 'selected', 'rejected')) DEFAULT 'pending',
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    validity_start DATE,
    validity_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY(vendor_id) REFERENCES vendors(id),
    FOREIGN KEY(category_id) REFERENCES expense_categories(id),
    FOREIGN KEY(design_concept_id) REFERENCES design_concepts(id)
);

-- 4. 费用清单表
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    quote_id INTEGER,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'bank_transfer', 'wechat', 'alipay', 'credit_card', 'other')),
    payer_names TEXT,
    payment_date DATE NOT NULL,
    receipt_file_path TEXT,
    vendor_id INTEGER,
    reimbursement_status TEXT CHECK(reimbursement_status IN ('not_required', 'paid_in_full', 'partial', 'pending')) DEFAULT 'not_required',
    reimbursed_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT CHECK(status IN ('planned', 'paid', 'refunded')) DEFAULT 'planned',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT,
    FOREIGN KEY(category_id) REFERENCES expense_categories(id),
    FOREIGN KEY(quote_id) REFERENCES quotes(id),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

-- 5. 设计方案表
CREATE TABLE IF NOT EXISTS design_concepts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    style TEXT,
    category TEXT,
    source_type TEXT CHECK(source_type IN ('xiaohongshu', 'haozhu', 'instagram', 'pinterest', 'taobao', 'jingdong', 'douyin', 'other')),
    image_urls TEXT,
    reference_link TEXT,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    matched_spaces TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT
);

-- 6. 购买计划表
CREATE TABLE IF NOT EXISTS purchase_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    estimated_budget DECIMAL(12,2),
    actual_price DECIMAL(12,2),
    estimated_purchase_date DATE,
    purchased_date DATE,
    installation_required BOOLEAN DEFAULT 0,
    scheduled_installation_date DATE,
    status TEXT CHECK(status IN ('todo', 'in_progress', 'purchased', 'delivered', 'installed', 'cancelled')) DEFAULT 'todo',
    vendor_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT,
    FOREIGN KEY(category_id) REFERENCES expense_categories(id),
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

-- 7. 日程进度表
CREATE TABLE IF NOT EXISTS renovation_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    phase TEXT NOT NULL,
    milestone_type TEXT CHECK(milestone_type IN ('key_milestone', 'routine_task', 'reminder', 'milestone_check')) DEFAULT 'routine_task',
    planned_start DATE NOT NULL,
    planned_end DATE NOT NULL,
    actual_start DATE,
    actual_end DATE,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'delayed', 'cancelled')) DEFAULT 'not_started',
    progress_percent INTEGER CHECK(progress_percent BETWEEN 0 AND 100) DEFAULT 0,
    responsible_party TEXT,
    vendor_id INTEGER,
    related_order_ids TEXT,
    quality_check_passed BOOLEAN DEFAULT 0,
    inspection_notes TEXT,
    photo_url TEXT,
    progress_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT,
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
);

-- 8. 空间规划表
CREATE TABLE IF NOT EXISTS space_planning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL UNIQUE,
    area DECIMAL(8,2),
    original_plan TEXT,
    final_design_id INTEGER,
    priority_level INTEGER CHECK(priority_level BETWEEN 1 AND 5) DEFAULT 3,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY(final_design_id) REFERENCES design_concepts(id)
);

-- 9. 提醒事项表
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    reminder_type TEXT CHECK(reminder_type IN ('payment', 'delivery', 'inspection', 'appointment', 'custom')),
    due_date DATE NOT NULL,
    reminder_date DATE NOT NULL,
    notified_date DATE,
    completed_date DATE,
    status TEXT CHECK(status IN ('pending', 'notified', 'completed', 'cancelled')) DEFAULT 'pending',
    entity_type TEXT,
    entity_id INTEGER,
    notification_sent BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 10. 装修结果表
CREATE TABLE IF NOT EXISTS renovation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    space_name TEXT NOT NULL,
    task_id INTEGER,
    photo_before_url TEXT,
    photo_after_url TEXT,
    video_url TEXT,
    overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 10),
    quality_rating INTEGER CHECK(quality_rating BETWEEN 1 AND 10),
    material_rating INTEGER CHECK(material_rating BETWEEN 1 AND 10),
    aesthetics_rating INTEGER CHECK(aesthetics_rating BETWEEN 1 AND 10),
    experience_notes TEXT,
    lessons_learned TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT,
    FOREIGN KEY(task_id) REFERENCES renovation_timeline(id)
);

-- -----------------------------
-- 辅助视图
-- -----------------------------

-- 预算执行总览视图
CREATE VIEW IF NOT EXISTS expense_overview AS
SELECT 
    ec.name as category,
    COUNT(e.id) as total_expenses,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as avg_amount,
    MAX(e.payment_date) as last_payment_date
FROM expenses e
JOIN expense_categories ec ON e.category_id = ec.id
WHERE e.status = 'paid'
GROUP BY ec.id;

-- 项目进度概览视图
CREATE VIEW IF NOT EXISTS timeline_summary AS
SELECT 
    phase,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
    ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
FROM renovation_timeline
GROUP BY phase;

-- 超支分析视图
CREATE VIEW IF NOT EXISTS budget_breakeven_analysis AS
SELECT 
    p.item_name,
    p.estimated_budget,
    COALESCE(p.actual_price, 0) as actual_price,
    COALESCE(p.actual_price, 0) - p.estimated_budget as over_under_budget,
    CASE 
        WHEN COALESCE(p.actual_price, 0) > p.estimated_budget THEN '超支'
        WHEN COALESCE(p.actual_price, 0) < p.estimated_budget THEN '节省'
        ELSE '持平'
    END as status_text
FROM purchase_plans p
WHERE p.actual_price IS NOT NULL;

-- -----------------------------
-- 索引
-- -----------------------------

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_validity ON quotes(validity_end);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_timeline_phase_status ON renovation_timeline(phase, status);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date, status);
CREATE INDEX IF NOT EXISTS idx_purchase_status ON purchase_plans(status);
CREATE INDEX IF NOT EXISTS idx_expenses_tags ON expenses(tags);

-- -----------------------------
-- 初始数据
-- -----------------------------

-- 插入顶级费用分类
INSERT INTO expense_categories (name, level, sort_order) VALUES
('硬装', 1, 1),
('软装', 1, 2),
('设备', 1, 3),
('家电', 1, 4);

-- 插入子分类
INSERT INTO expense_categories (name, parent_id, level, sort_order) VALUES
('拆改工程', (SELECT id FROM expense_categories WHERE name='硬装'), 2, 1),
('水电工程', (SELECT id FROM expense_categories WHERE name='硬装'), 2, 2),
('泥瓦工程', (SELECT id FROM expense_categories WHERE name='硬装'), 2, 3),
('家具', (SELECT id FROM expense_categories WHERE name='软装'), 2, 1),
('灯具', (SELECT id FROM expense_categories WHERE name='软装'), 2, 2);
