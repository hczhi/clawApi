<template>
    <div class="myhome-container app-container pb-safe">
        
        <!-- Background Layer -->
        <div class="myhome-bg-layer">
            <div class="massive-text">PLAN</div>
        </div>

        <!-- Main Panel (Left on Desktop, Top on Mobile) -->
        <div class="main-glass-panel">
            <div class="panel-content hide-scrollbar">
                
                <!-- Header -->
                <div class="date-header animate-slide-right" style="animation-delay: 0.1s;">
                    <div class="category-label">{{ state.currentPurchasePlan?.category_id || '未分类' }}</div>
                    <h2 class="item-title">{{ state.currentPurchasePlan?.item_name || '加载中...' }}</h2>
                </div>
                
                <!-- Info Block -->
                <div class="info-block animate-slide-right" style="animation-delay: 0.2s;">
                    <div class="info-row">
                        <span class="label">状态</span>
                        <span class="value status" :class="statusClass">{{ state.currentPurchasePlan?.status }}</span>
                    </div>
                    <div class="info-row" v-if="state.currentPurchasePlan?.decoration_area">
                        <span class="label">区域</span>
                        <span class="value">{{ state.currentPurchasePlan.decoration_area }}</span>
                    </div>
                    <div class="info-row" v-if="state.currentPurchasePlan?.estimated_budget">
                        <span class="label">预算</span>
                        <span class="value">¥{{ helpers.formatAmount(state.currentPurchasePlan.estimated_budget) }}</span>
                    </div>
                    <div class="info-row" v-if="state.currentPurchasePlan?.actual_price">
                        <span class="label">{{ state.currentPurchasePlan?.status === '已购买' ? '实付' : '方案金额' }}</span>
                        <span class="value font-black">¥{{ helpers.formatAmount(state.currentPurchasePlan.actual_price) }}</span>
                    </div>
                    <div class="info-row" v-if="state.currentPurchasePlan?.buy_date">
                        <span class="label">购买日期</span>
                        <span class="value">{{ state.currentPurchasePlan.buy_date }}</span>
                    </div>
                </div>
                

                

                <!-- Plans Area (Right on Desktop, Bottom on Mobile) -->
        <div class="plans-area animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="right-top-text">
                <div class="title">方案选项</div>
                <div class="subtitle">滑动查看对比</div>
            </div>

            <div class="plans-scroll-container">
                <div class="plans-scroll-track hide-scrollbar">
                    <div v-for="planOption in parsedPlans" :key="planOption.id" 
                         class="plan-swipe-card" 
                         :class="{ 'is-active-plan': state.currentPurchasePlan?.selected_plan_id === planOption.id }">
                        
                        <div class="plan-card-header">
                            <div class="plan-name-group">
                                <span class="active-indicator" v-if="state.currentPurchasePlan?.selected_plan_id === planOption.id">当前选用</span>
                                <button class="select-plan-btn" 
                                        v-else-if="state.currentPurchasePlan?.status !== '已购买' && state.currentPurchasePlan?.status !== '取消' && parsedPlans.length > 1"
                                        @click="actions.selectPurchasePlanOption(planOption.id)"
                                        :disabled="state.saving">
                                    {{ state.saving ? '设置中...' : '设为选用' }}
                                </button>
                                <h3 class="plan-name">{{ planOption.name || '方案' }}</h3>
                            </div>
                            <span class="plan-price" v-if="planOption.price">¥{{ helpers.formatAmount(planOption.price) }}</span>
                            <span class="plan-price empty" v-else>未报价</span>
                        </div>

                        <div class="plan-details-grid">
                            <div class="grid-item">
                                <span class="grid-label">购买方式</span>
                                <span class="grid-value">{{ planOption.purchase_method || '—' }}</span>
                            </div>
                            <div class="grid-item">
                                <span class="grid-label">商家名称</span>
                                <span class="grid-value">{{ planOption.merchant_name || '—' }}</span>
                            </div>
                            <div class="grid-item full-width">
                                <span class="grid-label">商品链接</span>
                                <a v-if="planOption.product_link" :href="planOption.product_link" target="_blank" class="grid-value link">
                                    访问链接 <i data-lucide="external-link" class="inline-icon"></i>
                                </a>
                                <span v-else class="grid-value empty">—</span>
                            </div>
                            <div class="grid-item full-width">
                                <span class="grid-label">备注</span>
                                <p class="grid-value notes" v-if="planOption.notes">{{ planOption.notes }}</p>
                                <span v-else class="grid-value empty">—</span>
                            </div>
                        </div>

                        <div class="plan-images">
                            <span class="grid-label">相关图片</span>
                            <div v-if="planOption.image_urls && planOption.image_urls !== '[]'" class="image-row hide-scrollbar">
                                <img v-for="(img, idx) in JSON.parse(planOption.image_urls)" 
                                     :key="idx" :src="img" class="plan-img" 
                                     @click="actions.previewImage(img)" />
                            </div>
                            <span v-else class="grid-value empty">—</span>
                        </div>
                    </div>
                    
                    <!-- Empty State -->
                    <div v-if="parsedPlans.length === 0" class="empty-state-card">
                        <i data-lucide="inbox" class="empty-icon"></i>
                        <span class="empty-text">暂无方案</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
                <div class="area-buttons animate-slide-right" style="animation-delay: 0.3s;">
                    <button v-if="state.currentPurchasePlan?.status !== '已购买'" 
                            @click="actions.openPurchaseModal"
                            class="area-btn purchase-btn group">
                        <div class="btn-left">
                            <span class="label">标为已购买</span>
                        </div>
                        <div class="btn-icon"><i data-lucide="check"></i></div>
                    </button>
                </div>
                   <div class="right-bottom-actions animate-fade-in-up" style="animation-delay: 0.5s;">
            <button @click="actions.deletePurchasePlan" class="delete-float-btn group">
                <span class="label">删除</span>
                <div class="icon-wrap">
                    <i data-lucide="trash-2"></i>
                </div>
            </button>
            <button @click="actions.navigate('purchase-plan-form', { mode: 'edit', id: state.currentPurchasePlan?.id })" class="edit-btn group">
                <span class="label">编辑</span>
                <div class="icon-wrap">
                    <i data-lucide="edit-2"></i>
                </div>
            </button>
        </div>
                <div class="logo-bottom animate-slide-right" style="animation-delay: 0.6s;">
                    <i data-lucide="box" class="brand-icon"></i>
                    <span class="logo-text">C.Lab / Purchase</span>
                </div>
            </div>

                <!-- Floating Edit Button -->
     
        </div>

        

    

        <!-- Purchase Modal -->
        <div v-if="state.purchaseModal.show" class="modal-overlay">
            <div class="modal-content animate-slide-up">
                <div class="modal-header">
                    <h3>确认已购买</h3>
                    <button @click="actions.closePurchaseModal" class="btn-close"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body form-fields">
                    <div class="form-group">
                        <label class="field-label">实际付款金额 (¥)</label>
                        <input type="number" step="0.01" v-model="state.purchaseModal.data.actual_price" class="form-input" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label class="field-label">购买日期</label>
                        <input type="date" v-model="state.purchaseModal.data.buy_date" class="form-input" required>
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
                    <div class="form-group">
                        <label class="field-label">备注</label>
                        <input type="text" v-model="state.purchaseModal.data.remark" class="form-input" placeholder="选填，记录一些额外信息">
                    </div>
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
import { computed, onMounted, nextTick } from 'vue';
import { useAppStore } from '../store.js';
const { state, constants, helpers, actions } = useAppStore();

