<template>
    <div class="desktop-layout-root">
        <!-- Main Content Area -->
        <main class="desktop-main">
            <!-- Scrollable View Container -->
            <div class="main-scroll-container hide-scrollbar">
                <transition name="fade" mode="out-in">
                    <component :is="mainViewComponent" :key="mainView"></component>
                </transition>
            </div>
        </main>

        <!-- Overlay / Drawer for Forms & Details -->
        <transition name="drawer-overlay">
            <div v-if="overlayView" class="modal-overlay-bg" @click="actions.goBack"></div>
        </transition>
        <transition name="drawer-slide">
            <div v-if="overlayView" class="drawer-panel" @click.stop>
                <!-- Drawer Header -->
                <div class="drawer-header">
                    <h3 class="drawer-title">{{ viewTitle }}</h3>
                    <button @click="actions.goBack" class="btn-close">
                        <span>关闭</span>
                    </button>
                </div>
                
                <!-- Drawer Body (Renders the mobile component but constrained in drawer) -->
                <div class="drawer-body">
                    <div class="desktop-drawer-wrapper">
                        <component :is="overlayViewComponent"></component>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Image Preview Modal (Reusing Mobile Logic) -->
        <transition name="fade">
            <div v-if="state.previewModal.show" class="preview-modal-bg" @click="actions.closePreviewModal">
                <button class="btn-close-preview" @click.stop="actions.closePreviewModal">
                    <span>关闭</span>
                </button>
                <img :src="state.previewModal.imageUrl" class="preview-image" @click.stop />
            </div>
        </transition>
        
        <!-- Purchase Confirmation Modal (From Mobile) -->
        <transition name="modal-overlay">
            <div v-if="state.purchaseModal.show" class="modal-overlay-bg" @click="actions.closePurchaseModal">
                <div class="purchase-modal-content" @click.stop>
                    <h3 class="purchase-title">确认购买</h3>
                    <div class="purchase-form">
                        <div class="form-group">
                            <label>实际花费</label>
                            <input type="number" v-model="state.purchaseModal.data.actual_price" placeholder="输入实际付款金额">
                        </div>
                        <div class="form-group">
                            <label>费用分类</label>
                            <select v-model="state.purchaseModal.data.category_id">
                                <option v-for="cat in state.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>付款方式</label>
                            <select v-model="state.purchaseModal.data.payment_method">
                                <option v-for="m in constants.paymentMethods" :key="m.value" :value="m.value">{{ m.label }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>购买日期</label>
                            <input type="date" v-model="state.purchaseModal.data.buy_date">
                        </div>
                        <div class="form-group">
                            <label>付款人 (可选)</label>
                            <input type="text" v-model="state.purchaseModal.data.payer_names" placeholder="谁付的钱">
                        </div>
                        <div class="form-group">
                            <label>备注 (可选)</label>
                            <input type="text" v-model="state.purchaseModal.data.remark" placeholder="购买备注">
                        </div>
                    </div>
                    <div class="purchase-actions">
                        <button @click="actions.closePurchaseModal" class="btn-cancel">取消</button>
                        <button @click="actions.confirmPurchase" class="btn-confirm" :disabled="state.saving">
                            <span v-if="!state.saving">确认</span>
                            <span v-else>保存中...</span>
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, constants, helpers, actions, computedProps } = useAppStore();
const dayjs = window.dayjs;

const showQuickActions = ref(false);

const navItems = [
    { id: 'home', label: '概览仪表盘', icon: 'layout-dashboard' },
    { id: 'expenses', label: '财务账单', icon: 'receipt' },
    { id: 'purchase-plans', label: '采购清单', icon: 'shopping-bag' },
    { id: 'concepts', label: '设计灵感', icon: 'image' },
    { id: 'memos', label: '灵感备忘录', icon: 'book-open' }
];

const mainView = computed(() => state.viewHistory[0] || 'home');
const mainViewComponent = computed(() => {
    const map = {
        'home': 'DesktopDashboard',
        'expenses': 'DesktopExpenses',
        'memos': 'DesktopMemos',
        'concepts': 'DesktopConcepts',
        'purchase-plans': 'DesktopPurchasePlans'
    };
    return map[mainView.value] || 'DesktopDashboard';
});

