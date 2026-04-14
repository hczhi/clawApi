<template>
    <div class="expenses-view-root">
        
        <!-- Header Actions & Stats -->
        <div class="stats-header">
            <div class="stat-card primary-stat">
                <div class="stat-info">
                    <p class="stat-label">累计支出 (元)</p>
                    <h2 class="stat-value">{{ helpers.formatAmount(state.totalExpenses) }}</h2>
                </div>
                <div class="stat-actions">
                    <button class="btn-refresh" @click="actions.fetchExpenses()">
                        <i data-lucide="refresh-cw"></i><span>刷新</span>
                    </button>
                    <button class="btn-primary" @click="actions.navigate('expense-form', { mode: 'add' })">
                        <i data-lucide="plus"></i><span>记一笔</span>
                    </button>
                </div>
            </div>
            
            <div class="stat-card secondary-stat">
                <div class="bg-glow"></div>
                <div class="stat-content">
                    <i data-lucide="bar-chart-2" class="stat-icon"></i>
                    <p class="stat-label">账单数量</p>
                    <h3 class="stat-value">{{ state.expenses.length }} <span class="unit">笔</span></h3>
                </div>
            </div>
        </div>

        <!-- Table View -->
        <div class="table-container">
            <div class="table-header">
                <h3 class="table-title">交易记录</h3>
            </div>
            
            <div class="table-scroll-area hide-scrollbar">
                <table class="desktop-table">
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>分类</th>
                            <th>摘要</th>
                            <th>支付方式</th>
                            <th class="text-right">金额 (元)</th>
                            <th class="text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="state.loading" v-for="i in 5" :key="'skeleton-'+i" class="skeleton-row">
                            <td><div class="skeleton-box w-20"></div></td>
                            <td><div class="skeleton-box w-24 h-8 rounded"></div></td>
                            <td><div class="skeleton-box w-32"></div></td>
                            <td><div class="skeleton-box w-16"></div></td>
                            <td class="text-right"><div class="skeleton-box w-24 ml-auto"></div></td>
                            <td></td>
                        </tr>
                        <tr v-else-if="state.expenses.length === 0" class="empty-row">
                            <td colspan="6">
                                <div class="empty-state">
                                    <i data-lucide="receipt"></i>
                                    <p>暂无账单记录</p>
                                </div>
                            </td>
                        </tr>
                        <tr v-else v-for="expense in state.expenses" :key="expense.id" class="data-row" @click="actions.navigate('expense-detail', { id: expense.id })">
                            <td class="nowrap">
                                <p class="date-text">{{ dayjs(expense.payment_date).format('YYYY-MM-DD') }}</p>
                            </td>
                            <td class="nowrap">
                                <div class="category-badge" :class="helpers.getCategoryColorClass(expense.category_name).split(' ')[0]">
                                    <i :data-lucide="helpers.getCategoryIcon(expense.category_name)"></i>
                                    <span>{{ expense.category_name || '其他' }}</span>
                                </div>
                            </td>
                            <td>
                                <p class="title-text truncate">{{ expense.title }}</p>
                                <p v-if="expense.decoration_area" class="subtitle-text">{{ expense.decoration_area }}</p>
                            </td>
                            <td class="nowrap">
                                <span class="method-badge">{{ helpers.getPaymentMethodText(expense.payment_method) }}</span>
                            </td>
                            <td class="nowrap text-right">
                                <span class="amount-text">{{ helpers.formatAmount(expense.amount) }}</span>
                            </td>
                            <td class="nowrap text-center" @click.stop>
                                <div class="row-actions">
                                    <button class="btn-edit" @click="actions.navigate('expense-form', { mode: 'edit', id: expense.id })">
                                        <i data-lucide="edit-2"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, helpers, actions } = useAppStore();
const dayjs = window.dayjs;

onMounted(() => {
    actions.fetchExpenses();
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
@import '/app/scss/_variables.scss';

.expenses-view-root {
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
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    filter: blur(20px);
    transition: transform 0.7s ease;
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
    color: $color-brand-gold;
    margin-bottom: 1rem;
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

/* Table Container */
.table-container {
    flex: 1;
    background-color: $color-white;
    border-radius: 1.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.table-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background-color: rgba($color-brand-light, 0.3);
}

.table-title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
}

.table-scroll-area {
    flex: 1;
    overflow-y: auto;
}

.desktop-table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    
    th {
        padding: 1.25rem 2rem;
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: $color-brand-gray;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        background-color: rgba($color-white, 0.9);
        backdrop-filter: blur(4px);
        position: sticky;
        top: 0;
        z-index: 10;
    }
    
    td {
        padding: 1.25rem 2rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
}

.data-row {
    transition: background-color 0.2s;
    cursor: pointer;
    
    &:hover {
        background-color: rgba($color-brand-light, 0.3);
        
        .row-actions {
            opacity: 1;
        }
    }
}

.nowrap {
    white-space: nowrap;
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.date-text {
    font-size: 0.875rem;
    font-weight: 700;
    color: $color-brand-dark;
}

.category-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
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

.title-text {
    font-size: 0.875rem;
    font-weight: 700;
    color: $color-brand-dark;
    max-width: 20rem;
}

.subtitle-text {
    font-size: 0.75rem;
    color: $color-brand-gray;
    margin-top: 0.25rem;
}

.method-badge {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background-color: $color-brand-light;
    color: $color-brand-dark;
}

.amount-text {
    font-size: 1.125rem;
    font-weight: 900;
    letter-spacing: -0.025em;
    color: $color-brand-dark;
}

.row-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s;
}

.btn-edit {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: $color-white;
    color: $color-brand-dark;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s;
    
    &:hover {
        background-color: $color-brand-light;
    }
    
    i {
        width: 1rem;
        height: 1rem;
    }
}

/* Skeleton Loading */
.skeleton-row {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}

.skeleton-box {
    height: 1rem;
    background-color: $color-brand-light;
    border-radius: 0.25rem;
}

.w-20 { width: 5rem; }
.w-24 { width: 6rem; }
.w-32 { width: 8rem; }
.w-16 { width: 4rem; }
.h-8 { height: 2rem; }
.rounded { border-radius: 0.75rem; }
.ml-auto { margin-left: auto; }

/* Empty State */
.empty-state {
    padding: 4rem 0;
    text-align: center;
    color: $color-brand-gray;
    
    i {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 1rem auto;
        opacity: 0.2;
    }
    
    p {
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.1em;
    }
}
</style>