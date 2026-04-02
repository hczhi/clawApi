const { createApp, ref, computed, onMounted, nextTick, watch } = Vue;

const app = createApp({
    setup() {
        // App State
        const currentView = ref('home');
        const viewHistory = ref(['home']);
        const transitionName = ref('fade');
        const loading = ref(false);
        const saving = ref(false);
        const fabOpen = ref(false);

        // Data State
        const expenses = ref([]);
        const recentExpenses = ref([]);
        const totalExpenses = ref(0);
        const categories = ref([]);
        const currentExpense = ref(null);
        const renovationProgress = ref(0);
        
        // Concept Data State
        const concepts = ref([]);
        const currentConcept = ref(null);
        const currentConceptImages = ref([]);
        const conceptImagesPreview = ref([]);
        const uploadingImages = ref(false);

        // Form State
        const formData = ref({
            title: '',
            amount: null,
            category_id: '',
            payment_date: dayjs().format('YYYY-MM-DD'),
            payment_method: 'wechat',
            status: 'paid',
            notes: '',
            payer_names: ''
        });

        const conceptForm = ref({
            title: '',
            description: '',
            style: '',
            source_type: 'other',
            reference_link: '',
            image_urls: '[]'
        });

        // Constants
        const paymentMethods = [
            { label: '微信', value: 'wechat' },
            { label: '支付宝', value: 'alipay' },
            { label: '信用卡', value: 'credit_card' },
            { label: '银行转账', value: 'bank_transfer' },
            { label: '现金', value: 'cash' },
            { label: '其他', value: 'other' }
        ];
        
        const sourceOptions = [
            { label: '淘宝', value: 'taobao' },
            { label: '京东', value: 'jingdong' },
            { label: '抖音', value: 'douyin' },
            { label: '小红书', value: 'xiaohongshu' },
            { label: '好好住', value: 'haozhu' },
            { label: '其他', value: 'other' }
        ];

        // Computed
        const currentDate = computed(() => dayjs().format('MM月DD日 dddd'));
        
        const viewTitle = computed(() => {
            const titles = {
                'home': '我的新家',
                'expenses': '账单记录',
                'expense-detail': '账单详情',
                'expense-form': formData.value.id ? '编辑账单' : '记一笔账',
                'concepts': '装修参考',
                'concept-detail': '灵感详情',
                'concept-form': conceptForm.value.id ? '编辑灵感' : '添加灵感'
            };
            return titles[currentView.value] || '装修管理';
        });

        // Navigation
        const navigate = (view, params = null) => {
            fabOpen.value = false;
            transitionName.value = 'slide-left';
            
            // Handle specific view prep
            if (view === 'expense-detail' && params?.id) {
                fetchExpenseDetail(params.id);
            } else if (view === 'expense-form') {
                if (params?.mode === 'edit' && params?.id) {
                    // Populate form for edit
                    const exp = expenses.value.find(e => e.id === params.id) || currentExpense.value;
                    if (exp) {
                        formData.value = { 
                            ...exp, 
                            payment_date: dayjs(exp.payment_date).format('YYYY-MM-DD') 
                        };
                    }
                } else {
                    // Reset form for add
                    formData.value = {
                        title: '',
                        amount: null,
                        category_id: categories.value.length ? categories.value[0].id : '',
                        payment_date: dayjs().format('YYYY-MM-DD'),
                        payment_method: 'wechat',
                        status: 'paid',
                        notes: '',
                        payer_names: ''
                    };
                }
            } else if (view === 'expenses') {
                fetchExpenses();
            } else if (view === 'concepts') {
                fetchConcepts();
            } else if (view === 'concept-detail' && params?.id) {
                fetchConceptDetail(params.id);
            } else if (view === 'concept-form') {
                if (params?.mode === 'edit' && params?.id) {
                    const con = concepts.value.find(c => c.id === params.id) || currentConcept.value;
                    if (con) {
                        conceptForm.value = { ...con };
                        try {
                            conceptImagesPreview.value = JSON.parse(con.image_urls || '[]');
                        } catch(e) { conceptImagesPreview.value = []; }
                    }
                } else {
                    conceptForm.value = {
                        title: '',
                        description: '',
                        style: '',
                        source_type: 'other',
                        reference_link: '',
                        image_urls: '[]'
                    };
                    conceptImagesPreview.value = [];
                }
            }

            viewHistory.value.push(view);
            currentView.value = view;
            updateIcons();
        };

        const goBack = () => {
            if (viewHistory.value.length > 1) {
                transitionName.value = 'slide-right';
                viewHistory.value.pop();
                const previousView = viewHistory.value[viewHistory.value.length - 1];
                
                // Refresh data if going back to list or home
                if (previousView === 'expenses') fetchExpenses();
                if (previousView === 'concepts') fetchConcepts();
                if (previousView === 'home') fetchHomeData();
                
                currentView.value = previousView;
                updateIcons();
            }
        };

        // Data Fetching
        const fetchHomeData = async () => {
            try {
                // Fetch recent expenses
                const res = await axios.get('/api/expenses', { params: { limit: 3 } });
                if (res.data.success) {
                    recentExpenses.value = res.data.data;
                }
                
                // Fetch overview
                const allRes = await axios.get('/api/expenses', { params: { limit: 1000 } });
                if (allRes.data.success) {
                    // Include both 'paid' and 'planned' for the total display on home if needed, 
                    // or just 'paid' if that's the intention. Let's show all expenses for the overview
                    // or specifically paid ones. Usually 'paid' is what people want to see as "已支出"
                    totalExpenses.value = allRes.data.data
                        .filter(e => e.status === 'paid' || e.status === 'planned') // Adjust logic here if needed, but we'll sum all for now or keep 'paid'
                        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                }

                // Fetch timeline stats for progress
                const statsRes = await axios.get('/api/timeline/stats');
                if (statsRes.data.success && statsRes.data.data.overall) {
                    renovationProgress.value = statsRes.data.data.overall.completion_rate || 0;
                }
            } catch (error) {
                console.error('Failed to fetch home data:', error);
            }
        };

        const fetchExpenses = async () => {
            loading.value = true;
            try {
                const res = await axios.get('/api/expenses', { params: { limit: 50 } });
                if (res.data.success) {
                    expenses.value = res.data.data;
                    totalExpenses.value = expenses.value
                        // .filter(e => e.status === 'paid') // removed filter to show total of all items in list
                        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                }
            } catch (error) {
                console.error('Failed to fetch expenses:', error);
            } finally {
                loading.value = false;
            }
        };

        const fetchExpenseDetail = async (id) => {
            try {
                const res = await axios.get(`/api/expenses/${id}`);
                if (res.data.success) {
                    currentExpense.value = res.data.data;
                    nextTick(() => {
                        updateIcons();
                    });
                }
            } catch (error) {
                console.error('Failed to fetch expense detail:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/categories');
                if (res.data.success) {
                    categories.value = res.data.data;
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        const fetchConcepts = async () => {
            loading.value = true;
            try {
                const res = await axios.get('/api/design-concepts', { params: { limit: 50 } });
                if (res.data.success) {
                    concepts.value = res.data.data;
                }
            } catch (error) {
                console.error('Failed to fetch concepts:', error);
            } finally {
                loading.value = false;
            }
        };

        const fetchConceptDetail = async (id) => {
            try {
                const res = await axios.get(`/api/design-concepts/${id}`);
                if (res.data.success) {
                    currentConcept.value = res.data.data;
                    try {
                        currentConceptImages.value = JSON.parse(res.data.data.image_urls || '[]');
                    } catch(e) {
                        currentConceptImages.value = [];
                    }
                    nextTick(() => updateIcons());
                }
            } catch (error) {
                console.error('Failed to fetch concept detail:', error);
            }
        };

        // Actions
        const saveExpense = async () => {
            if (!formData.value.amount || !formData.value.title) return;
            
            saving.value = true;
            try {
                const payload = { ...formData.value, amount: parseFloat(formData.value.amount) };
                let res;
                
                if (payload.id) {
                    res = await axios.put(`/api/expenses/${payload.id}`, payload);
                } else {
                    res = await axios.post('/api/expenses', payload);
                }
                
                if (res.data.success) {
                    goBack();
                }
            } catch (error) {
                alert('保存失败，请重试');
                console.error(error);
            } finally {
                saving.value = false;
            }
        };

        const deleteExpense = async () => {
            if (!currentExpense.value || !confirm('确定要删除这笔账单吗？')) return;
            
            try {
                const res = await axios.delete(`/api/expenses/${currentExpense.value.id}`);
                if (res.data.success) {
                    goBack();
                }
            } catch (error) {
                alert('删除失败，请重试');
            }
        };

        const saveConcept = async () => {
            if (!conceptForm.value.title) return;
            
            saving.value = true;
            try {
                const payload = { ...conceptForm.value };
                payload.image_urls = JSON.stringify(conceptImagesPreview.value);
                
                let res;
                if (payload.id) {
                    res = await axios.put(`/api/design-concepts/${payload.id}`, payload);
                } else {
                    res = await axios.post('/api/design-concepts', payload);
                }
                
                if (res.data.success) {
                    goBack();
                }
            } catch (error) {
                alert('保存失败，请重试');
                console.error(error);
            } finally {
                saving.value = false;
            }
        };

        const deleteConcept = async () => {
            if (!currentConcept.value || !confirm('确定要删除这个灵感吗？')) return;
            try {
                const res = await axios.delete(`/api/design-concepts/${currentConcept.value.id}`);
                if (res.data.success) goBack();
            } catch (error) {
                alert('删除失败，请重试');
            }
        };

        const handleConceptImageUpload = async (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            
            if (conceptImagesPreview.value.length + files.length > 5) {
                alert('最多只能上传 5 张图片');
                return;
            }
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
            
            uploadingImages.value = true;
            try {
                const res = await axios.post('/api/design-concepts/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.success) {
                    conceptImagesPreview.value.push(...res.data.data.urls);
                }
            } catch (error) {
                alert('图片上传失败: ' + (error.response?.data?.error || error.message));
            } finally {
                uploadingImages.value = false;
                // Reset file input
                event.target.value = '';
            }
        };

        const removeConceptImage = (index) => {
            conceptImagesPreview.value.splice(index, 1);
        };

        // Helpers
        const formatAmount = (amount) => {
            return parseFloat(amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = dayjs(dateStr);
            if (date.isSame(dayjs(), 'day')) return '今天';
            if (date.isSame(dayjs().subtract(1, 'day'), 'day')) return '昨天';
            return date.format('MM-DD');
        };

        const getPaymentMethodText = (method) => {
            const m = paymentMethods.find(p => p.value === method);
            return m ? m.label : method;
        };
        
        const getSourceText = (source) => {
            const s = sourceOptions.find(p => p.value === source);
            return s ? s.label : source;
        };
        
        const getConceptCover = (concept) => {
            try {
                const urls = JSON.parse(concept.image_urls || '[]');
                return urls.length > 0 ? urls[0] : null;
            } catch(e) { return null; }
        };

        // UI Styling Helpers based on category name
        const getCategoryConfig = (categoryName) => {
            const name = categoryName || '';
            if (name.includes('硬装') || name.includes('水电') || name.includes('泥瓦')) {
                return { icon: 'hammer', colorClass: 'bg-[#007aff]/10 text-[#007aff]', bgClass: 'bg-[#007aff]' };
            }
            if (name.includes('软装') || name.includes('家具')) {
                return { icon: 'sofa', colorClass: 'bg-[#ff9500]/10 text-[#ff9500]', bgClass: 'bg-[#ff9500]' };
            }
            if (name.includes('设备') || name.includes('家电')) {
                return { icon: 'tv', colorClass: 'bg-[#34c759]/10 text-[#34c759]', bgClass: 'bg-[#34c759]' };
            }
            if (name.includes('设计')) {
                return { icon: 'pen-tool', colorClass: 'bg-[#af52de]/10 text-[#af52de]', bgClass: 'bg-[#af52de]' };
            }
            return { icon: 'receipt', colorClass: 'bg-[#8e8e93]/10 text-[#8e8e93]', bgClass: 'bg-[#8e8e93]' };
        };

        const getCategoryIcon = (name) => getCategoryConfig(name).icon;
        const getCategoryColorClass = (name) => getCategoryConfig(name).colorClass;
        const getCategoryBgClass = (name) => getCategoryConfig(name).bgClass;

        const updateIcons = () => {
            nextTick(() => {
                lucide.createIcons();
            });
        };

        // Scroll state for dynamic header
        const scrolled = ref(false);
        const handleScroll = (e) => {
            scrolled.value = e.target.scrollTop > 50;
        };

        // Random Hero Image
        const heroImages = ['/images/001.png', '/images/002.png'];
        const currentHeroImage = ref(heroImages[Math.floor(Math.random() * heroImages.length)]);

        // Watchers
        watch(currentView, () => {
            scrolled.value = false; // Reset scroll state on view change
            updateIcons();
        });

        // Lifecycle
        onMounted(() => {
            dayjs.locale('zh-cn');
            fetchCategories();
            fetchHomeData();
            updateIcons();
        });

        return {
            // State
            currentView, transitionName, loading, saving, fabOpen,
            expenses, recentExpenses, totalExpenses, categories,
            currentExpense, formData, paymentMethods, renovationProgress,
            concepts, currentConcept, currentConceptImages, conceptForm, conceptImagesPreview, uploadingImages, sourceOptions,
            scrolled, currentHeroImage,
            
            // Computed
            currentDate, viewTitle,
            
            // Actions
            navigate, goBack, saveExpense, deleteExpense, handleScroll,
            saveConcept, deleteConcept, handleConceptImageUpload, removeConceptImage,
            
            // Helpers
            formatAmount, formatDate, getPaymentMethodText, getSourceText, getConceptCover,
            getCategoryIcon, getCategoryColorClass, getCategoryBgClass
        };
    }
});

app.mount('#app');