const { reactive, computed, nextTick } = Vue;

const state = reactive({
    currentView: 'home',
    viewHistory: ['home'],
    transitionName: 'fade',
    loading: false,
    saving: false,
    fabOpen: false,

    expenses: [],
    recentExpenses: [],
    totalExpenses: 0,
    categories: [],
    currentExpense: null,
    renovationProgress: 0,
    
    concepts: [],
    currentConcept: null,
    currentConceptImages: [],
    conceptImagesPreview: [],
    uploadingImages: false,
    currentArea: null,

    floorPlan: {
        id: null,
        grid_data: null,
        bg_image_url: null,
        bg_config: null
    },

    formData: {
        title: '',
        amount: null,
        category_id: '',
        payment_date: dayjs().format('YYYY-MM-DD'),
        payment_method: 'wechat',
        status: 'paid',
        notes: '',
        payer_names: '',
        decoration_area: '',
        image_urls: '[]'
    },
    expenseImagesPreview: [],

    conceptForm: {
        title: '',
        description: '',
        style: '',
        source_type: 'other',
        reference_link: '',
        image_urls: '[]',
        decoration_area: ''
    },

    purchasePlans: [],
    currentPurchasePlan: null,
    purchasePlanForm: {
        item_name: '',
        category_id: '',
        purchase_method: '其他',
        decoration_area: '',
        estimated_budget: null,
        actual_price: null,
        merchant_name: '',
        product_link: '',
        status: '计划',
        notes: '',
        image_urls: '[]'
    },
    purchasePlanImagesPreview: [],
    purchaseModal: {
        show: false,
        data: {
            actual_price: null,
            payer_names: '',
            payment_method: 'wechat',
            category_id: ''
        }
    },

    previewModal: {
        show: false,
        imageUrl: ''
    },

    scrolled: false,
    currentHeroImage: ['/images/001.png', '/images/002.png'][Math.floor(Math.random() * 2)]
});

const constants = {
    decorationAreas: [
        { label: '客厅', value: '客厅' },
        { label: '卧室', value: '卧室' },
        { label: '卫浴', value: '卫浴' },
        { label: '厨房', value: '厨房' },
        { label: '阳台', value: '阳台' },
        { label: '过道', value: '过道' }
    ],
    paymentMethods: [
        { label: '微信', value: 'wechat' },
        { label: '支付宝', value: 'alipay' },
        { label: '信用卡', value: 'credit_card' },
        { label: '银行转账', value: 'bank_transfer' },
        { label: '现金', value: 'cash' },
        { label: '其他', value: 'other' }
    ],
    sourceOptions: [
        { label: '淘宝', value: 'taobao' },
        { label: '京东', value: 'jingdong' },
        { label: '抖音', value: 'douyin' },
        { label: '小红书', value: 'xiaohongshu' },
        { label: '好好住', value: 'haozhu' },
        { label: '其他', value: 'other' }
    ],
    purchaseCategories: [
        '硬装',
        '家具',
        '家电',
        '装饰',
        '其他'
    ]
};

const computedProps = {
    currentDate: computed(() => dayjs().format('MM月DD日 dddd')),
    viewTitle: computed(() => {
        const titles = {
            'home': '',
            'expenses': '账单记录',
            'expense-detail': '账单详情',
            'expense-form': state.formData.id ? '编辑账单' : '记一笔账',
            'concepts': '灵感收集',
            'concept-detail': '灵感详情',
            'concept-form': state.conceptForm.id ? '编辑灵感' : '添加灵感',
            'purchase-plans': '购买清单',
            'purchase-plan-detail': '清单详情',
            'purchase-plan-form': state.purchasePlanForm.id ? '编辑清单' : '添加清单',
            'assistant': 'AI 助手',
            'myhome': '',
            'edit-home': '编辑户型',
            'area-detail': state.currentArea ? `${state.currentArea}详情` : '空间详情'
        };
        return titles[state.currentView] || '';
    }),
    currentViewComponent: computed(() => {
        const map = {
            'home': 'HomeView',
            'expenses': 'ExpensesView',
            'expense-detail': 'ExpenseDetailView',
            'expense-form': 'ExpenseFormView',
            'concepts': 'ConceptsView',
            'concept-detail': 'ConceptDetailView',
            'concept-form': 'ConceptFormView',
            'purchase-plans': 'PurchasePlansView',
            'purchase-plan-detail': 'PurchasePlanDetailView',
            'purchase-plan-form': 'PurchasePlanFormView',
            'assistant': 'AssistantView',
            'myhome': 'MyHomeView',
            'edit-home': 'EditHomeView',
            'area-detail': 'AreaDetailView'
        };
        return map[state.currentView] || 'HomeView';
    })
};

