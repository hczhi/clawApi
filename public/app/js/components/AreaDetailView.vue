<template>
    <div class="app-container page-content area-detail-container pb-safe">
        
        <!-- Abstract Background -->
        <div class="abstract-bg">
            <div class="glow-shape shape-1"></div>
            <div class="glow-shape shape-2"></div>
        </div>

        <div class="scrollable-content hide-scrollbar" @scroll="helpers.handleScroll">
            
            <!-- Hero Header -->
            <div class="hero-header">
                <!-- Massive Background Text -->
                <div class="massive-bg-text">
                    {{ state.currentArea }}
                </div>
                
                <div class="header-main animate-slide-up">
                    <div class="title-group">
                        <p class="subtitle">
                            <span class="pulse-dot"></span>
                            Space Overview
                        </p>
                        <h2 class="main-title">{{ state.currentArea }}</h2>
                    </div>
                    
                    <button @click="currentTab === 'expenses' ? addExpense() : currentTab === 'purchase-plans' ? addPurchasePlan() : addConcept()" class="btn-fab group">
                        <i data-lucide="plus" class="icon"></i>
                    </button>
                </div>

                <!-- Floating Tabs -->
                <div class="floating-tabs animate-slide-up" style="animation-delay: 0.1s;">
                    <button @click="currentTab = 'expenses'" 
                            class="tab-btn"
                            :class="{'active': currentTab === 'expenses'}">
                        账单
                    </button>
                    <button @click="currentTab = 'purchase-plans'" 
                            class="tab-btn"
                            :class="{'active': currentTab === 'purchase-plans'}">
                        购买清单
                    </button>
                    <button @click="currentTab = 'concepts'" 
                            class="tab-btn"
                            :class="{'active': currentTab === 'concepts'}">
                        灵感
                    </button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="main-content-area">
                
                <!-- Loading State -->
                <div v-if="loading" class="loading-state">
                    <i data-lucide="loader" class="icon-spin"></i>
                    <span class="loading-text">Loading Data...</span>
                </div>

                <!-- Expenses Tab -->
                <transition name="fade" mode="out-in">
                    <div v-if="!loading && currentTab === 'expenses'" class="tab-content-wrapper">
                        
                        <!-- Total Amount Card -->
                        <div class="total-amount-card">
                            <div class="card-subtitle">Total Spent</div>
                            <div class="card-amount">
                                <span class="currency">¥</span>
                                {{ helpers.formatAmount(totalAmount) }}
                            </div>
                           
                        </div>

                        <!-- Empty State -->
                        <div v-if="expenses.length === 0" class="empty-state">
                            <div class="empty-icon-wrapper animate-bounce-slow">
                                <i data-lucide="receipt" class="icon"></i>
                            </div>
                            <h3 class="empty-title">暂无账单记录</h3>
                            <p class="empty-desc">该区域还没有任何花销，点击下方按钮记一笔吧</p>
                            <button @click="addExpense" class="btn-primary">
                                记一笔
                            </button>
                        </div>

                        <!-- Expense List -->
                        <div v-else class="expense-list">
                            <div v-for="(expense, index) in expenses" :key="expense.id" 
                                 @click="actions.navigate('expense-detail', { id: expense.id })"
                                 class="expense-item group animate-fade-in-up"
                                 :style="{ animationDelay: `${index * 0.05}s` }">
                                
                                <div class="item-left">
                                    
                                    <div class="item-info">
                                        <div class="item-title">{{ expense.title }}</div>
                                        <div class="item-date">{{ helpers.formatDate(expense.payment_date) }}</div>
                                    </div>
                                </div>
                                <div class="item-right">
                                    <div class="item-amount">-{{ helpers.formatAmount(expense.amount) }}</div>
                                    <div class="item-method">{{ helpers.getPaymentMethodText(expense.payment_method) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Purchase Plans Tab -->
                    <div v-else-if="!loading && currentTab === 'purchase-plans'" class="tab-content-wrapper">
                        
                        <!-- Empty State -->
                        <div v-if="purchasePlans.length === 0" class="empty-state animate-fade-in-up">
                            <div class="empty-icon-wrapper animate-bounce-slow">
                                <i data-lucide="shopping-bag" class="icon"></i>
                            </div>
                            <h3 class="empty-title">暂无购买清单</h3>
                            <p class="empty-desc">该区域还没有购买清单，点击下方按钮添加吧</p>
                            <button @click="addPurchasePlan" class="btn-primary">
                                添加清单
                            </button>
                        </div>

                        <!-- Purchase Plans List -->
                        <div v-else class="expense-list">
                            <div v-for="(plan, index) in purchasePlans" :key="plan.id" 
                                 @click="actions.navigate('purchase-plan-detail', { id: plan.id })"
                                 class="expense-item group animate-fade-in-up"
                                 :style="{ animationDelay: `${index * 0.05}s` }">
                                
                                <div class="item-left">
                                    <div class="item-info">
                                        <div class="item-title">{{ plan.item_name }}</div>
                                        <div class="item-date">{{ plan.category_id || '未分类' }}</div>
                                    </div>
                                </div>
                                <div class="item-right">
                                    <div class="item-amount" v-if="plan.actual_price" :style="{color: plan.status === '已购买' ? '#6CA674' : '#2A2522'}">¥{{ helpers.formatAmount(plan.actual_price) }}</div>
                                    <div class="item-amount" v-else style="color: rgba(0,0,0,0.4); font-size: 14px;">未报价</div>
                                    <div class="item-method" :style="{color: plan.status === '已购买' ? '#6CA674' : (plan.status === '取消' ? '#D96C6C' : '#2A2522')}">{{ plan.status }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Concepts Tab -->
                    <div v-else-if="!loading && currentTab === 'concepts'" class="tab-content-wrapper">
                        
                        <!-- Empty State -->
                        <div v-if="concepts.length === 0" class="empty-state animate-fade-in-up">
                            <div class="empty-icon-wrapper animate-bounce-slow">
                                <i data-lucide="image" class="icon"></i>
                            </div>
                            <h3 class="empty-title">暂无设计灵感</h3>
                            <p class="empty-desc">该区域还没有收集灵感，快去添加吧</p>
                            <button @click="addConcept" class="btn-primary">
                                添加灵感
                            </button>
                        </div>

                        <!-- Concepts Masonry-like Grid -->
                        <div v-else class="concept-grid">
                            <div v-for="(concept, index) in concepts" :key="concept.id"
                                 @click="actions.navigate('concept-detail', { id: concept.id })"
                                 class="concept-card group animate-fade-in-up"
                                 :style="{ animationDelay: `${index * 0.08}s` }">
                                
                                <div class="image-wrapper" :class="index % 2 === 0 ? 'ratio-tall' : 'ratio-square'">
                                    <img v-if="helpers.getConceptCover(concept)" :src="helpers.getConceptCover(concept)" class="cover-image" />
                                    <div v-else class="image-placeholder">
                                        <i data-lucide="image" class="icon"></i>
                                    </div>
                                    
                                    <!-- Floating Style Badge -->
                                    <div class="style-badge">
                                        {{ concept.style || 'MIXED' }}
                                    </div>
                                </div>
                                
                                <div class="card-info">
                                    <div class="card-title">{{ concept.title }}</div>
                                    <div class="card-desc">{{ concept.description || 'NO DESC' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useAppStore } from '../store.js';

const { state, helpers, actions } = useAppStore();

const currentTab = ref('expenses');
const loading = ref(true);
const expenses = ref([]);
const purchasePlans = ref([]);
const concepts = ref([]);

const totalAmount = computed(() => {
    return expenses.value.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
});

const fetchData = async () => {
    loading.value = true;
    try {
        const areaName = state.currentArea;
        
        const [expRes, planRes, conRes] = await Promise.all([
            axios.get('/api/expenses', { params: { decoration_area: areaName, limit: 100 } }),
            axios.get('/api/purchase-plans', { params: { decoration_area: areaName, limit: 100 } }),
            axios.get('/api/design-concepts', { params: { decoration_area: areaName, limit: 100 } })
        ]);
        
        if (expRes.data.success) {
            expenses.value = expRes.data.data;
        }
        if (planRes.data.success) {
            purchasePlans.value = planRes.data.data;
        }
        if (conRes.data.success) {
            concepts.value = conRes.data.data;
        }
    } catch (err) {
        console.error('Failed to fetch area details', err);
    } finally {
        loading.value = false;
        nextTick(() => {
            if (window.lucide) window.lucide.createIcons();
        });
    }
};

const addExpense = () => {
    actions.navigate('expense-form', { mode: 'add', area: state.currentArea });
};

const addPurchasePlan = () => {
    actions.navigate('purchase-plan-form', { mode: 'add', area: state.currentArea });
};

const addConcept = () => {
    actions.navigate('concept-form', { mode: 'add', area: state.currentArea });
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped lang="scss">
.area-detail-container {
    background-color: $color-white;
    position: relative;
    display: flex;
    flex-direction: column;
}

.abstract-bg {
    @include absolute-inset;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;

    .glow-shape {
        position: absolute;
        border-radius: 50%;
        filter: blur(48px);
        mix-blend-mode: multiply;

        &.shape-1 {
            top: -8rem;
            left: -8rem;
            width: 24rem;
            height: 24rem;
            background-color: rgba($color-brand-accent, 0.05);
        }

        &.shape-2 {
            top: 25%;
            right: -8rem;
            width: 30rem;
            height: 30rem;
            background-color: rgba($color-brand-gold, 0.05);
        }
    }
}

.scrollable-content {
    flex: 1;
    overflow-y: auto;
    z-index: 10;
    position: relative;
}

.hero-header {
    position: relative;
    padding: 6rem 1.5rem 3rem;
    @include glassmorphism(rgba(255, 255, 255, 0.6), 24px);
    border-bottom-left-radius: 3rem;
    border-bottom-right-radius: 3rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    z-index: 20;
    overflow: hidden;
    .massive-bg-text {
        position: absolute;
        right: -2rem;
        top: -2rem;
        font-size: 120px;
        font-weight: 900;
        letter-spacing: -0.05em;
        color: rgba(0, 0, 0, 0.05);
        user-select: none;
        pointer-events: none;
        line-height: 1;
        white-space: nowrap;
        z-index: 0;
    }

    .header-main {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        .title-group {
            .subtitle {
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.1em;
                color: rgba(0, 0, 0, 0.4);
                text-transform: uppercase;
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .pulse-dot {
                    width: 0.5rem;
                    height: 0.5rem;
                    border-radius: 50%;
                    background-color: $color-primary;
                    display: inline-block;
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            }

            .main-title {
                font-size: 3rem; line-height: 1;
                font-weight: 900;
                letter-spacing: -0.05em;

                @media (min-width: 640px) {
                    font-size: 3.75rem; line-height: 1;
                }
            }
        }

        .btn-fab {
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 9999px;
            background-color: $color-primary;
            color: $color-white;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            @include flex-center;
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.05) translateY(-4px);
            }
            &:active {
                transform: scale(0.95);
            }

            .icon {
                width: 1.5rem;
                height: 1.5rem;
                transition: transform 0.5s ease;
            }

            &:hover .icon {
                transform: rotate(90deg);
            }
        }
    }

    .floating-tabs {
        display: flex;
        gap: 0.5rem;
        padding: 0.375rem;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 9999px;
        margin-top: 2rem;
        width: max-content;

        .tab-btn {
            padding: 0.625rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.75rem; line-height: 1rem;
            font-weight: 700;
            transition: all 0.3s ease;
            color: rgba(0, 0, 0, 0.5);

            &:hover {
                color: $color-black;
            }

            &.active {
                background-color: $color-pure-white;
                color: $color-black;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            }
        }
    }
}

.main-content-area {
    padding: 2rem 1.5rem 6rem;
    min-height: 50vh;
}

.loading-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5rem 0;
    gap: 1rem;
    opacity: 0.5;

    .icon-spin {
        width: 2rem;
        height: 2rem;
        animation: spin 1s linear infinite;
        color: $color-black;
    }

    .loading-text {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: rgba(0, 0, 0, 0.4);
        text-transform: uppercase;
    }
}

.tab-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

// Common Empty State
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 1.5rem;

    .empty-icon-wrapper {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        background-color: $color-pure-white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        @include flex-center;
        margin-bottom: 1.5rem;

        &.animate-bounce-slow {
            animation: bounce 3s infinite;
        }

        .icon {
            width: 2rem;
            height: 2rem;
            color: rgba(0, 0, 0, 0.2);
        }
    }

    .empty-title {
        font-size: 1.25rem; line-height: 1.75rem;
        font-weight: 900;
        letter-spacing: -0.025em;
        margin-bottom: 0.5rem;
    }

    .empty-desc {
        font-size: 0.75rem; line-height: 1rem;
        color: rgba(0, 0, 0, 0.4);
        font-weight: 500;
        margin-bottom: 1.5rem;
    }

    .btn-primary {
        padding: 0.75rem 2rem;
        background-color: $color-primary;
        color: $color-white;
        border-radius: 9999px;
        font-size: 0.75rem; line-height: 1rem;
        font-weight: 700;
        transition: all 0.3s ease;

        &:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
    }
}

// Expenses Styles
.total-amount-card {
    position: relative;
    padding: 0;
    background-color: transparent;

    @media (min-width: 640px) {
        padding: 2rem;
    }

    .card-subtitle {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: rgba(0, 0, 0, 0.4);
        text-transform: uppercase;
        margin-bottom: 0.5rem;
    }

    .card-amount {
        font-size: 3rem; line-height: 1;
        font-weight: 900;
        letter-spacing: -0.05em;
        display: flex;
        align-items: baseline;
        gap: 0.5rem;

        @media (min-width: 640px) {
            font-size: 3.75rem; line-height: 1;
        }

        .currency {
            font-size: 1.5rem; line-height: 2rem;
            color: rgba(0, 0, 0, 0.3);
            font-weight: 500;

            @media (min-width: 640px) {
                font-size: 1.875rem; line-height: 2.25rem;
            }
        }
    }

    
}

.expense-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 0.5rem;

    @media (min-width: 640px) {
        gap: 0.75rem;
        padding: 0 1rem;
    }

    .expense-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: transparent;
        transition: all 0.5s ease;
        cursor: pointer;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        @media (min-width: 640px) {
        }

        &:hover {
            color: $color-black;
        }

        .item-left {
            display: flex;
            align-items: center;
            gap: 1rem;

            .icon-wrapper {
                width: 3rem;
                height: 3rem;
                border-radius: 50%;
                @include flex-center;
                flex-shrink: 0;
                transition: transform 0.5s ease;
                background-color: rgba(0, 0, 0, 0.05);
                color: $color-black;

                .icon {
                    width: 1.25rem;
                    height: 1.25rem;
                }
            }

            .item-info {
                .item-title {
                    font-weight: 700;
                    font-size: 1rem; line-height: 1.5rem;
                    letter-spacing: -0.025em;
                    margin-bottom: 0.125rem;
                    color: $color-black;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                    max-width: 140px;

                    @media (min-width: 640px) {
                        max-width: 200px;
                    }
                }

                .item-date {
                    font-size: 10px;
                    color: rgba(0, 0, 0, 0.4);
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
            }
        }

        &:hover .icon-wrapper {
            transform: scale(1.1) rotate(6deg);
        }

        .item-right {
            text-align: right;

            .item-amount {
                font-size: 1.125rem; line-height: 1.75rem;
                font-weight: 900;
                letter-spacing: -0.05em;
                color: $color-black;
            }

            .item-method {
                font-size: 10px;
                color: rgba(0, 0, 0, 0.4);
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                margin-top: 0.125rem;
            }
        }
    }
}

// Concepts Styles
.concept-grid {
    column-count: 2;
    column-gap: 0.75rem;
    padding: 0 0.5rem;

    @media (min-width: 640px) {
        column-gap: 1rem;
        padding: 0 1rem;
    }

    .concept-card {
        break-inside: avoid;
        margin-bottom: 0.75rem;
        background-color: transparent;
        border-radius: 2.5rem;
        padding: 0.5rem;
        border: 1px solid transparent;
        transition: all 0.5s ease;
        cursor: pointer;
        max-width: 200px;
        @media (min-width: 640px) {
            margin-bottom: 1rem;
            padding: 0.75rem;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
            border-color: rgba(255, 255, 255, 0.6);
        }

        .image-wrapper {
            border-radius: 2rem;
            overflow: hidden;
            position: relative;

            &.ratio-tall {
                aspect-ratio: 4 / 5;
            }
            &.ratio-square {
                aspect-ratio: 1 / 1;
            }

            .cover-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 1.5s ease-out;
            }

            .image-placeholder {
                @include absolute-inset;
                background-color: rgba(0, 0, 0, 0.05);
                @include flex-center;

                .icon {
                    width: 2rem;
                    height: 2rem;
                    color: rgba(0, 0, 0, 0.1);
                }
            }

            .style-badge {
                position: absolute;
                top: 1rem;
                left: 1rem;
                padding: 0.375rem 0.75rem;
                border-radius: 9999px;
                @include glassmorphism(rgba(255, 255, 255, 0.8), 12px);
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.1em;
                color: $color-black;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            }
        }

        &:hover .cover-image {
            transform: scale(1.05);
        }

        .card-info {
            padding: 1rem 1rem 0.5rem;

            .card-title {
                font-weight: 700;
                font-size: 1rem; line-height: 1.5rem;
                margin-bottom: 0.25rem;
                letter-spacing: -0.025em;
                color: $color-black;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }

            .card-desc {
                font-size: 10px;
                color: rgba(0, 0, 0, 0.4);
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
        }
    }
}
</style>