const parsedPlans = computed(() => {
    if (!state.currentPurchasePlan || !state.currentPurchasePlan.plans) return [];
    try {
        return JSON.parse(state.currentPurchasePlan.plans);
    } catch(e) {
        return [];
    }
});

const statusClass = computed(() => {
    if (!state.currentPurchasePlan) return '';
    if (state.currentPurchasePlan.status === '已购买') return 'status-purchased';
    if (state.currentPurchasePlan.status === '取消') return 'status-cancelled';
    return 'status-planned';
});

onMounted(() => {
    nextTick(() => {
        if (window.lucide) window.lucide.createIcons();
    });
});
</script>

<style scoped lang="scss">
$color-black: #2A2522;
$color-white: #FAF9F6;
$color-gray-100: rgba(42, 37, 34, 0.05);
$color-gray-200: rgba(42, 37, 34, 0.1);
$color-gray-500: rgba(42, 37, 34, 0.4);
$color-gray-800: rgba(42, 37, 34, 0.8);
$color-success: #6CA674;
$color-danger: #D96C6C;

.myhome-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: $color-white;
    color: $color-black;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.hide-scrollbar {
    &::-webkit-scrollbar { display: none; }
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.myhome-bg-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-color: $color-white;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .massive-text {
        font-size: 32vh;
        font-weight: 900;
        color: $color-gray-100;
        letter-spacing: -0.06em;
        white-space: nowrap;
        transform: rotate(-90deg) scale(1.5);
        user-select: none;
        
        @media (min-width: 640px) {
            transform: rotate(0deg) scale(1);
            font-size: 28vh;
        }
    }
}