const helpers = {
    formatAmount: (amount) => parseFloat(amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formatDate: (dateStr) => {
        if (!dateStr) return '';
        const date = dayjs(dateStr);
        if (date.isSame(dayjs(), 'day')) return '今天';
        if (date.isSame(dayjs().subtract(1, 'day'), 'day')) return '昨天';
        return date.format('MM-DD');
    },
    getPaymentMethodText: (method) => {
        const m = constants.paymentMethods.find(p => p.value === method);
        return m ? m.label : method;
    },
    getSourceText: (source) => {
        const s = constants.sourceOptions.find(p => p.value === source);
        return s ? s.label : source;
    },
    getConceptCover: (concept) => {
        try {
            const urls = JSON.parse(concept.image_urls || '[]');
            return urls.length > 0 ? urls[0] : null;
        } catch(e) { return null; }
    },
    getCategoryConfig: (categoryName) => {
        const name = categoryName ? String(categoryName) : '';
        if (name.includes('硬装') || name.includes('水电') || name.includes('泥瓦')) return { icon: 'hammer', colorClass: 'bg-[#007aff]/10 text-[#007aff]', bgClass: 'bg-[#007aff]' };
        if (name.includes('软装') || name.includes('家具')) return { icon: 'sofa', colorClass: 'bg-[#ff9500]/10 text-[#ff9500]', bgClass: 'bg-[#ff9500]' };
        if (name.includes('设备') || name.includes('家电')) return { icon: 'tv', colorClass: 'bg-[#34c759]/10 text-[#34c759]', bgClass: 'bg-[#34c759]' };
        if (name.includes('设计')) return { icon: 'pen-tool', colorClass: 'bg-[#af52de]/10 text-[#af52de]', bgClass: 'bg-[#af52de]' };
        return { icon: 'receipt', colorClass: 'bg-[#8e8e93]/10 text-[#8e8e93]', bgClass: 'bg-[#8e8e93]' };
    },
    getCategoryIcon: (name) => helpers.getCategoryConfig(name).icon,
    getCategoryColorClass: (name) => helpers.getCategoryConfig(name).colorClass,
    getCategoryBgClass: (name) => helpers.getCategoryConfig(name).bgClass,
    updateIcons: () => {
        nextTick(() => {
            if (window.lucide?.createIcons) window.lucide.createIcons();
        });
    },
    handleScroll: (e) => {
        state.scrolled = e.target.scrollTop > 50;
    }
};

const actions = {
    navigate: (view, params = null) => {
        state.fabOpen = false;
        state.transitionName = 'slide-left';
        
        if (view === 'expense-detail' && params?.id) {
            actions.fetchExpenseDetail(params.id);
        } else if (view === 'expense-form') {
            if (params?.mode === 'edit' && params?.id) {
                const exp = state.expenses.find(e => e.id === params.id) || state.currentExpense;
                if (exp) {
                    state.formData = { ...exp, payment_date: dayjs(exp.payment_date).format('YYYY-MM-DD') };
                    try {
                        state.expenseImagesPreview = JSON.parse(exp.image_urls || '[]');
                    } catch(e) { state.expenseImagesPreview = []; }
                }
            } else {
                state.formData = {
                    title: '', amount: null, category_id: state.categories.length ? state.categories[0].id : '',
                    payment_date: dayjs().format('YYYY-MM-DD'), payment_method: 'wechat', status: 'paid', notes: '', payer_names: '', decoration_area: params?.area || '', image_urls: '[]'
                };
                state.expenseImagesPreview = [];
            }
        } else if (view === 'expenses') {
            actions.fetchExpenses();
        } else if (view === 'concepts') {
            actions.fetchConcepts();
        } else if (view === 'concept-detail' && params?.id) {
            actions.fetchConceptDetail(params.id);
        } else if (view === 'concept-form') {
            if (params?.mode === 'edit' && params?.id) {
                const con = state.concepts.find(c => c.id === params.id) || state.currentConcept;
                if (con) {
                    state.conceptForm = { ...con };
                    try {
                        state.conceptImagesPreview = JSON.parse(con.image_urls || '[]');
                    } catch(e) { state.conceptImagesPreview = []; }
                }
            } else {
                state.conceptForm = {
                    title: '', description: '', style: '', source_type: 'other', reference_link: '', image_urls: '[]', decoration_area: params?.area || ''
                };
                state.conceptImagesPreview = [];
            }
        } else if (view === 'purchase-plans') {
            actions.fetchPurchasePlans();
        } else if (view === 'purchase-plan-detail' && params?.id) {
            actions.fetchPurchasePlanDetail(params.id);
        } else if (view === 'purchase-plan-form') {
            if (params?.mode === 'edit' && params?.id) {
                const plan = state.purchasePlans.find(p => p.id === params.id) || state.currentPurchasePlan;
                if (plan) {
                    state.purchasePlanForm = { ...plan };
                    try {
                        state.purchasePlanImagesPreview = JSON.parse(plan.image_urls || '[]');
                    } catch(e) { state.purchasePlanImagesPreview = []; }
                }
            } else {
                state.purchasePlanForm = {
                    item_name: '', category_id: state.categories.length ? state.categories[0].id : '',
                    purchase_method: '其他', decoration_area: params?.area || '',
                    estimated_budget: null, actual_price: null, merchant_name: '', product_link: '', status: '计划', notes: '', image_urls: '[]', plans: '[]', selected_plan_id: null
                };
                state.purchasePlanImagesPreview = [];
            }
        } else if (view === 'myhome' || view === 'edit-home') {
            actions.fetchFloorPlan();
        } else if (view === 'area-detail' && params?.area) {
            state.currentArea = params.area;
        }

        state.viewHistory.push(view);
        state.currentView = view;
        helpers.updateIcons();
    },
    goBack: () => {
        if (state.viewHistory.length > 1) {
            state.transitionName = 'slide-right';
            state.viewHistory.pop();
            const previousView = state.viewHistory[state.viewHistory.length - 1];
            
            if (previousView === 'expenses') actions.fetchExpenses();
            if (previousView === 'concepts') actions.fetchConcepts();
            if (previousView === 'purchase-plans') actions.fetchPurchasePlans();
            if (previousView === 'home') actions.fetchHomeData();
            if (previousView === 'concept-detail' && state.currentConcept) actions.fetchConceptDetail(state.currentConcept.id);
            if (previousView === 'expense-detail' && state.currentExpense) actions.fetchExpenseDetail(state.currentExpense.id);
            if (previousView === 'purchase-plan-detail' && state.currentPurchasePlan) actions.fetchPurchasePlanDetail(state.currentPurchasePlan.id);
            
            state.currentView = previousView;
            helpers.updateIcons();
        }
    },
    fetchHomeData: async () => {
        try {
            const res = await axios.get('/api/expenses', { params: { limit: 3 } });
            if (res.data.success) state.recentExpenses = res.data.data;
            
            const allRes = await axios.get('/api/expenses', { params: { limit: 1000 } });
            if (allRes.data.success) {
                state.totalExpenses = allRes.data.data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            }

            const statsRes = await axios.get('/api/timeline/stats');
            if (statsRes.data.success && statsRes.data.data.overall) {
                state.renovationProgress = statsRes.data.data.overall.completion_rate || 0;
            }
        } catch (error) { console.error('Failed to fetch home data:', error); }
    },
    fetchExpenses: async () => {
        state.loading = true;
        try {
            const res = await axios.get('/api/expenses', { params: { limit: 50 } });
            if (res.data.success) {
                state.expenses = res.data.data;
                state.totalExpenses = state.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            }
        } catch (error) { console.error('Failed to fetch expenses:', error); } finally { state.loading = false; }
    },
    fetchExpenseDetail: async (id) => {
        try {
            const res = await axios.get(`/api/expenses/${id}`);
            if (res.data.success) {
                state.currentExpense = res.data.data;
                helpers.updateIcons();
            }
        } catch (error) { console.error('Failed to fetch expense detail:', error); }
    },
    fetchCategories: async () => {
        try {
            const res = await axios.get('/api/categories');
            if (res.data.success) state.categories = res.data.data;
        } catch (error) { console.error('Failed to fetch categories:', error); }
    },
    fetchConcepts: async () => {
        state.loading = true;
        try {
            const res = await axios.get('/api/design-concepts', { params: { limit: 50 } });
            if (res.data.success) state.concepts = res.data.data;
        } catch (error) { console.error('Failed to fetch concepts:', error); } finally { state.loading = false; }
    },
    fetchConceptDetail: async (id) => {
        try {
            const res = await axios.get(`/api/design-concepts/${id}`);
            if (res.data.success) {
                state.currentConcept = res.data.data;
                try { state.currentConceptImages = JSON.parse(res.data.data.image_urls || '[]'); } 
                catch(e) { state.currentConceptImages = []; }
                helpers.updateIcons();
            }
        } catch (error) { console.error('Failed to fetch concept detail:', error); }
    },
    saveExpense: async () => {
        if (!state.formData.amount || !state.formData.title) return;
        state.saving = true;
        try {
            const payload = { 
                ...state.formData, 
                amount: parseFloat(state.formData.amount),
                image_urls: JSON.stringify(state.expenseImagesPreview)
            };
            let res = payload.id ? await axios.put(`/api/expenses/${payload.id}`, payload) : await axios.post('/api/expenses', payload);
            if (res.data.success) actions.goBack();
        } catch (error) { alert('保存失败，请重试'); console.error(error); } finally { state.saving = false; }
    },
    deleteExpense: async () => {
        if (!state.currentExpense || !confirm('确定要删除这笔账单吗？')) return;
        try {
            const res = await axios.delete(`/api/expenses/${state.currentExpense.id}`);
            if (res.data.success) actions.goBack();
        } catch (error) { alert('删除失败，请重试'); }
    },
    saveConcept: async () => {
        if (!state.conceptForm.title) return;
        state.saving = true;
        try {
            const payload = { ...state.conceptForm, image_urls: JSON.stringify(state.conceptImagesPreview) };
            let res = payload.id ? await axios.put(`/api/design-concepts/${payload.id}`, payload) : await axios.post('/api/design-concepts', payload);
            if (res.data.success) actions.goBack();
        } catch (error) { alert('保存失败，请重试'); console.error(error); } finally { state.saving = false; }
    },
    deleteConcept: async () => {
        if (!state.currentConcept || !confirm('确定要删除这个灵感吗？')) return;
        try {
            const res = await axios.delete(`/api/design-concepts/${state.currentConcept.id}`);
            if (res.data.success) actions.goBack();
        } catch (error) { alert('删除失败，请重试'); }
    },
    processImagesToFormData: async (files) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
                try {
                    const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                    const blobToAppend = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    file = new File([blobToAppend], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
                } catch (e) {
                    console.error('HEIC conversion failed:', e);
                }
            }
            formData.append('images', file);
        }
        return formData;
    },
    handleConceptImageUpload: async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        if (state.conceptImagesPreview.length + files.length > 5) { alert('最多只能上传 5 张图片'); return; }
        
        state.uploadingImages = true;
        try {
            const formData = await actions.processImagesToFormData(files);
            const res = await axios.post('/api/design-concepts/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                state.conceptImagesPreview.push(...res.data.data.urls);
                state.conceptForm.image_urls = JSON.stringify(state.conceptImagesPreview);
            }
        } catch (error) { alert('图片上传失败: ' + (error.response?.data?.error || error.message)); } 
        finally { state.uploadingImages = false; event.target.value = ''; }
    },
    removeConceptImage: (index) => {
        state.conceptImagesPreview.splice(index, 1);
        state.conceptForm.image_urls = JSON.stringify(state.conceptImagesPreview);
    },
    handleExpenseImageUpload: async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        if (state.expenseImagesPreview.length + files.length > 5) { alert('最多只能上传 5 张图片'); return; }
        
        state.uploadingImages = true;
        try {
            const formData = await actions.processImagesToFormData(files);
            const res = await axios.post('/api/expenses/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                state.expenseImagesPreview.push(...res.data.data.urls);
                state.formData.image_urls = JSON.stringify(state.expenseImagesPreview);
            }
        } catch (error) { alert('图片上传失败: ' + (error.response?.data?.error || error.message)); } 
        finally { state.uploadingImages = false; event.target.value = ''; }
    },
    removeExpenseImage: (index) => {
        state.expenseImagesPreview.splice(index, 1);
        state.formData.image_urls = JSON.stringify(state.expenseImagesPreview);
    },
    handlePurchasePlanImageUpload: async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        if (state.purchasePlanImagesPreview.length + files.length > 5) { alert('最多只能上传 5 张图片'); return; }
        
        state.uploadingImages = true;
        try {
            const formData = await actions.processImagesToFormData(files);
            const res = await axios.post('/api/purchase-plans/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                state.purchasePlanImagesPreview.push(...res.data.data.urls);
                state.purchasePlanForm.image_urls = JSON.stringify(state.purchasePlanImagesPreview);
            }
        } catch (error) { alert('图片上传失败: ' + (error.response?.data?.error || error.message)); } 
        finally { state.uploadingImages = false; event.target.value = ''; }
    },
    removePurchasePlanImage: (index) => {
        state.purchasePlanImagesPreview.splice(index, 1);
        state.purchasePlanForm.image_urls = JSON.stringify(state.purchasePlanImagesPreview);
    },
    fetchPurchasePlans: async () => {
        state.loading = true;
        try {
            const res = await axios.get('/api/purchase-plans', { params: { limit: 50 } });
            if (res.data.success) {
                state.purchasePlans = res.data.data;
            }
        } catch (error) { console.error('Failed to fetch purchase plans:', error); } finally { state.loading = false; }
    },
    fetchPurchasePlanDetail: async (id) => {
        try {
            const res = await axios.get(`/api/purchase-plans/${id}`);
            if (res.data.success) {
                state.currentPurchasePlan = res.data.data;
                helpers.updateIcons();
            }
        } catch (error) { console.error('Failed to fetch purchase plan detail:', error); }
    },
    savePurchasePlan: async () => {
        if (!state.purchasePlanForm.item_name || !state.purchasePlanForm.category_id) {
            alert('请填写物品名称和分类');
            return;
        }
        if (state.purchasePlanForm.status === '已购买' && !state.purchasePlanForm.actual_price) {
            alert('已购买状态必须填写付款金额');
            return;
        }
        state.saving = true;
        try {
            const payload = { 
                ...state.purchasePlanForm, 
                estimated_budget: state.purchasePlanForm.estimated_budget ? parseFloat(state.purchasePlanForm.estimated_budget) : null
            };
            
            let res = payload.id ? await axios.put(`/api/purchase-plans/${payload.id}`, payload) : await axios.post('/api/purchase-plans', payload);
            if (res.data.success) actions.goBack();
        } catch (error) { alert('保存失败，请重试'); console.error(error); } finally { state.saving = false; }
    },
    selectPurchasePlanOption: async (optionId) => {
        const plan = state.currentPurchasePlan;
        if (!plan) return;
        state.saving = true;
        try {
            const payload = { 
                ...plan, 
                selected_plan_id: optionId
            };

            try {
                const parsedPlans = JSON.parse(plan.plans || '[]');
                const activePlan = parsedPlans.find(p => p.id === optionId);
                if (activePlan) {
                    payload.actual_price = activePlan.price ? parseFloat(activePlan.price) : null;
                    payload.merchant_name = activePlan.merchant_name;
                    payload.purchase_method = activePlan.purchase_method;
                    payload.product_link = activePlan.product_link;
                    payload.notes = activePlan.notes;
                    payload.image_urls = activePlan.image_urls;
                }
            } catch(e) {}

            const res = await axios.put(`/api/purchase-plans/${plan.id}`, payload);
            if (res.data.success) {
                await actions.fetchPurchasePlanDetail(plan.id);
            }
        } catch (error) { 
            alert('选择方案失败，请重试'); 
            console.error(error); 
        } finally { 
            state.saving = false; 
        }
    },
    deletePurchasePlan: async () => {
        if (!state.currentPurchasePlan || !confirm('确定要删除这个购买清单吗？')) return;
        try {
            const res = await axios.delete(`/api/purchase-plans/${state.currentPurchasePlan.id}`);
            if (res.data.success) actions.goBack();
        } catch (error) { alert('删除失败，请重试'); }
    },
    openPurchaseModal: () => {
        if (!state.categories.length) actions.fetchCategories();
        state.purchaseModal.data = {
            actual_price: state.currentPurchasePlan?.actual_price || state.currentPurchasePlan?.estimated_budget || null,
            payer_names: '',
            payment_method: 'wechat',
            category_id: state.categories.length ? state.categories[0].id : '',
            buy_date: dayjs().format('YYYY-MM-DD'),
            remark: ''
        };
        state.purchaseModal.show = true;
        helpers.updateIcons();
    },
    closePurchaseModal: () => {
        state.purchaseModal.show = false;
    },
    confirmPurchase: async () => {
        const plan = state.currentPurchasePlan;
        const modalData = state.purchaseModal.data;
        if (!modalData.actual_price || !modalData.category_id || !modalData.buy_date) {
            alert('请填写实际金额、费用分类和购买日期');
            return;
        }
        
        state.saving = true;
        try {
            await axios.put(`/api/purchase-plans/${plan.id}`, {
                ...plan,
                status: '已购买',
                actual_price: parseFloat(modalData.actual_price),
                buy_date: modalData.buy_date
            });
            
            await axios.post('/api/expenses', {
                category_id: modalData.category_id,
                title: plan.item_name,
                amount: parseFloat(modalData.actual_price),
                payment_method: modalData.payment_method,
                payer_names: modalData.payer_names,
                payment_date: modalData.buy_date,
                decoration_area: plan.decoration_area,
                notes: modalData.remark ? `由购买清单“${plan.item_name}”自动生成。备注: ${modalData.remark}` : `由购买清单“${plan.item_name}”自动生成`,
                image_urls: plan.image_urls || '[]'
            });
            
            await actions.fetchPurchasePlanDetail(plan.id);
            actions.closePurchaseModal();
        } catch (error) {
            console.error(error);
            alert('操作失败，请重试');
        } finally {
            state.saving = false;
        }
    },
    fetchFloorPlan: async () => {
        try {
            const res = await axios.get('/api/floor-plans');
            if (res.data.success && res.data.data) {
                state.floorPlan = res.data.data;
            }
        } catch (error) {
            console.error('Failed to fetch floor plan:', error);
        }
    },
    saveFloorPlan: async (data) => {
        try {
            state.saving = true;
            const res = await axios.post('/api/floor-plans', data);
            if (res.data.success) {
                state.floorPlan = res.data.data;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save floor plan:', error);
            return false;
        } finally {
            state.saving = false;
        }
    },
    previewImage: (url) => {
        state.previewModal.imageUrl = url;
        state.previewModal.show = true;
    },
    closePreviewModal: () => {
        state.previewModal.show = false;
        setTimeout(() => {
            state.previewModal.imageUrl = '';
        }, 300);
    }
};

export const useAppStore = () => {
    return { state, constants, computedProps, helpers, actions };
};
