const { createApp, ref, onMounted, computed, watch, nextTick } = Vue;

const app = createApp({
    setup() {
        const menus = [
            { id: 'quotes', name: '报价对比', icon: 'file-text' },
            { id: 'expenses', name: '费用清单', icon: 'credit-card' },
            { id: 'design-concepts', name: '设计方案', icon: 'layout' },
            { id: 'purchase-plans', name: '购买计划', icon: 'shopping-cart' },
            { id: 'timeline', name: '日程进度', icon: 'calendar' },
            { id: 'spaces', name: '空间规划', icon: 'maximize' },
            { id: 'reminders', name: '提醒事项', icon: 'bell' },
            { id: 'vendors', name: '供应商', icon: 'users' },
            { id: 'categories', name: '费用分类', icon: 'tag' },
            { id: 'renovation-results', name: '装修结果', icon: 'check-circle' },
        ];

        const currentMenu = ref('quotes');
        const items = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const showAddModal = ref(false);
        const isEditing = ref(false);
        const form = ref({});
        const pagination = ref({ page: 1, limit: 10, total: 0 });

        const currentMenuName = computed(() => {
            return menus.find(m => m.id === currentMenu.id)?.name || '';
        });

        const columnConfigs = {
            'quotes': [
                { key: 'project_name', label: '项目名称' },
                { key: 'vendor_name', label: '供应商' },
                { key: 'amount', label: '金额', type: 'amount' },
                { key: 'status', label: '状态', type: 'status' },
                { key: 'priority', label: '优先级', type: 'status' },
                { key: 'created_at', label: '创建时间', type: 'date' },
            ],
            'expenses': [
                { key: 'title', label: '费用名称' },
                { key: 'category_name', label: '分类' },
                { key: 'amount', label: '金额', type: 'amount' },
                { key: 'payment_method', label: '支付方式' },
                { key: 'payment_date', label: '支付日期', type: 'date' },
                { key: 'status', label: '状态', type: 'status' },
            ],
            'vendors': [
                { key: 'name', label: '供应商名称' },
                { key: 'type', label: '类型' },
                { key: 'contact_person', label: '联系人' },
                { key: 'phone', label: '电话' },
                { key: 'status', label: '状态', type: 'status' },
            ],
            'design-concepts': [
                { key: 'title', label: '标题' },
                { key: 'style', label: '风格' },
                { key: 'category', label: '分类' },
                { key: 'source_type', label: '来源' },
                { key: 'priority', label: '优先级', type: 'status' },
            ],
            'purchase-plans': [
                { key: 'item_name', label: '物品名称' },
                { key: 'estimated_budget', label: '预算', type: 'amount' },
                { key: 'actual_price', label: '实际价格', type: 'amount' },
                { key: 'status', label: '状态', type: 'status' },
            ],
            'timeline': [
                { key: 'title', label: '任务名称' },
                { key: 'phase', label: '阶段' },
                { key: 'planned_start', label: '计划开始', type: 'date' },
                { key: 'status', label: '状态', type: 'status' },
                { key: 'progress_percent', label: '进度' },
            ],
            'spaces': [
                { key: 'room_name', label: '空间名称' },
                { key: 'area', label: '面积(㎡)' },
                { key: 'priority_level', label: '优先级' },
            ],
            'reminders': [
                { key: 'title', label: '提醒内容' },
                { key: 'reminder_type', label: '类型' },
                { key: 'due_date', label: '到期日', type: 'date' },
                { key: 'status', label: '状态', type: 'status' },
            ],
            'categories': [
                { key: 'name', label: '分类名称' },
                { key: 'level', label: '层级' },
                { key: 'sort_order', label: '排序' },
            ],
            'renovation-results': [
                { key: 'title', label: '标题' },
                { key: 'space_name', label: '空间' },
                { key: 'overall_rating', label: '评分' },
                { key: 'completed_at', label: '完成时间', type: 'date' },
            ]
        };

        const formFieldConfigs = {
            'quotes': [
                { key: 'project_name', label: '项目名称', type: 'text' },
                { key: 'vendor_id', label: '供应商ID', type: 'number' },
                { key: 'category_id', label: '分类ID', type: 'number' },
                { key: 'amount', label: '金额', type: 'number' },
                { key: 'status', label: '状态', type: 'select', options: [
                    { label: '待定', value: 'pending' },
                    { label: '已选', value: 'selected' },
                    { label: '已拒', value: 'rejected' }
                ]},
                { key: 'priority', label: '优先级', type: 'select', options: [
                    { label: '高', value: 'high' },
                    { label: '中', value: 'medium' },
                    { label: '低', value: 'low' }
                ]},
                { key: 'description', label: '描述', type: 'textarea', fullWidth: true },
            ],
            'expenses': [
                { key: 'title', label: '标题', type: 'text' },
                { key: 'category_id', label: '分类ID', type: 'number' },
                { key: 'amount', label: '金额', type: 'number' },
                { key: 'payment_method', label: '支付方式', type: 'select', options: [
                    { label: '现金', value: 'cash' },
                    { label: '银行转账', value: 'bank_transfer' },
                    { label: '微信', value: 'wechat' },
                    { label: '支付宝', value: 'alipay' },
                    { label: '信用卡', value: 'credit_card' },
                    { label: '其他', value: 'other' }
                ]},
                { key: 'payment_date', label: '支付日期', type: 'date' },
                { key: 'status', label: '状态', type: 'select', options: [
                    { label: '计划中', value: 'planned' },
                    { label: '已支付', value: 'paid' },
                    { label: '已退款', value: 'refunded' }
                ]},
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'vendors': [
                { key: 'name', label: '供应商名称', type: 'text' },
                { key: 'type', label: '类型', type: 'select', options: [
                    { label: '设计师', value: 'designer' },
                    { label: '施工方', value: 'contractor' },
                    { label: '主材商', value: 'material_supplier' },
                    { label: '家电商', value: 'appliance_store' },
                    { label: '安装工', value: 'installer' },
                    { label: '其他', value: 'other' }
                ]},
                { key: 'contact_person', label: '联系人', type: 'text' },
                { key: 'phone', label: '电话', type: 'text' },
                { key: 'email', label: '邮箱', type: 'text' },
                { key: 'address', label: '地址', type: 'text', fullWidth: true },
                { key: 'status', label: '状态', type: 'select', options: [
                    { label: '活跃', value: 'active' },
                    { label: '停用', value: 'inactive' },
                    { label: '黑名单', value: 'blacklisted' }
                ]},
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'design-concepts': [
                { key: 'title', label: '标题', type: 'text' },
                { key: 'style', label: '风格', type: 'text' },
                { key: 'category', label: '分类', type: 'text' },
                { key: 'source_type', label: '来源', type: 'select', options: [
                    { label: '小红书', value: 'xiaohongshu' },
                    { label: '好好住', value: 'haozhu' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Pinterest', value: 'pinterest' },
                    { label: '其他', value: 'other' }
                ]},
                { key: 'priority', label: '优先级', type: 'select', options: [
                    { label: '高', value: 'high' },
                    { label: '中', value: 'medium' },
                    { label: '低', value: 'low' }
                ]},
                { key: 'description', label: '描述', type: 'textarea', fullWidth: true },
            ],
            'purchase-plans': [
                { key: 'item_name', label: '物品名称', type: 'text' },
                { key: 'category_id', label: '分类ID', type: 'number' },
                { key: 'estimated_budget', label: '预算', type: 'number' },
                { key: 'actual_price', label: '实际价格', type: 'number' },
                { key: 'status', label: '状态', type: 'select', options: [
                    { label: '待购', value: 'todo' },
                    { label: '购买中', value: 'in_progress' },
                    { label: '已购', value: 'purchased' },
                    { label: '已送达', value: 'delivered' },
                    { label: '已安装', value: 'installed' },
                    { label: '已取消', value: 'cancelled' }
                ]},
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'timeline': [
                { key: 'title', label: '任务名称', type: 'text' },
                { key: 'phase', label: '阶段', type: 'text' },
                { key: 'planned_start', label: '计划开始', type: 'date' },
                { key: 'planned_end', label: '计划结束', type: 'date' },
                { key: 'status', label: '状态', type: 'select', options: [
                    { label: '未开始', value: 'not_started' },
                    { label: '进行中', value: 'in_progress' },
                    { label: '已完成', value: 'completed' },
                    { label: '已延迟', value: 'delayed' },
                    { label: '已取消', value: 'cancelled' }
                ]},
                { key: 'progress_percent', label: '进度(0-100)', type: 'number' },
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'spaces': [
                { key: 'room_name', label: '空间名称', type: 'text' },
                { key: 'area', label: '面积(㎡)', type: 'number' },
                { key: 'priority_level', label: '优先级(1-5)', type: 'number' },
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'reminders': [
                { key: 'title', label: '提醒内容', type: 'text' },
                { key: 'reminder_type', label: '类型', type: 'select', options: [
                    { label: '付款', value: 'payment' },
                    { label: '送货', value: 'delivery' },
                    { label: '验收', value: 'inspection' },
                    { label: '预约', value: 'appointment' },
                    { label: '自定义', value: 'custom' }
                ]},
                { key: 'due_date', label: '到期日', type: 'date' },
                { key: 'reminder_date', label: '提醒日', type: 'date' },
                { key: 'status', label: '状态', type: 'select', options: [
                    { label: '待处理', value: 'pending' },
                    { label: '已提醒', value: 'notified' },
                    { label: '已完成', value: 'completed' },
                    { label: '已取消', value: 'cancelled' }
                ]},
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'categories': [
                { key: 'name', label: '分类名称', type: 'text' },
                { key: 'parent_id', label: '父分类ID', type: 'number' },
                { key: 'level', label: '层级', type: 'number' },
                { key: 'sort_order', label: '排序', type: 'number' },
                { key: 'notes', label: '备注', type: 'textarea', fullWidth: true },
            ],
            'renovation-results': [
                { key: 'title', label: '标题', type: 'text' },
                { key: 'space_name', label: '空间名称', type: 'text' },
                { key: 'overall_rating', label: '总评分(1-10)', type: 'number' },
                { key: 'quality_rating', label: '质量评分(1-10)', type: 'number' },
                { key: 'aesthetics_rating', label: '美观评分(1-10)', type: 'number' },
                { key: 'experience_notes', label: '心得体会', type: 'textarea', fullWidth: true },
                { key: 'lessons_learned', label: '经验教训', type: 'textarea', fullWidth: true },
            ]
        };

        const columns = computed(() => columnConfigs[currentMenu.value] || []);
        const formFields = computed(() => formFieldConfigs[currentMenu.value] || formFieldConfigs['quotes']);

        const fetchData = async () => {
            loading.value = true;
            try {
                const res = await axios.get(`/api/${currentMenu.value}`, {
                    params: {
                        page: pagination.value.page,
                        limit: pagination.value.limit
                    }
                });
                if (res.data.success) {
                    items.value = res.data.data;
                    if (res.data.pagination) {
                        pagination.value.total = res.data.pagination.total;
                    } else {
                        pagination.value.total = res.data.data.length;
                    }
                    nextTick(() => {
                        lucide.createIcons();
                    });
                }
            } catch (err) {
                console.error('Fetch error:', err);
                alert('加载数据失败: ' + (err.response?.data?.error || err.message));
            } finally {
                loading.value = false;
            }
        };

        const changePage = (page) => {
            pagination.value.page = page;
            fetchData();
        };

        const editItem = (item) => {
            isEditing.value = true;
            // 处理日期格式，以便在 input[type="date"] 中显示
            const processedItem = { ...item };
            formFields.value.forEach(field => {
                if (field.type === 'date' && processedItem[field.key]) {
                    processedItem[field.key] = processedItem[field.key].split('T')[0];
                }
            });
            form.value = processedItem;
            showAddModal.value = true;
        };

        const deleteItem = async (id) => {
            if (!confirm('确定要删除吗？')) return;
            try {
                const res = await axios.delete(`/api/${currentMenu.value}/${id}`);
                if (res.data.success) {
                    fetchData();
                }
            } catch (err) {
                alert('删除失败: ' + (err.response?.data?.error || err.message));
            }
        };

        const closeModal = () => {
            showAddModal.value = false;
            isEditing.value = false;
            form.value = {};
        };

        const saveItem = async () => {
            saving.value = true;
            try {
                let res;
                const payload = { ...form.value };
                // 确保数字字段是数字类型
                formFields.value.forEach(field => {
                    if (field.type === 'number' && payload[field.key]) {
                        payload[field.key] = parseFloat(payload[field.key]);
                    }
                });

                if (isEditing.value) {
                    res = await axios.put(`/api/${currentMenu.value}/${payload.id}`, payload);
                } else {
                    res = await axios.post(`/api/${currentMenu.value}`, payload);
                }
                if (res.data.success) {
                    closeModal();
                    fetchData();
                }
            } catch (err) {
                alert('保存失败: ' + (err.response?.data?.error || err.message));
            } finally {
                saving.value = false;
            }
        };

        const formatNumber = (num) => {
            if (num === null || num === undefined) return '0.00';
            return parseFloat(num).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
        };

        const formatDate = (dateStr) => {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleDateString('zh-CN');
        };

        const getStatusClass = (status) => {
            if (!status) return 'bg-gray-100 text-gray-800';
            const s = status.toLowerCase();
            const map = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'selected': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'active': 'bg-green-100 text-green-800',
                'inactive': 'bg-gray-100 text-gray-800',
                'paid': 'bg-blue-100 text-blue-800',
                'planned': 'bg-purple-100 text-purple-800',
                'completed': 'bg-green-100 text-green-800',
                'in_progress': 'bg-blue-100 text-blue-800',
                'delayed': 'bg-red-100 text-red-800',
                'high': 'bg-red-100 text-red-800',
                'medium': 'bg-blue-100 text-blue-800',
                'low': 'bg-gray-100 text-gray-800',
                'todo': 'bg-gray-100 text-gray-800',
                'purchased': 'bg-green-100 text-green-800',
                'delivered': 'bg-blue-100 text-blue-800',
                'installed': 'bg-indigo-100 text-indigo-800',
            };
            return map[s] || 'bg-gray-100 text-gray-800';
        };

        watch(currentMenu, () => {
            pagination.value.page = 1;
            fetchData();
        });

        watch(showAddModal, (newVal) => {
            if (newVal) {
                nextTick(() => {
                    lucide.createIcons();
                });
            }
        });

        onMounted(() => {
            fetchData();
        });

        return {
            menus, currentMenu, currentMenuName, items, loading, saving,
            showAddModal, isEditing, form, pagination, columns, formFields,
            fetchData, changePage, editItem, deleteItem, closeModal, saveItem,
            formatNumber, formatDate, getStatusClass
        };
    }
});

app.mount('#app');
