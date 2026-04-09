<template>
    <div class="app-container page-content expenses-container">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                EXPENSES
            </span>
        </div>
        
        <!-- Premium Header Area -->
        <div class="expenses-header animate-fade-in-up">
            <p class="header-subtitle">累计投入</p>
            <div class="header-amount">
                <span class="amount-value">¥{{ helpers.formatAmount(state.totalExpenses) }}</span>
            </div>
        </div>
        
        <!-- Elegant List -->
        <div class="expenses-list-container hide-scrollbar animate-slide-up" style="animation-delay: 0.1s;">
            <div v-if="state.loading" class="loading-state">
                <div class="spinner"></div>
            </div>
            <div v-else-if="state.expenses.length === 0" class="empty-state">
                <div class="empty-text">EMPTY</div>
                <p class="empty-subtext">空空如也，开始记录第一笔开销吧</p>
            </div>
            <div v-else class="timeline-container">
                <!-- Continuous Timeline Line -->
                <div class="timeline-line"></div>
                
                <div class="timeline-groups">
                    <div v-for="group in groupedExpenses" :key="group.date" class="timeline-group">
                        <!-- Timeline Node & Date -->
                        <div class="timeline-node-wrapper">
                            <div class="timeline-dot"></div>
                            <h3 class="timeline-date">{{ group.date }}</h3>
                        </div>
                        
                        <!-- Cards in Group -->
                        <div class="timeline-cards">
                            <div v-for="(expense, index) in group.items" :key="expense.id" 
                                 @click="actions.navigate('expense-detail', { id: expense.id })" 
                                 class="expense-card group animate-fade-in-up"
                                 :style="{ animationDelay: `${index * 0.05}s` }">
                                <!-- <div class="card-icon" :class="helpers.getCategoryColorClass(expense.category_name)">
                                    <span class="icon-text">{{ expense.category_name ? expense.category_name.substring(0,2) : '未' }}</span>
                                </div> -->
                                <div class="card-content">
                                    <h4 class="card-title">{{ expense.title }}</h4>
                                    <div class="card-meta">
                                        <span>{{ expense.category_name || '未分类' }}</span>
                                        <span class="meta-dot"></span>
                                        <span>{{ helpers.getPaymentMethodText(expense.payment_method) || '未知' }}</span>
                                    </div>
                                </div>
                                <div class="card-right">
                                    <p class="card-amount">-{{ helpers.formatAmount(expense.amount) }}</p>
                                    <span v-if="expense.status === 'planned'" class="status-badge">计划</span>
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

const groupedExpenses = computed(() => {
    const groups = [];
    let lastDate = null;
    state.expenses.forEach(exp => {
        const dateStr = helpers.formatDate(exp.payment_date);
        if (dateStr !== lastDate) {
            groups.push({ date: dateStr, items: [exp] });
            lastDate = dateStr;
        } else {
            groups[groups.length - 1].items.push(exp);
        }
    });
    return groups;
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
            background-color: $color-primary;
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
            transform: scale(1.1) rotate(3deg);
            .icon-text {
                opacity: 1;
            }
        }

        .card-content {
            flex: 1;
            min-width: 0;
            z-index: 10;

            .card-title {
                font-weight: 700;
                font-size: 15px;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                margin-bottom: 0.375rem;
                transition: transform 0.3s ease;
            }

            .card-meta {
                display: flex;
                align-items: center;
                font-size: 10px;
                font-weight: 700;
                color: rgba(0, 0, 0, 0.4);
                text-transform: uppercase;
                letter-spacing: 0.05em;

                .meta-dot {
                    margin: 0 0.5rem;
                    width: 0.25rem;
                    height: 0.25rem;
                    border-radius: 50%;
                    background-color: rgba(0, 0, 0, 0.2);
                }
            }
        }

        &:hover .card-title {
            transform: translateX(4px);
        }

        .card-right {
            text-align: right;
            margin-left: 0.75rem;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            z-index: 10;

            .card-amount {
                font-weight: 900;
                font-size: 16px;
                letter-spacing: -0.025em;
            }

            .status-badge {
                margin-top: 0.25rem;
                font-size: 9px;
                font-weight: 700;
                padding: 0.125rem 0.5rem;
                border-radius: 9999px;
                background-color: rgba($color-brand-gold, 0.1);
                color: $color-brand-gold;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
        }
    }
}
</style>