/* Glass Panel */
.main-glass-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 10;
    background: rgba(250, 250, 250, 0.85);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.03);
    border-bottom: 1px solid $color-gray-200;
    display: flex;
    flex-direction: column;
    border-radius: 0 0 2rem 2rem;
    overflow: hidden;
    transition: all 0.5s ease-out;

    @media (min-width: 640px) {
        width: 35%;
        height: 100%;
        border-radius: 0 2rem 2rem 0;
        border-bottom: none;
        border-right: 1px solid $color-gray-200;
    }

    .panel-content {
        padding: 2.5rem 2rem 2rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;

        @media (min-width: 640px) {
            padding: 5rem 3rem 3rem;
        }
    }
}

/* Typography inside Panel */
.date-header {
    margin-bottom: 2.5rem;
    margin-top: 2.5rem;
    .category-label {
        font-size: 10px;
        color: $color-gray-500;
        font-weight: 800;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 0.75rem;
    }

    .item-title {
        font-size: 2.5rem;
        line-height: 1.1;
        font-weight: 900;
        letter-spacing: -0.04em;
        color: $color-black;
        word-break: break-all;

        @media (min-width: 640px) {
            font-size: 3.5rem;
        }
    }
}

.info-block {
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid $color-gray-100;
        padding-bottom: 1.25rem;

        &:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .label {
            font-weight: 700;
            color: $color-gray-500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 10px;
        }

        .value {
            font-weight: 600;
            color: $color-gray-800;
            font-size: 14px;

            &.font-black {
                font-weight: 900;
                color: $color-black;
                font-size: 16px;
            }

            &.status {
                padding: 0.35rem 1rem;
                border-radius: 9999px;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 0.05em;
                text-transform: uppercase;

                &.status-planned { background-color: $color-gray-100; color: $color-gray-800; }
                &.status-purchased { background-color: $color-success; color: $color-white; }
                &.status-cancelled { background-color: transparent; border: 1px solid $color-danger; color: $color-danger; text-decoration: line-through; }
            }
        }
    }
}

.area-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;

    .area-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1.5rem;
        border-radius: 9999px;
        transition: all 0.3s ease;
        cursor: pointer;

        .btn-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .label {
                font-weight: 800;
                font-size: 12px;
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
        }

        .btn-icon {
            width: 2.25rem;
            height: 2.25rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;

            i {
                width: 1rem;
                height: 1rem;
                transition: all 0.3s ease;
            }
        }

        &.purchase-btn {
            background-color: #0bab21;
            color: $color-white;
            border: 1px solid $color-success;
            
            .btn-icon { background-color: rgba(255,255,255,0.15); i { color: $color-white; } }
            
            &:hover { 
                background-color: transparent; 
                color: $color-primary;
                .btn-icon { background-color: $color-gray-100; i { color: $color-primary; transform: scale(1.1); } }
            }
        }
    }
}

.logo-bottom {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-top: auto;
    position: relative;
    top:-50px;
    .brand-icon {
        width: 1.5rem;
        height: 1.5rem;
        color: $color-black;
        opacity: 0.2;
    }

    .logo-text {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.15em;
        color: $color-gray-500;
        text-transform: uppercase;
    }
}

