<template>
    <div class="app-container page-content expense-detail-container pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                RECEIPT
            </span>
        </div>

        <div v-if="state.currentExpense" class="detail-content animate-slide-up">
            <!-- Modern Receipt Card -->
            <div class="receipt-card">
                <div class="card-glow" :class="helpers.getCategoryBgClass(state.currentExpense.category_name)"></div>
                
                <div class="receipt-header">
                    <div class="category-icon" :class="helpers.getCategoryColorClass(state.currentExpense.category_name)">
                        <span class="icon-text">{{ state.currentExpense.category_name ? state.currentExpense.category_name.substring(0,2) : '未' }}</span>
                    </div>
                    <h2 class="receipt-title">{{ state.currentExpense.title }}</h2>
                    <p class="receipt-amount">-{{ helpers.formatAmount(state.currentExpense.amount) }}</p>
                    <span class="status-badge" :class="state.currentExpense.status === 'paid' ? 'paid' : 'planned'">
                        {{ state.currentExpense.status === 'paid' ? '已结清' : '计划开支' }}
                    </span>
                </div>

                <div class="divider"></div>

                <div class="receipt-details">
                    <div class="detail-row">
                        <span class="detail-label">项目分类</span>
                        <span class="detail-value">{{ state.currentExpense.category_name || '-' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">交易日期</span>
                        <span class="detail-value">{{ helpers.formatDate(state.currentExpense.payment_date) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">支付方式</span>
                        <span class="detail-value">{{ helpers.getPaymentMethodText(state.currentExpense.payment_method) }}</span>
                    </div>
                    <div v-if="state.currentExpense.decoration_area" class="detail-row">
                        <span class="detail-label">装修区域</span>
                        <span class="detail-value">{{ state.currentExpense.decoration_area }}</span>
                    </div>
                    <div v-if="state.currentExpense.payer_names" class="detail-row">
                        <span class="detail-label">支付人</span>
                        <span class="detail-value">{{ state.currentExpense.payer_names }}</span>
                    </div>
                    <div v-if="state.currentExpense.vendor_name" class="detail-row">
                        <span class="detail-label">供应商/收款方</span>
                        <span class="detail-value">{{ state.currentExpense.vendor_name }}</span>
                    </div>
                    
                    <div v-if="state.currentExpense.notes" class="notes-section">
                        <span class="notes-label">补充说明</span>
                        <p class="notes-content">{{ state.currentExpense.notes }}</p>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <button @click="actions.navigate('expense-form', { mode: 'edit', id: state.currentExpense.id })" class="btn-edit">
                    编辑账单
                </button>
                <button @click="actions.deleteExpense" class="btn-delete">
                    DEL
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>

<style scoped lang="scss">
.expense-detail-container {
    position: relative;
    display: flex;
    flex-direction: column;
    padding-top: 4rem;
}

.massive-bg-wrapper {
    @include absolute-inset;
    @include flex-center;
    pointer-events: none;
    user-select: none;
    overflow: hidden;
    z-index: 0;
    position: fixed;

    .massive-text {
        font-size: 28vh;
        font-weight: 900;
        color: rgba(0, 0, 0, 0.02);
        letter-spacing: -0.05em;
        white-space: nowrap;
        transform: rotate(-90deg) scale(1.8);
        transform-origin: center;

        @media (min-width: 768px) {
            transform: rotate(0deg) scale(1);
        }
    }
}

.detail-content {
    position: relative;
    z-index: 10;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

.receipt-card {
    @include glassmorphism(rgba(255, 255, 255, 0.9), 24px);
    border-radius: 2rem;
    padding: 2rem;
    @include shadow-hover;
    border: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;

    .card-glow {
        position: absolute;
        right: -3rem;
        top: -3rem;
        width: 8rem;
        height: 8rem;
        border-radius: 50%;
        opacity: 0.1;
        filter: blur(24px);
    }
}

.receipt-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2.5rem;
    position: relative;
    z-index: 10;

    .category-icon {
        width: 4rem;
        height: 4rem;
        border-radius: 1rem;
        @include flex-center;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

        .icon-text {
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
    }

    .receipt-title {
        font-size: 1.25rem; line-height: 1.75rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 0.5rem;
        color: $color-black;
    }

    .receipt-amount {
        font-size: 3rem; line-height: 1;
        font-weight: 900;
        letter-spacing: -0.05em;
        margin: 0.5rem 0;
        color: $color-black;
    }

    .status-badge {
        margin-top: 1rem;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 0.375rem 1rem;
        border-radius: 9999px;

        &.paid {
            background-color: rgba(0, 0, 0, 0.05);
            color: $color-black;
        }

        &.planned {
            background-color: rgba($color-brand-gold, 0.1);
            color: $color-brand-gold;
        }
    }
}

.divider {
    width: 100%;
    border-top: 1px dashed rgba(0, 0, 0, 0.1);
    margin: 1.5rem 0;
}

.receipt-details {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .detail-label {
            font-size: 13px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.4);
        }

        .detail-value {
            font-size: 15px;
            font-weight: 700;
            color: $color-black;
        }
    }

    .notes-section {
        padding-top: 1rem;

        .notes-label {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.4);
            margin-bottom: 0.75rem;
        }

        .notes-content {
            font-size: 14px;
            line-height: 1.6;
            background-color: rgba(0, 0, 0, 0.05);
            padding: 1rem;
            border-radius: 1rem;
            color: $color-black;
        }
    }
}

.action-buttons {
    display: flex;
    gap: 1rem;

    .btn-edit {
        flex: 1;
        background-color: $color-black;
        color: $color-white;
        padding: 1rem 0;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 15px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

        &:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .btn-delete {
        width: 4rem;
        flex-shrink: 0;
        background-color: $color-pure-white;
        color: $color-danger;
        border: 1px solid rgba(0, 0, 0, 0.05);
        @include flex-center;
        border-radius: 9999px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        font-weight: 900;
        font-size: 0.75rem; line-height: 1rem;

        &:hover {
            background-color: rgba($color-danger, 0.05);
            border-color: rgba($color-danger, 0.2);
        }

        &:active {
            transform: scale(0.95);
        }
    }
}
</style>
