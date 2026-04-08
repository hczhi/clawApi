<template>
    <div class="app-container page-content expenses-container">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                PURCHASES
            </span>
        </div>
        
        <!-- Premium Header Area -->
        <div class="expenses-header animate-fade-in-up" style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <p class="header-subtitle">购买清单</p>
                <div class="header-amount">
                    <span class="amount-value">{{ state.purchasePlans.length }} <span style="font-size: 1rem; font-weight: normal;">项</span></span>
                </div>
            </div>
            <div style="text-align: right; padding-bottom: 0.25rem;">
                <p class="header-subtitle" style="margin-bottom: 0.25rem;">总预算/支出</p>
                <div class="header-amount" style="justify-content: flex-end;">
                    <span class="amount-value" style="font-size: 1.5rem;">¥{{ helpers.formatAmount(totalPurchaseAmount) }}</span>
                </div>
            </div>
        </div>
        
        <!-- Elegant List -->
        <div class="expenses-list-container hide-scrollbar animate-slide-up" style="animation-delay: 0.1s;">
            <div v-if="state.loading" class="loading-state">
                <div class="spinner"></div>
            </div>
            <div v-else-if="state.purchasePlans.length === 0" class="empty-state">
                <div class="empty-text">EMPTY</div>
                <p class="empty-subtext">空空如也，开始添加购买计划吧</p>
            </div>
            <div v-else class="timeline-container">
                <!-- Continuous Timeline Line -->
                <div class="timeline-line"></div>
                
                <div class="timeline-groups">
                    <div v-for="group in groupedPlans" :key="group.area" class="timeline-group">
                        <!-- Timeline Node & Area -->
                        <div class="timeline-node-wrapper">
                            <div class="timeline-dot"></div>
                            <h3 class="timeline-date">{{ group.area }}</h3>
                        </div>
                        
                        <!-- Cards in Group -->
                        <div class="timeline-cards">
                            <div v-for="(plan, index) in group.items" :key="plan.id" 
                                 @click="actions.navigate('purchase-plan-detail', { id: plan.id })" 
                                 class="expense-card group animate-fade-in-up"
                                 :style="{ animationDelay: `${index * 0.05}s` }">
                                <!-- <div class="card-icon" :class="helpers.getCategoryColorClass(plan.category_id)">
                                    <span class="icon-text">{{ plan.category_id ? String(plan.category_id).substring(0,2) : '未' }}</span>
                                </div> -->
                                <div class="card-content">
                                    <h4 class="card-title">{{ plan.item_name }}</h4>
                                    <div class="card-meta">
                                        <span>{{ plan.category_id || '未分类' }}</span>
                                        <span class="meta-dot"></span>
                                        <span>{{ plan.purchase_method || '未知' }}</span>
                                    </div>
                                </div>
                                <div class="card-right">
                                    <p class="card-amount" v-if="plan.status === '已购买'">¥{{ helpers.formatAmount(plan.actual_price) }}</p>
                                    <p class="card-amount" v-else style="color: #888; font-size: 14px;">预算: ¥{{ helpers.formatAmount(plan.estimated_budget) }}</p>
                                    <span class="status-badge" :class="plan.status === '已购买' ? 'status-purchased' : (plan.status === '取消' ? 'status-cancelled' : 'status-planned')">{{ plan.status }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '../store.js';

const { state, constants, computedProps, helpers, actions } = useAppStore();

const groupedPlans = computed(() => {
    const groups = {};
    state.purchasePlans.forEach(plan => {
        const area = plan.decoration_area || '未分配区域';
        if (!groups[area]) {
            groups[area] = { area: area, items: [] };
        }
        groups[area].items.push(plan);
    });
    return Object.values(groups);
});

const totalPurchaseAmount = computed(() => {
    return state.purchasePlans.reduce((sum, plan) => {
        if (plan.status === '已购买') {
            return sum + parseFloat(plan.actual_price || 0);
        } else if (plan.status === '计划') {
            return sum + parseFloat(plan.estimated_budget || 0);
        }
        return sum;
    }, 0);
});
</script>

<style scoped lang="scss">
.expenses-container {
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

    .massive-text {
        font-size: 20vh;
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

.expenses-header {
    padding: 2rem 1.5rem;
    position: relative;
    z-index: 10;

    .header-subtitle {
        font-size: 10px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.5rem;
        margin-left: 0.25rem;
    }

    .header-amount {
        display: flex;
        align-items: baseline;
        gap: 0.25rem;

        .amount-value {
            font-size: 2.25rem; line-height: 2.5rem;
            font-weight: 900;
            letter-spacing: -0.05em;

            @media (min-width: 768px) {
                font-size: 3rem; line-height: 1;
            }
        }
    }
}

.expenses-list-container {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 8rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    scroll-behavior: smooth;
    position: relative;
    z-index: 10;
}

.loading-state {
    @include flex-center;
    padding: 5rem 0;

    .spinner {
        width: 2rem;
        height: 2rem;
        border: 2px solid $color-black;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8rem 0;
    opacity: 0.4;

    .empty-text {
        font-size: 40px;
        font-weight: 900;
        letter-spacing: -0.05em;
        color: rgba(0, 0, 0, 0.2);
        margin-bottom: 1rem;
    }

    .empty-subtext {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
}

.timeline-container {
    position: relative;
    margin-left: 0.5rem;
    margin-top: 1rem;

    .timeline-line {
        position: absolute;
        left: 3px;
        top: 0.5rem;
        bottom: 1rem;
        width: 2px;
        background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.05), transparent);
        border-radius: 9999px;
    }

    .timeline-groups {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .timeline-group {
        position: relative;
    }

    .timeline-node-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        position: relative;
        z-index: 10;

        .timeline-dot {
            position: absolute;
            left: 0;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            background-color: $color-black;
            box-shadow: 0 0 0 6px $color-white;
        }

        .timeline-date {
            padding-left: 2rem;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(0, 0, 0, 0.4);
        }
    }

    .timeline-cards {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-left: 2rem;
    }

    .expense-card {
        @include glassmorphism(rgba(255, 255, 255, 0.8), 12px);
        border-radius: 2rem;
        padding: 1rem;
        display: flex;
        align-items: center;
        @include shadow-soft;
        border: 1px solid rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
            background-color: $color-pure-white;
        }
        &:active {
            transform: scale(0.95);
        }

        .card-icon {
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 1rem;
            @include flex-center;
            margin-right: 1rem;
            transition: transform 0.5s ease;

            .icon-text {
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
        }

        &:hover .card-icon {
            transform: scale(1.05) rotate(-5deg);
            .icon-text { opacity: 1; }
        }

        .card-content {
            flex: 1;
            min-width: 0;
        }

        .card-title {
            font-size: 1.125rem; line-height: 1.75rem;
            font-weight: 700;
            color: $color-black;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-meta {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 10px;
            font-weight: 700;
            color: rgba(0, 0, 0, 0.4);
            text-transform: uppercase;
            letter-spacing: 0.05em;

            .meta-dot {
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background-color: currentColor;
                opacity: 0.5;
            }
        }

        .card-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
        }

        .card-amount {
            font-size: 1.25rem; line-height: 1.75rem;
            font-weight: 900;
            color: $color-black;
            letter-spacing: -0.025em;
        }

        .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            
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
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>