const overlayView = computed(() => state.viewHistory.length > 1 ? state.viewHistory[state.viewHistory.length - 1] : null);
const overlayViewComponent = computed(() => {
    if (!overlayView.value) return null;
    const map = {
        'expense-detail': 'DesktopExpenseDetail',
        'expense-form': 'ExpenseFormView',
        'concept-detail': 'ConceptDetailView',
        'concept-form': 'ConceptFormView',
        'purchase-plan-detail': 'DesktopPurchasePlanDetail',
        'purchase-plan-form': 'PurchasePlanFormView',
        'memo-detail': 'DesktopMemoDetail',
        'memo-form': 'MemoFormView',
        'area-detail': 'AreaDetailView'
    };
    return map[overlayView.value] || null;
});

const currentDate = computed(() => dayjs().format('YYYY年MM月DD日 dddd'));
const viewTitle = computedProps.viewTitle;

onMounted(() => {
    if (window.dayjs) {
        window.dayjs.locale('zh-cn');
    }
    actions.fetchCategories();
    actions.fetchHomeData();
    actions.fetchExpenses();
    actions.fetchConcepts();
    actions.fetchPurchasePlans();
    actions.fetchMemos();
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
.desktop-layout-root {
    /* 注入空气感轻拟态模式全局变量 (Airy Soft UI) */
    --color-bg-base: #f0f2f5;
    --color-card-white: #ffffff;
    --color-card-cream: #fafafa;
    --color-card-sage: #f0f0f0;
    --color-card-dark: #ffffff;
    --color-text-main: #2d3135;
    --color-text-muted: #88929e;
    --color-brand-coral: #ff6b52;
    --color-brand-green: #34d399;
    --color-brand-green-bg: #dcfce7;
    --shadow-soft: 0 20px 50px rgba(0, 0, 0, 0.02), 0 4px 15px rgba(0, 0, 0, 0.01);

    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    min-width: 1200px;
    min-height: 1200px;
    overflow: auto;
    position: relative;
    background-color: var(--color-bg-base);
    color: var(--color-text-main);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-image: none;
}

/* Main Content Area */
.desktop-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.main-scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    position: relative;
}

/* Drawer & Overlays */
.modal-overlay-bg, .preview-modal-bg {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.drawer-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 50%;
    min-width: 400px;
    max-width: 800px;
    background: var(--color-card-white);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 50px rgba(0, 0, 0, 0.05);
    /* Border radius only on the left side */
    border-top-left-radius: 32px;
    border-bottom-left-radius: 32px;
    border-left: none;
    overflow: hidden;
}

.drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(0,0,0,0.03);
    background: var(--color-card-white);
    z-index: 10;
    
    .drawer-title {
        font-size: 1.25rem;
        font-weight: 400;
        color: var(--color-text-main);
        letter-spacing: 0.02em;
        margin: 0;
    }
    
    .btn-close {
        width: 36px;
        height: 36px;
        background: #f5f6f8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        
        span {
            font-size: 0.75rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            font-weight: 600;
            transition: color 0.3s;
        }

        &:hover {
            background: #e9ecef;
            span {
                color: var(--color-text-main);
            }
        }
    }
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    background: var(--color-bg-base);
}

.desktop-drawer-wrapper {
    height: 100%;
    /* Use CSS variables to let inner mobile components adapt to full width instead of phone width */
    --app-max-width: 100%;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.modal-overlay-enter-active, .modal-overlay-leave-active,
.drawer-overlay-enter-active, .drawer-overlay-leave-active {
    transition: opacity 0.4s ease;
}
.modal-overlay-enter-from, .modal-overlay-leave-to,
.drawer-overlay-enter-from, .drawer-overlay-leave-to {
    opacity: 0;
}

.drawer-slide-enter-active, .drawer-slide-leave-active {
    /* Elastic bounce effect from right */
    transition: transform 0.6s cubic-bezier(0.34, 1.1, 0.64, 1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to {
    transform: translateX(100%);
}

.modal-content-enter-active, .modal-content-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-content-enter-from, .modal-content-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
}
</style>