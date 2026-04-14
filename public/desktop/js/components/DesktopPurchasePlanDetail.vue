<template>
    <div class="desktop-detail-wrapper">
        <div v-if="state.currentPurchasePlan" class="detail-content animate-fade-in-up">
            
            <!-- Header Section -->
            <div class="header-section">
                <div class="header-left">
                    <span class="category-badge">{{ state.currentPurchasePlan.category_id || '未分类' }}</span>
                    <h2 class="title">{{ state.currentPurchasePlan.item_name }}</h2>
                    <div class="meta-row">
                        <span class="meta-item">
                            <span class="meta-label">状态</span>
                            <span class="status-tag" :class="statusClass">{{ state.currentPurchasePlan.status }}</span>
                        </span>
                        <span class="meta-item" v-if="state.currentPurchasePlan.decoration_area">
                            <span class="meta-label">区域</span>
                            <span class="meta-value">{{ state.currentPurchasePlan.decoration_area }}</span>
                        </span>
                        <span class="meta-item" v-if="state.currentPurchasePlan.buy_date">
                            <span class="meta-label">购买日期</span>
                            <span class="meta-value">{{ state.currentPurchasePlan.buy_date }}</span>
                        </span>
                    </div>
                </div>

                <div class="header-right">
                    <div class="amount-box">
                        <span class="amount-label">{{ state.currentPurchasePlan.status === '已购买' ? '实付' : '方案金额' }}</span>
                        <span class="amount-value">¥{{ helpers.formatAmount(state.currentPurchasePlan.actual_price || state.currentPurchasePlan.estimated_budget || 0) }}</span>
                    </div>
                    <button class="btn-action primary" 
                            v-if="state.currentPurchasePlan.status !== '已购买'" 
                            @click="actions.openPurchaseModal">
                        标记为已购买
                    </button>
                </div>
            </div>

            <!-- Plans Section -->
            <div class="plans-section">
                <div class="section-header">
                    <h3 class="section-title">备选方案对比</h3>
                    <span class="section-subtitle">包含 {{ parsedPlans.length }} 个选项</span>
                </div>
                
                <div v-if="parsedPlans.length === 0" class="empty-plans">
                    暂无方案记录
                </div>
                
                <div class="plans-grid" v-else>
                    <div v-for="plan in parsedPlans" :key="plan.id" 
                         class="plan-card" 
                         :class="{ 'active-plan': state.currentPurchasePlan.selected_plan_id === plan.id }">
                        
                        <!-- Plan Header -->
                        <div class="plan-header">
                            <div class="plan-title-area">
                                <span class="active-badge" v-if="state.currentPurchasePlan.selected_plan_id === plan.id">当前选用</span>
                                <h4 class="plan-name">{{ plan.name || '未命名方案' }}</h4>
                            </div>
                            <span class="plan-price" v-if="plan.price">¥{{ helpers.formatAmount(plan.price) }}</span>
                            <span class="plan-price empty" v-else>未报价</span>
                        </div>

                        <!-- Plan Details -->
                        <div class="plan-details">
                            <div class="detail-item">
                                <span class="label">购买方式</span>
                                <span class="value">{{ plan.purchase_method || '—' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">商家名称</span>
                                <span class="value">{{ plan.merchant_name || '—' }}</span>
                            </div>
                            <div class="detail-item full">
                                <span class="label">商品链接</span>
                                <a v-if="plan.product_link" :href="plan.product_link" target="_blank" class="value link">点击访问外链</a>
                                <span v-else class="value empty">—</span>
                            </div>
                            <div class="detail-item full">
                                <span class="label">备注说明</span>
                                <p class="value notes" v-if="plan.notes">{{ plan.notes }}</p>
                                <span v-else class="value empty">—</span>
                            </div>
                        </div>

                        <!-- Plan Images -->
                        <div class="plan-images" v-if="plan.image_urls && plan.image_urls !== '[]'">
                            <span class="label">参考图片</span>
                            <div class="img-row">
                                <div class="img-wrapper" v-for="(img, idx) in JSON.parse(plan.image_urls)" :key="idx" @click="actions.previewImage(img)">
                                    <img :src="img" alt="方案图片" />
                                </div>
                            </div>
                        </div>

                        <!-- Select Action -->
                        <div class="plan-actions" v-if="state.currentPurchasePlan.selected_plan_id !== plan.id && state.currentPurchasePlan.status !== '已购买' && state.currentPurchasePlan.status !== '取消'">
                            <button class="btn-select" @click="actions.selectPurchasePlanOption(plan.id)" :disabled="state.saving">
                                {{ state.saving ? '设置中...' : '设为选用方案' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Actions Bar -->
            <div class="actions-bar">
                <button class="btn-secondary danger" @click="actions.deletePurchasePlan">删除清单</button>
                <button class="btn-primary" @click="actions.navigate('purchase-plan-form', { mode: 'edit', id: state.currentPurchasePlan.id })">编辑清单</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, helpers, actions } = useAppStore();

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
</script>

<style scoped lang="scss">
.desktop-detail-wrapper {
    padding: 3rem;
    height: 100%;
    overflow-y: auto;
    background: var(--color-card-white);
}

.detail-content {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

/* Typography & Layout */
.section-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--color-text-main);
    letter-spacing: 0.05em;
    margin: 0;
}

/* Header Section */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .header-left {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .category-badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.3rem 0.8rem;
        border-radius: 12px;
        background: var(--color-bg-base);
        color: var(--color-text-main);
    }

    .title {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--color-text-main);
        letter-spacing: -0.02em;
        margin: 0;
        line-height: 1.2;
    }

    .meta-row {
        display: flex;
        gap: 2rem;
        margin-top: 0.5rem;

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .meta-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
        }

        .meta-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--color-text-main);
        }
    }

    .status-tag {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.3rem 0.8rem;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.05);
        color: var(--color-text-muted);

        &.status-purchased {
            background: var(--color-brand-green-bg);
            color: var(--color-brand-green);
        }
        &.status-cancelled {
            background: rgba(255, 59, 48, 0.1);
            color: #ff3b30;
        }
    }

    .header-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 1.5rem;
    }

    .amount-box {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.2rem;
        background: var(--color-bg-base);
        padding: 1.5rem 2rem;
        border-radius: 24px;
    }

    .amount-label {
        font-size: 0.8rem;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .amount-value {
        font-size: 2.5rem;
        font-weight: 900;
        color: var(--color-text-main);
        letter-spacing: -0.02em;
        line-height: 1;
    }

    .btn-action {
        padding: 0.8rem 1.5rem;
        border-radius: 100px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;

        &.primary {
            background: var(--color-brand-coral);
            color: white;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(255, 107, 82, 0.2);
            }
        }
    }
}