/* Plans Area */
.plans-area {
        position: relative;
    left: 0;
    width: 100%;
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (min-width: 640px) {
        top: 0;
        left: 35%;
        width: 65%;
        height: 100%;
    }
}

.right-top-text {
    z-index: 10;
    text-align: right;

    @media (min-width: 640px) {
        top: 4rem;
        right: 4rem;
    }

    .title {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: $color-black;
        text-transform: uppercase;
    }

    .subtitle {
        font-size: 12px;
        color: $color-gray-500;
        font-weight: 600;
        margin-top: 0.25rem;
    }
}

.plans-scroll-container {
    width: 100%;
    margin-top: 1.5rem;
    
    .plans-scroll-track {
        display: flex;
        gap: 1.5rem;
        padding: 0 2rem;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 3rem; /* space for shadow */
    }

    .empty-state-card {
        scroll-snap-align: center;
        flex: 0 0 85vw;
        max-width: 400px;
        background: transparent;
        border: 1px dashed $color-gray-200;
        border-radius: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-height: 300px;

        .empty-icon { width: 2rem; height: 2rem; color: $color-gray-500; opacity: 0.5; }
        .empty-text { font-size: 12px; font-weight: 700; color: $color-gray-500; letter-spacing: 0.1em; text-transform: uppercase; }
    }

    .plan-swipe-card {
        scroll-snap-align: center;
        flex: 0 0 85vw;
        max-width: 400px;
        background: rgba(250, 250, 250, 0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 2rem;
        padding: 2rem;
        border: 1px solid $color-gray-100;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 2rem;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 50vh;
        overflow-y: auto;

        @media (min-width: 640px) {
            max-height: 65vh;
        }

        &:hover {
            // transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08);
        }

        &.is-active-plan {
            background: #ffffff;
            border: 2px solid #f8bf9d;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
        }

        .plan-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            .plan-name-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;

                .active-indicator {
                    font-size: 10px;
                    font-weight: 800;
                    color: $color-black;
                    background: $color-gray-100;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    width: fit-content;
                }

                .select-plan-btn {
                    font-size: 10px;
                    font-weight: 800;
                    color: $color-white;
                    background: $color-primary;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    width: fit-content;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid $color-primary;
                    outline: none;

                    &:hover {
                        background: transparent;
                        color: $color-primary;
                    }
                    &:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                }

                .plan-name {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: $color-black;
                    letter-spacing: -0.02em;
                }
            }

            .plan-price {
                font-size: 1.5rem;
                font-weight: 900;
                letter-spacing: -0.05em;
                color: $color-black;

                &.empty {
                    font-size: 1rem;
                    color: $color-gray-500;
                    font-weight: 700;
                }
            }
        }

        .plan-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;

            .grid-item {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;

                &.full-width {
                    grid-column: span 2;
                }

                .grid-label {
                    font-size: 10px;
                    font-weight: 800;
                    color: $color-gray-500;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .grid-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: $color-black;
                    word-break: break-all;
                    line-height: 1.5;

                    &.empty {
                        color: $color-gray-500;
                        font-weight: 500;
                    }

                    &.link {
                        color: $color-black;
                        text-decoration: none;
                        background: $color-gray-100;
                        padding: 0.5rem 1rem;
                        border-radius: 9999px;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        width: fit-content;
                        font-size: 12px;
                        font-weight: 700;
                        transition: background-color 0.2s;

                        &:hover { background: $color-gray-200; }

                        .inline-icon { width: 12px; height: 12px; }
                    }

                    &.notes {
                        font-weight: 500;
                        color: $color-gray-800;
                        background: $color-gray-100;
                        padding: 1rem;
                        border-radius: 1rem;
                    }
                }
            }
        }

        .plan-images {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;

            .grid-label {
                font-size: 10px;
                font-weight: 800;
                color: $color-gray-500;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            .image-row {
                display: flex;
                gap: 0.75rem;
                overflow-x: auto;
                padding-bottom: 0.5rem;

                .plan-img {
                    width: 4.5rem;
                    height: 4.5rem;
                    object-fit: cover;
                    border-radius: 1rem;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: transform 0.2s;

                    &:hover { transform: scale(1.05); }
                }
            }

            .empty {
                font-size: 14px;
                font-weight: 500;
                color: $color-gray-500;
            }
        }
    }
}

