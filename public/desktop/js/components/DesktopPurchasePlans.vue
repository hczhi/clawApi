<template>
    <div class="purchase-plans-root">
        
        <!-- Header Actions & Stats -->
        <div class="stats-header">
            <div class="stat-card primary-stat">
                <div class="stat-info">
                    <p class="stat-label">采购清单</p>
                    <h2 class="stat-value">总预算 ¥{{ helpers.formatAmount(totalBudget) }}</h2>
                </div>
                <div class="stat-actions">
                    <button class="btn-refresh" @click="actions.fetchPurchasePlans()">
                        <i data-lucide="refresh-cw"></i><span>刷新</span>
                    </button>
                    <button class="btn-primary" @click="actions.navigate('purchase-plan-form', { mode: 'add' })">
                        <i data-lucide="plus"></i><span>加清单</span>
                    </button>
                </div>
            </div>
            
            <div class="stat-card secondary-stat">
                <div class="bg-glow"></div>
                <div class="stat-content-row">
                    <div class="stat-left">
                        <i data-lucide="shopping-bag" class="stat-icon"></i>
                        <p class="stat-label">完成进度</p>
                        <h3 class="stat-value">{{ completedCount }} <span class="unit">/ {{ state.purchasePlans.length }}</span></h3>
                    </div>
                    <div class="progress-ring-container">
                        <svg class="progress-ring" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" class="ring-bg"></circle>
                            <circle cx="18" cy="18" r="16" fill="none" class="ring-fill" :stroke-dashoffset="100 - progress"></circle>
                        </svg>
                        <span class="progress-text">{{ progress }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Kanban Board View -->
        <div class="kanban-board hide-scrollbar">
            
            <!-- Column 1: 计划中 -->
            <div class="kanban-column">
                <div class="column-header">
                    <h3 class="column-title">计划采购</h3>
                    <span class="column-badge dark-badge">{{ pendingPlans.length }}</span>
                </div>
                <div class="column-body hide-scrollbar">
                    <div v-for="plan in pendingPlans" :key="plan.id" 
                        class="plan-card"
                        @click="actions.fetchPurchasePlanDetail(plan.id)">
                        
                        <div class="plan-header">
                            <div class="category-badge" :class="helpers.getCategoryColorClass(plan.category_name).split(' ')[0]">
                                <i :data-lucide="helpers.getCategoryIcon(plan.category_name)"></i>
                                <span>{{ plan.category_name || '未分类' }}</span>
                            </div>
                            <span class="status-badge status-pending">计划</span>
                        </div>
                        
                        <h4 class="plan-title truncate">{{ plan.item_name }}</h4>
                        <p class="plan-subtitle truncate">{{ plan.decoration_area || '未分配区域' }}</p>
                        
                        <div class="plan-footer">
                            <span class="footer-label">预计预算</span>
                            <span class="footer-value">¥{{ helpers.formatAmount(plan.estimated_budget) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 2: 已购买 -->
            <div class="kanban-column">
                <div class="column-header">
                    <h3 class="column-title">已购入</h3>
                    <span class="column-badge success-badge">{{ completedPlans.length }}</span>
                </div>
                <div class="column-body hide-scrollbar">
                    <div v-for="plan in completedPlans" :key="plan.id" 
                        class="plan-card opacity-70 hover-opacity-100"
                        @click="actions.fetchPurchasePlanDetail(plan.id)">
                        
                        <div class="plan-header">
                            <div class="category-badge bg-success-light text-success">
                                <i data-lucide="check-circle"></i>
                                <span>已购买</span>
                            </div>
                        </div>
                        
                        <h4 class="plan-title truncate">{{ plan.item_name }}</h4>
                        <p class="plan-subtitle truncate">{{ plan.merchant_name || '未记录商家' }}</p>
                        
                        <div class="plan-footer">
                            <span class="footer-label">实际花费</span>
                            <div class="price-group">
                                <span class="price-old">¥{{ helpers.formatAmount(plan.estimated_budget) }}</span>
                                <span class="price-new">¥{{ helpers.formatAmount(plan.actual_price) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 3: 已取消 -->
            <div class="kanban-column">
                <div class="column-header opacity-50">
                    <h3 class="column-title">已取消</h3>
                    <span class="column-badge gray-badge">{{ cancelledPlans.length }}</span>
                </div>
                <div class="column-body hide-scrollbar">
                    <div v-for="plan in cancelledPlans" :key="plan.id" 
                        class="plan-card disabled-card"
                        @click="actions.fetchPurchasePlanDetail(plan.id)">
                        <h4 class="plan-title line-through truncate">{{ plan.item_name }}</h4>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, actions, helpers } = useAppStore();

const pendingPlans = computed(() => state.purchasePlans.filter(p => p.status === '计划'));
const completedPlans = computed(() => state.purchasePlans.filter(p => p.status === '已购买'));
const cancelledPlans = computed(() => state.purchasePlans.filter(p => p.status === '取消'));

const totalBudget = computed(() => {
    return state.purchasePlans.reduce((sum, p) => sum + parseFloat(p.estimated_budget || 0), 0);
});

const completedCount = computed(() => completedPlans.value.length);
const progress = computed(() => {
    if (state.purchasePlans.length === 0) return 0;
    return Math.round((completedCount.value / state.purchasePlans.length) * 100);
});

onMounted(() => {
    actions.fetchPurchasePlans();
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
@import '/app/scss/_variables.scss';

.purchase-plans-root {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
}

/* Header Stats */
.stats-header {
    display: flex;
    gap: 1.5rem;
    flex-shrink: 0;
}

.stat-card {
    border-radius: 1.5rem;
    padding: 2rem;
    position: relative;
    overflow: hidden;
}

.primary-stat {
    flex: 2;
    background-color: $color-white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.secondary-stat {
    flex: 1;
    background-color: $color-brand-dark;
    color: $color-white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    &:hover .bg-glow {
        transform: scale(1.5);
    }
}

.bg-glow {
    position: absolute;
    right: -2.5rem;
    bottom: -2.5rem;
    width: 8rem;
    height: 8rem;
    background-color: rgba($color-brand-accent, 0.2);
    border-radius: 50%;
    filter: blur(20px);
    transition: transform 0.7s ease;
}

.stat-content-row {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.stat-label {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $color-brand-gray;
    margin-bottom: 0.5rem;
}

.secondary-stat .stat-label {
    color: rgba(255, 255, 255, 0.5);
}

.stat-value {
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    color: $color-brand-dark;
    line-height: 1;
}

.secondary-stat .stat-value {
    color: $color-white;
    font-size: 1.875rem;
}

.unit {
    font-size: 1.125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
}

.stat-icon {
    width: 2rem;
    height: 2rem;
    color: $color-brand-accent;
    margin-bottom: 1rem;
}

.progress-ring-container {
    width: 4rem;
    height: 4rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.ring-bg {
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 4;
}

.ring-fill {
    stroke: $color-brand-accent;
    stroke-width: 4;
    stroke-dasharray: 100 100;
    transition: stroke-dashoffset 1s ease-out;
}

.progress-text {
    position: absolute;
    font-size: 0.75rem;
    font-weight: 700;
    color: $color-white;
}

.stat-actions {
    display: flex;
    gap: 1rem;
}

.btn-refresh, .btn-primary {
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    
    i {
        width: 1.25rem;
        height: 1.25rem;
    }
}

.btn-refresh {
    background-color: $color-brand-light;
    color: $color-brand-dark;
    
    &:hover {
        background-color: rgba($color-brand-gray, 0.2);
    }
}

.btn-primary {
    background-color: $color-brand-accent;
    color: $color-white;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    &:hover {
        opacity: 0.9;
    }
}

/* Kanban Board */
.kanban-board {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
}

.kanban-column {
    width: 24rem;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: rgba($color-white, 0.5);
    border-radius: 1.5rem;
    padding: 1.5rem;
    border: 1px solid $color-white;
}

.column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-shrink: 0;
}

.column-title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: $color-brand-dark;
}

.column-badge {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
}

.dark-badge {
    background-color: $color-brand-dark;
    color: $color-white;
}

.success-badge {
    background-color: $color-success;
    color: $color-white;
}

.gray-badge {
    background-color: rgba($color-brand-gray, 0.2);
    color: $color-brand-dark;
}

.column-body {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-right: 0.5rem;
}

.plan-card {
    background-color: $color-white;
    padding: 1.5rem;
    border-radius: 1.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
    }
}

.opacity-70 { opacity: 0.7; }
.hover-opacity-100:hover { opacity: 1; }
.opacity-50 { opacity: 0.5; }

.disabled-card {
    background-color: $color-brand-light;
    opacity: 0.5;
    box-shadow: none;
    
    &:hover {
        box-shadow: none;
    }
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.category-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    
    i {
        width: 1rem;
        height: 1rem;
    }
}

.bg-\[\#007aff\]\/10 { background-color: rgba(0, 122, 255, 0.1); color: #007aff; }
.bg-\[\#ff9500\]\/10 { background-color: rgba(255, 149, 0, 0.1); color: #ff9500; }
.bg-\[\#34c759\]\/10 { background-color: rgba(52, 199, 89, 0.1); color: #34c759; }
.bg-\[\#af52de\]\/10 { background-color: rgba(175, 82, 222, 0.1); color: #af52de; }
.bg-\[\#8e8e93\]\/10 { background-color: rgba(142, 142, 147, 0.1); color: #8e8e93; }

.bg-success-light { background-color: rgba($color-success, 0.1); }
.text-success { color: $color-success; }

.status-badge {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
}

.status-pending {
    color: $color-brand-accent;
    background-color: rgba($color-brand-accent, 0.1);
}

.plan-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: $color-brand-dark;
}

.line-through {
    text-decoration: line-through;
}

.plan-subtitle {
    font-size: 0.75rem;
    color: $color-brand-gray;
    margin-bottom: 1rem;
}

.plan-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding-top: 1rem;
}

.footer-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: $color-brand-gray;
}

.footer-value {
    font-size: 1.125rem;
    font-weight: 900;
    letter-spacing: -0.025em;
    color: $color-brand-dark;
}

.price-group {
    display: flex;
    align-items: center;
}

.price-old {
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: $color-brand-dark;
    text-decoration: line-through;
    opacity: 0.4;
    margin-right: 0.5rem;
}

.price-new {
    font-size: 1.125rem;
    font-weight: 900;
    letter-spacing: -0.025em;
    color: $color-success;
}
</style>