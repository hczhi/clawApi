<template>
    <div class="desktop-detail-wrapper">
        <div v-if="state.currentExpense" class="detail-content animate-fade-in-up">
            <!-- Header Area -->
            <div class="header-section">
                <div class="header-left">
                    <span class="category-badge" :class="helpers.getCategoryBgClass(state.currentExpense.category_name)">
                        {{ state.currentExpense.category_name || '未分类' }}
                    </span>
                    <h2 class="title">{{ state.currentExpense.title }}</h2>
                </div>
                <div class="header-right">
                    <span class="amount">-{{ helpers.formatAmount(state.currentExpense.amount) }}</span>
                    <span class="status-tag" :class="{ 'paid': state.currentExpense.status === 'paid' }">
                        {{ state.currentExpense.status === 'paid' ? '已结清' : '计划开支' }}
                    </span>
                </div>
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">交易日期</span>
                    <span class="value">{{ helpers.formatDate(state.currentExpense.payment_date) }}</span>
                </div>
                <div class="info-item">
                    <span class="label">支付方式</span>
                    <span class="value">{{ helpers.getPaymentMethodText(state.currentExpense.payment_method) }}</span>
                </div>
                <div class="info-item" v-if="state.currentExpense.decoration_area">
                    <span class="label">装修区域</span>
                    <span class="value">{{ state.currentExpense.decoration_area }}</span>
                </div>
                <div class="info-item" v-if="state.currentExpense.payer_names">
                    <span class="label">支付人</span>
                    <span class="value">{{ state.currentExpense.payer_names }}</span>
                </div>
                <div class="info-item" v-if="state.currentExpense.vendor_name">
                    <span class="label">收款方</span>
                    <span class="value">{{ state.currentExpense.vendor_name }}</span>
                </div>
            </div>

            <!-- Notes Section -->
            <div class="notes-section" v-if="state.currentExpense.notes">
                <h3 class="section-title">补充说明</h3>
                <p class="notes-text">{{ state.currentExpense.notes }}</p>
            </div>

            <!-- Images Section -->
            <div class="images-section" v-if="state.currentExpense.image_urls && state.currentExpense.image_urls !== '[]'">
                <h3 class="section-title">相关凭证</h3>
                <div class="image-grid">
                    <div class="img-wrapper" v-for="(img, idx) in JSON.parse(state.currentExpense.image_urls)" :key="idx" @click="actions.previewImage(img)">
                        <img :src="img" alt="凭证" />
                    </div>
                </div>
            </div>

            <!-- Actions Bar -->
            <div class="actions-bar">
                <button class="btn-secondary danger" @click="actions.deleteExpense">删除记录</button>
                <button class="btn-primary" @click="actions.navigate('expense-form', { mode: 'edit', id: state.currentExpense.id })">编辑账单</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '/app/js/store.js';
const { state, helpers, actions } = useAppStore();
</script>

<style scoped lang="scss">
.desktop-detail-wrapper {
    padding: 3rem;
    height: 100%;
    overflow-y: auto;
    background: var(--color-card-white);
}

.detail-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

/* Typography & Layout */
.section-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
}

/* Header Section */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
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

    .header-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
    }

    .amount {
        font-size: 3rem;
        font-weight: 900;
        color: var(--color-text-main);
        letter-spacing: -0.02em;
        line-height: 1;
    }

    .status-tag {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.3rem 0.8rem;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.05);
        color: var(--color-text-muted);

        &.paid {
            background: var(--color-brand-green-bg);
            color: var(--color-brand-green);
        }
    }
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
    background: var(--color-bg-base);
    padding: 2rem;
    border-radius: 24px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
    }

    .value {
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--color-text-main);
    }
}

/* Notes Section */
.notes-section {
    .notes-text {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--color-text-main);
        background: var(--color-card-sage);
        padding: 1.5rem;
        border-radius: 16px;
        white-space: pre-wrap;
    }
}

/* Images Section */
.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;

    .img-wrapper {
        aspect-ratio: 1;
        border-radius: 16px;
        overflow: hidden;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-soft);
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
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