/* Plans Section */
.plans-section {
    .section-header {
        display: flex;
        align-items: baseline;
        gap: 1rem;
        margin-bottom: 2rem;

        .section-subtitle {
            font-size: 0.85rem;
            color: var(--color-text-muted);
        }
    }

    .empty-plans {
        padding: 4rem;
        text-align: center;
        background: var(--color-bg-base);
        border-radius: 24px;
        color: var(--color-text-muted);
        font-size: 1rem;
        font-weight: 500;
    }

    .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 2rem;
    }
}

/* Plan Card */
.plan-card {
    background: var(--color-card-white);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0,0,0,0.02);

    &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-soft);
    }

    &.active-plan {
        border-color: var(--color-brand-coral);
        background: rgba(255, 107, 82, 0.02);
    }

    .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
        padding-bottom: 1.5rem;

        .plan-title-area {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
        }

        .active-badge {
            font-size: 0.7rem;
            font-weight: 700;
            background: var(--color-brand-coral);
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 8px;
            letter-spacing: 0.05em;
        }

        .plan-name {
            font-size: 1.25rem;
            font-weight: 800;
            margin: 0;
            color: var(--color-text-main);
        }

        .plan-price {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--color-text-main);

            &.empty {
                font-size: 1rem;
                color: var(--color-text-muted);
                font-weight: 500;
            }
        }
    }

    .plan-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;

            &.full {
                grid-column: span 2;
            }

            .label {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--color-text-muted);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .value {
                font-size: 0.95rem;
                font-weight: 500;
                color: var(--color-text-main);

                &.empty {
                    color: rgba(0, 0, 0, 0.2);
                }

                &.link {
                    color: #007aff;
                    text-decoration: none;
                    &:hover { text-decoration: underline; }
                }

                &.notes {
                    line-height: 1.5;
                    white-space: pre-wrap;
                    background: var(--color-bg-base);
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                }
            }
        }
    }

    .plan-images {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;

        .label {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .img-row {
            display: flex;
            gap: 0.8rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;

            .img-wrapper {
                flex-shrink: 0;
                width: 60px;
                height: 60px;
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                border: 1px solid rgba(0,0,0,0.05);

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
        }
    }

    .plan-actions {
        margin-top: auto;
        padding-top: 1.5rem;

        .btn-select {
            width: 100%;
            padding: 1rem;
            border-radius: 16px;
            background: var(--color-bg-base);
            color: var(--color-text-main);
            font-size: 0.95rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover:not(:disabled) {
                background: var(--color-text-main);
                color: white;
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
}

/* Actions Bar */
.actions-bar {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    margin-top: 2rem;

    button {
        padding: 1rem 2rem;
        border-radius: 100px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;

        &.btn-secondary {
            background: var(--color-bg-base);
            color: var(--color-text-main);

            &.danger {
                color: #ff3b30;
                background: rgba(255, 59, 48, 0.1);

                &:hover {
                    background: #ff3b30;
                    color: white;
                }
            }

            &:hover:not(.danger) {
                background: rgba(0, 0, 0, 0.05);
            }
        }

        &.btn-primary {
            background: var(--color-text-main);
            color: white;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            }
        }
    }
}
</style>