<template>
    <div class="app-container page-content expense-detail-container pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                PLAN
            </span>
        </div>

        <div v-if="state.currentPurchasePlan" class="detail-content animate-slide-up">
            <!-- Modern Receipt Card -->
            <div class="receipt-card">
                <div class="card-glow" :class="helpers.getCategoryBgClass(state.currentPurchasePlan.category_id)"></div>
                
                <div class="receipt-header">
                    <!-- <div class="category-icon" :class="helpers.getCategoryColorClass(state.currentPurchasePlan.category_id)">
                        <span class="icon-text">{{ state.currentPurchasePlan.category_id ? String(state.currentPurchasePlan.category_id).substring(0,2) : '未' }}</span>
                    </div> -->
                    <h2 class="receipt-title">{{ state.currentPurchasePlan.item_name }}</h2>
                    <p class="receipt-amount" v-if="state.currentPurchasePlan.status === '已购买'">¥{{ helpers.formatAmount(state.currentPurchasePlan.actual_price) }}</p>
                    <p class="receipt-amount" v-else style="font-size: 2rem; color: #888;">¥{{ helpers.formatAmount(state.currentPurchasePlan.estimated_budget) }}</p>
                    
                    <span class="status-badge" :class="state.currentPurchasePlan.status === '已购买' ? 'status-purchased' : (state.currentPurchasePlan.status === '取消' ? 'status-cancelled' : 'status-planned')">
                        {{ state.currentPurchasePlan.status }}
                    </span>
                </div>

                <div class="divider"></div>

                <div class="receipt-details">
                    <div class="detail-row">
                        <span class="detail-label">项目分类</span>
                        <span class="detail-value">{{ state.currentPurchasePlan.category_id || '-' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">购买方式</span>
                        <span class="detail-value">{{ state.currentPurchasePlan.purchase_method || '-' }}</span>
                    </div>
                    <div v-if="state.currentPurchasePlan.decoration_area" class="detail-row">
                        <span class="detail-label">使用区域</span>
                        <span class="detail-value">{{ state.currentPurchasePlan.decoration_area }}</span>
                    </div>
                    <div class="detail-row" v-if="state.currentPurchasePlan.status === '已购买' && state.currentPurchasePlan.estimated_budget">
                        <span class="detail-label">预算对比</span>
                        <span class="detail-value" :style="{color: state.currentPurchasePlan.budget_diff > 0 ? '#ff3b30' : '#34c759'}">
                            {{ state.currentPurchasePlan.budget_diff > 0 ? '超支' : '节约' }} ¥{{ Math.abs(state.currentPurchasePlan.budget_diff) }}
                        </span>
                    </div>
                    <div v-if="state.currentPurchasePlan.merchant_name" class="detail-row">
                        <span class="detail-label">商家名称</span>
                        <span class="detail-value">{{ state.currentPurchasePlan.merchant_name }}</span>
                    </div>
                    <div v-if="state.currentPurchasePlan.product_link" class="detail-row">
                        <span class="detail-label">商品链接</span>
                        <a :href="state.currentPurchasePlan.product_link" target="_blank" class="detail-value" style="color: #007aff; text-decoration: underline; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">打开链接</a>
                    </div>
                    
                    <div v-if="state.currentPurchasePlan.notes" class="notes-section">
                        <span class="notes-label">备注</span>
                        <p class="notes-content">{{ state.currentPurchasePlan.notes }}</p>
                    </div>
                </div>
                <div v-if="state.currentPurchasePlan.image_urls && state.currentPurchasePlan.image_urls !== '[]'" class="detail-section animate-slide-up" style="animation-delay: 0.1s;">
    
                <div class="image-gallery">
                    <img v-for="(img, idx) in JSON.parse(state.currentPurchasePlan.image_urls)" 
                         :key="idx" :src="img" class="gallery-image" 
                         @click="actions.previewImage(img)" />
                </div>
            </div>
            </div>

            
            
            <div class="action-buttons animate-slide-up" style="animation-delay: 0.2s;">
                <button v-if="state.currentPurchasePlan.status !== '已购买'" @click="actions.openPurchaseModal" class="btn-purchase">
                    标为已购买
                </button>
                <button @click="actions.navigate('purchase-plan-form', { mode: 'edit', id: state.currentPurchasePlan.id })" class="btn-edit">
                    编辑清单
                </button>
                <button @click="actions.deletePurchasePlan" class="btn-delete">
                    DEL
                </button>
            </div>
        </div>

        <!-- Purchase Modal -->
        <div v-if="state.purchaseModal.show" class="modal-overlay">
            <div class="modal-content animate-slide-up">
                <div class="modal-header">
                    <h3>确认已购买</h3>
                    <button @click="actions.closePurchaseModal" class="btn-close">✕</button>
                </div>
                <div class="modal-body form-fields">
                    <div class="form-group">
                        <label class="field-label">实际付款金额 (¥)</label>
                        <input type="number" step="0.01" v-model="state.purchaseModal.data.actual_price" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="field-label">支付人</label>
                        <input type="text" v-model="state.purchaseModal.data.payer_names" class="form-input" placeholder="例如：张三, 李四">
                    </div>
                    <div class="form-group">
                        <label class="field-label">支付方式</label>
                        <div class="chip-group">
                            <div v-for="method in constants.paymentMethods" :key="method.value"
                                 @click="state.purchaseModal.data.payment_method = method.value"
                                 class="chip" :class="{ 'active': state.purchaseModal.data.payment_method === method.value }">
                                {{ method.label }}
                            </div>
                        </div>
                    </div>
                    <!-- <div class="form-group">
                        <label class="field-label">账单分类</label>
                        <div class="select-wrapper">
                            <select v-model="state.purchaseModal.data.category_id" class="form-select">
                                <option v-for="cat in state.categories" :key="cat.id" :value="cat.id">
                                    {{ cat.level > 1 ? '└ ' + cat.name : cat.name }}
                                </option>
                            </select>
                            <span class="select-arrow">▼</span>
                        </div>
                    </div> -->
                </div>
                <div class="modal-footer">
                    <button @click="actions.confirmPurchase" class="btn-submit" :disabled="state.saving">
                        {{ state.saving ? '处理中...' : '确认并记账' }}
                    </button>
                </div>
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
    margin: 0 2rem;
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

        &.status-planned {
            background-color: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.6);
        }
        &.status-purchased {
            background-color: rgba(52, 199, 89, 0.1);
            color: #34c759;
        }
        &.status-cancelled {
            background-color: rgba(255, 59, 48, 0.1);
            color: #ff3b30;
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

    .btn-purchase {
        flex: 1;
        background-color: #34c759;
        color: $color-white;
        padding: 1rem 0;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 15px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(52, 199, 89, 0.3);

        &:hover {
            box-shadow: 0 10px 15px -3px rgba(52, 199, 89, 0.4);
            transform: translateY(-2px);
        }

        &:active {
            transform: scale(0.95);
        }
    }

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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: flex-end;
    @media (min-width: 768px) { align-items: center; justify-content: center; }
}

.modal-content {
    background: #fff;
    width: 100%;
    max-width: 500px;
    border-radius: 2rem 2rem 0 0;
    padding: 2rem;
    @media (min-width: 768px) { border-radius: 2rem; }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    h3 { font-size: 1.25rem; font-weight: 800; color: #111; }
    .btn-close { 
        font-size: 1.5rem; opacity: 0.5; cursor: pointer; 
        transition: opacity 0.3s;
        &:hover { opacity: 1; }
    }
}

.modal-footer {
    margin-top: 2rem;
    .btn-submit {
        width: 100%;
        background: #111;
        color: #fff;
        padding: 1rem;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 16px;
        transition: transform 0.2s;
        &:active { transform: scale(0.98); }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
}

.form-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    
    .field-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.75rem;
        margin-left: 0.25rem;
    }
}

.form-input, .form-select {
    width: 100%;
    background-color: rgba(0,0,0,0.03);
    color: $color-black;
    font-size: 15px;
    font-weight: 700;
    padding: 1rem 1.25rem;
    border-radius: 2rem;
    outline: none;
    border: 1px solid transparent;
    transition: all 0.3s ease;

    &:focus {
        background-color: #fff;
        border-color: rgba(0,0,0,0.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
}

.form-select {
    appearance: none;
    cursor: pointer;
}

.select-wrapper {
    position: relative;
    .select-arrow {
        position: absolute;
        right: 1.25rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        color: rgba(0, 0, 0, 0.4);
        pointer-events: none;
    }
}

.chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .chip {
        background-color: rgba(0,0,0,0.03);
        padding: 0.75rem 1.25rem;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.6);
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;

        &:hover {
            background-color: rgba(0,0,0,0.06);
        }

        &.active {
            background-color: $color-black;
            color: $color-white;
            transform: scale(1.05);
        }
    }
}
</style>