/* Floating Actions */
.right-bottom-actions {
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 1rem;
        justify-content: flex-end;
    @media (min-width: 640px) {
        bottom: 4rem;
        right: 4rem;
    }

    .delete-float-btn {
        height: 3.5rem;
        padding-left: 1.5rem;
        padding-right: 0.5rem;
        border-radius: 9999px;
        background-color: transparent;
        border: 1px solid $color-gray-200;
        color: $color-black;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-4px) scale(1.02);
            background-color: $color-gray-100;
            border-color: transparent;
            .icon-wrap { background-color: $color-white; }
        }

        .label {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .icon-wrap {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background-color: $color-gray-100;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            i { width: 1.25rem; height: 1.25rem; }
        }
    }

    .edit-btn {
        height: 3.5rem;
        padding-left: 1.5rem;
        padding-right: 0.5rem;
        border-radius: 9999px;
        background-color: $color-primary;
        color: $color-white;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            .icon-wrap { background-color: rgba(255, 255, 255, 0.2); }
        }

        .label {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .icon-wrap {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;

            i { width: 1.25rem; height: 1.25rem; }
        }
    }
}

/* Modal styles */
.modal-overlay {
    position: fixed; inset: 0; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(20px); z-index: 100; display: flex; align-items: flex-end;
    @media (min-width: 768px) { align-items: center; justify-content: center; }
}
.modal-content {
    background: #ffffff; width: 100%; border-radius: 2rem 2rem 0 0; padding: 2.5rem; box-shadow: 0 -20px 60px rgba(0,0,0,0.05);
    @media (min-width: 768px) { border-radius: 2rem; box-shadow: 0 30px 60px rgba(0,0,0,0.1); }
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
    h3 { font-size: 1.5rem; font-weight: 900; color: $color-black; letter-spacing: -0.02em; }
    .btn-close { 
        width: 2.5rem; height: 2.5rem; border-radius: 50%; background: $color-gray-100; display: flex; align-items: center; justify-content: center; color: $color-black; cursor: pointer; transition: all 0.2s; 
        &:hover { background: $color-gray-200; transform: scale(1.05); } 
        i { width: 1.25rem; height: 1.25rem; }
    }
}
.form-fields { display: flex; flex-direction: column; gap: 1.5rem; }
.form-group {
    display: flex; flex-direction: column;
    .field-label { display: block; font-size: 10px; font-weight: 800; color: $color-gray-500; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; margin-left: 0.5rem; }
}
.form-input {
    width: 100%; background-color: $color-gray-100; color: $color-black; font-size: 16px; font-weight: 700; padding: 1.25rem 1.5rem; border-radius: 1.5rem; outline: none; border: 1px solid transparent; transition: all 0.3s ease;
    &::placeholder { color: $color-gray-500; font-weight: 500; }
    &:focus { background-color: #fff; border-color: $color-gray-200; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transform: translateY(-2px); }
}
.chip-group {
    display: flex; flex-wrap: wrap; gap: 0.75rem;
    .chip { 
        background-color: $color-gray-100; padding: 0.875rem 1.5rem; border-radius: 9999px; font-size: 13px; font-weight: 700; color: $color-gray-800; cursor: pointer; transition: all 0.2s ease; user-select: none; border: 1px solid transparent;
        &:hover { background-color: $color-gray-200; }
        &.active { background-color: $color-primary; color: $color-white; border-color: $color-primary; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    }
}
.modal-footer {
    margin-top: 2.5rem;
    .btn-submit { 
        width: 100%; background: $color-primary; color: $color-white; padding: 1.25rem; border-radius: 9999px; font-weight: 800; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.2s; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        &:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        &:active { transform: scale(0.98); } 
        &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; } 
    }
}
</style>

