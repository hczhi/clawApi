<template>
    <div class="workspace-container">
        <div class="dashboard-layout">
            <!-- Left Column -->
            <div class="left-col">
                <div class="header-area" style="flex-shrink: 0;">
                    <h1 class="main-title">雍容南台<br>装修工作台</h1>
                    <div class="quick-actions">
                        <button class="pill-btn" @click="actions.navigate('expense-form', { mode: 'add' })">记一笔账</button>
                        <button class="pill-btn" @click="actions.navigate('memo-form', { mode: 'add' })">记录灵感</button>
                        <button class="pill-btn" @click="actions.navigate('purchase-plan-form', { mode: 'add' })">待购清单</button>
                    </div>
                </div>

                <!-- <div class="hero-visual">
                    <div class="glass-orb large"></div>
                    <div class="glass-orb small"></div>
                    <div class="hero-house"></div>
                </div> -->

              

                <!-- Memos Feed Section -->
                <dashboard-memos style="flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;"></dashboard-memos>

                <div class="bottom-left-section" style="flex-shrink: 0; display: flex; justify-content: space-between; align-items: flex-end; padding-right: 2rem;">
                    <div class="expense-section">
                        <div class="expense-header">
                            <span class="label">总支出 (元)</span>
                            <span class="badge-green">+ 预算控制中</span>
                        </div>
                        <h2 class="hero-number">¥ {{ helpers.formatAmount(state.totalExpenses) }}</h2>
                    </div>

                    <dashboard-schedule-widget></dashboard-schedule-widget>
                </div>
            </div>

            <!-- Right Column -->
            <div class="right-col">
                <!-- Purchase Plans Card -->
                <div class="card progress-card" style="display: flex; flex-direction: column;">
                    <div class="card-header" style="flex-shrink: 0; margin-bottom: 1rem;">
                        <span class="label">购买清单</span>
                        <!-- <span class="circle-btn"  @click="actions.navigate('purchase-plans')">全部</span> -->
                    </div>
                    
                    <!-- Area Filters -->
                    <div class="area-filters" style="flex-shrink: 0; display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <button v-for="area in availableAreas" :key="area" 
                            @click="currentAreaFilter = area"
                            class="filter-chip" 
                            :class="{ active: currentAreaFilter === area }">
                            {{ area }}
                        </button>
                    </div>

                    <div class="list-items" style="flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; justify-content: flex-start; gap: 1rem; padding-right: 0.5rem;">
                        <div v-if="filteredPurchasePlans.length === 0" class="empty-text">暂无待购清单</div>
                        <div v-for="plan in filteredPurchasePlans" :key="plan.id" class="list-row" @click.stop="actions.navigate('purchase-plan-detail', { id: plan.id })" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
                            <div class="row-info" style="display: flex; align-items: center; gap: 0.5rem;">
                                <span class="row-title" style="font-size: 1rem; font-weight: 500; color: var(--color-text-main);">{{ plan.item_name }}</span>
                                <span class="row-sub" style="font-size: 0.75rem; color: var(--color-text-muted); background: var(--color-bg-base); padding: 0.1rem 0.4rem; border-radius: 4px;">{{ plan.decoration_area || '未分类' }}</span>
                            </div>
                            <div class="row-amount" :style="{ color: plan.status === '已购买' ? 'var(--color-brand-green)' : 'var(--color-text-main)' }" style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: normal;">{{ plan.status }}</span>
                                <span style="font-size: 1rem; font-weight: 500;">¥{{ helpers.formatAmount(plan.actual_price || plan.estimated_budget || 0) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer" style="flex-shrink: 0; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1rem;">
                        <div class="footer-info">
                            <span class="footer-title">{{ currentAreaFilter === '全部区域' ? '全部' : currentAreaFilter }}总预算/支出</span>
                            <span class="footer-sub">包含 {{ pendingPlans.length }} 个计划中项目</span>
                        </div>
                        <div class="footer-stat">
                            <span class="stat-num" style="font-size: 1.8rem;">¥{{ helpers.formatAmount(currentAreaTotalAmount) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Inspiration Wall Card (Concepts) -->
                <div class="card list-card" @click="actions.navigate('concepts')" style="display: flex; flex-direction: column; padding: 0; background: transparent; box-shadow: none; border-radius: 0px;">
                    <div class="card-header" style="flex-shrink: 0; margin-bottom: 1.5rem; padding: 0;">
                        <span class="label" style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-main); letter-spacing: -0.02em;">灵感墙</span>
                        <span class="circle-btn" style="width: auto; padding: 0 1rem; border-radius: 100px; background: var(--color-card-white); border: 1px solid rgba(0,0,0,0.05); font-weight: 600;">浏览全部</span>
                    </div>
                    
                    <div class="concepts-grid hide-scrollbar" style="flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; overflow-y: auto; padding-bottom: 1rem;">
                        <div v-if="state.concepts.length === 0" class="empty-text" style="grid-column: span 2; padding: 3rem; text-align: center; background: var(--color-card-white); border-radius: 24px; color: var(--color-text-muted);">暂无灵感数据</div>
                        
                        <div v-for="(concept, index) in state.concepts.slice(0, 6)" :key="concept.id" 
                             class="concept-thumbnail group"
                             @click.stop="actions.navigate('concept-detail', { id: concept.id })"
                             style="position: relative; aspect-ratio: 1; border-radius: 24px; overflow: hidden; background: var(--color-card-white); cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                            
                            <!-- Image or Placeholder -->
                            <img v-if="helpers.getConceptCover(concept)" :src="helpers.getConceptCover(concept)" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" class="thumbnail-img" />
                            <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--color-card-sage) 0%, var(--color-bg-base) 100%);">
                                <span style="font-size: 2rem; opacity: 0.2;">C.</span>
                            </div>

                            <!-- Overlay Details -->
                            <div class="concept-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.2rem; opacity: 0; transition: opacity 0.3s ease;">
                                <span style="font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem;">{{ concept.style || '未分类风格' }}</span>
                                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ concept.title }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, helpers, actions } = useAppStore();
const dayjs = window.dayjs;

const currentAreaFilter = ref('全部区域');

const availableAreas = computed(() => {
    const areas = new Set();
    state.purchasePlans.forEach(plan => {
        areas.add(plan.decoration_area || '未分类');
    });
    return ['全部区域', ...Array.from(areas)];
});

const filteredPurchasePlans = computed(() => {
    if (currentAreaFilter.value === '全部区域') {
        return state.purchasePlans;
    }
    return state.purchasePlans.filter(plan => (plan.decoration_area || '未分类') === currentAreaFilter.value);
});

const pendingPlans = computed(() => {
    return filteredPurchasePlans.value.filter(p => p.status === '计划');
});

const currentAreaTotalAmount = computed(() => {
    return filteredPurchasePlans.value.reduce((sum, plan) => {
        return sum + parseFloat(plan.actual_price || plan.estimated_budget || 0);
    }, 0);
});

onMounted(() => {
    // Load initial data for dashboard if not loaded
    if (state.expenses.length === 0) {
        actions.fetchHomeData();
    }
    if (state.purchasePlans.length === 0) {
        actions.fetchPurchasePlans();
    }
    if (state.memos.length === 0) {
        actions.fetchMemos();
    }
    if (state.concepts.length === 0) {
        actions.fetchConcepts();
    }
});
</script>

<style scoped lang="scss">
.workspace-container {
    width: 100%;
    margin: 0 auto;
    padding: 2rem 3rem;
    flex: 1;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.dashboard-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    flex: 1;
    min-height: 0;
}

/* Typography & Globals */
h1, h2, h3 {
    margin: 0;
    font-weight: 300;
}

.label {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    font-weight: 500;
}

.badge-green {
    background: var(--color-brand-green-bg);
    color: var(--color-brand-green);
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
}

/* Left Column Styles */
.left-col {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-bottom: 1rem;
    min-height: 0;
    gap: 1.5rem;
}

.header-area {
    position: relative;
    z-index: 10;
}

.main-title {
    font-size: 3.5rem;
    line-height: 1.1;
    color: var(--color-text-main);
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: absolute;
    left: -2rem;
    top: 40%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 2rem 0.5rem;
    border-radius: 3rem;
    box-shadow: var(--shadow-soft);
    border: 1px solid rgba(0, 0, 0, 0.03);
    
    .pill-btn {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        font-size: 0.85rem;
        cursor: pointer;
        padding: 0.5rem;
        transition: all 0.3s;
        writing-mode: vertical-rl;
        text-orientation: upright;
        letter-spacing: 0.2em;
        opacity: 0.6;
        font-weight: 600;

        &:hover {
            color: var(--color-brand-coral);
            opacity: 1;
            transform: translateY(-2px);
        }
    }
}

/* Hero Visual (Placeholder for House) */
.hero-visual {
    position: absolute;
    top: 15%;
    right: -10%;
    width: 600px;
    height: 400px;
    pointer-events: none;
    z-index: 0;

    .glass-orb {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,107,82,0.1) 0%, rgba(255,107,82,0) 70%);
        filter: blur(40px);

        &.large {
            width: 400px;
            height: 400px;
            top: 0;
            left: 0;
        }
        &.small {
            width: 250px;
            height: 250px;
            bottom: 0;
            right: 0;
            background: radial-gradient(circle, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0) 70%);
        }
    }
    
    .hero-house {
        width: 100%;
        height: 100%;
        background-image: url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop');
        background-size: cover;
        background-position: center;
        border-radius: 24px;
        position: relative;
        z-index: 2;
        box-shadow: var(--shadow-soft);
    }
}

.expense-section {
    position: relative;
    z-index: 10;
    
    .expense-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
    }

    .hero-number {
        font-size: 3.5rem;
        color: var(--color-text-main);
        letter-spacing: -0.02em;
        margin-bottom: 0;
    }

    .mini-charts {
        display: flex;
        gap: 3rem;
    }

    .mini-chart-box {
        flex: 1;
        cursor: pointer;
        
        .mini-label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            margin-bottom: 1rem;
            display: block;
        }

        .mini-arc {
            height: 60px;
            width: 100%;
            position: relative;
            overflow: hidden;

            &::after {
                content: '';
                position: absolute;
                top: 10px;
                left: -10%;
                width: 120%;
                height: 200px;
                border-radius: 50%;
                border-top: 2px solid var(--color-brand-coral);
                background: linear-gradient(180deg, rgba(255,107,82,0.1) 0%, transparent 40%);
            }

            &.reverse::after {
                border-top: 2px solid #ccc;
                background: linear-gradient(180deg, rgba(0,0,0,0.03) 0%, transparent 40%);
            }
        }
    }
}

/* Right Column Styles */
.right-col {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow: hidden;
    flex: 1;
    min-height: 0;
}

.card {
    background: var(--color-card-white);
    border-radius: 32px;
    padding: 2rem;
    box-shadow: var(--shadow-soft);
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
    min-height: 0;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.02);
    }
}

.concept-thumbnail {
    &:hover .thumbnail-img {
        transform: scale(1.05);
    }
    &:hover .concept-overlay {
        opacity: 1 !important;
    }
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    .circle-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        color: var(--color-text-muted);
        transition: all 0.2s;

        &:hover {
            background: var(--color-brand-coral);
            color: #fff;
        }
    }
}

.filter-chip {
    padding: 0.4rem 1rem;
    border-radius: 100px;
    background: var(--color-bg-base);
    color: var(--color-text-muted);
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px solid transparent;
    transition: all 0.3s ease;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
    }

    &.active {
        background: var(--color-brand-coral);
        color: white;
        box-shadow: 0 4px 10px rgba(255, 107, 82, 0.3);
    }
}

/* Progress Card (Top Right) */
.progress-card {
    flex: 5;
    justify-content: space-between;

    .arc-chart-container {
        position: relative;
        text-align: center;
        margin: 2rem 0;

        .arc-value {
            font-size: 5rem;
            color: var(--color-text-main);
            position: absolute;
            top: 20%;
            left: 0;
            width: 100%;
            text-align: center;
            z-index: 2;
        }

        .arc-chart {
            height: 180px;
            width: 100%;
            position: relative;
            overflow: hidden;

            &::after {
                content: '';
                position: absolute;
                top: 40px;
                left: -10%;
                width: 120%;
                height: 500px;
                border-radius: 50%;
                border-top: 4px solid var(--color-brand-coral);
                background: linear-gradient(180deg, rgba(255,107,82,0.15) 0%, transparent 40%);
            }
        }
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(0,0,0,0.03);

        .footer-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .footer-title {
                font-size: 0.9rem;
                color: var(--color-text-main);
                font-weight: 500;
            }
            .footer-sub {
                font-size: 0.8rem;
                color: var(--color-text-muted);
            }
        }

        .footer-stat {
            text-align: right;
            
            .stat-num {
                font-size: 1.5rem;
                font-weight: 400;
                color: var(--color-text-main);
                margin-right: 0.25rem;
            }
            .stat-unit {
                font-size: 0.8rem;
                color: var(--color-brand-coral);
                font-weight: 600;
            }
        }
    }
}

/* List Card (Bottom Right) */
.list-card {
    flex: 4;

    .list-metrics {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 2rem;

        .sub-number {
            font-size: 3.5rem;
            color: var(--color-text-main);
        }
    }

    .line-chart-container {
        margin-bottom: 2rem;
        
        .line-chart {
            height: 80px;
            width: 100%;
            position: relative;
            border-bottom: 1px solid rgba(0,0,0,0.05);

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 40px;
                border-top: 2px solid var(--color-brand-coral);
                background: linear-gradient(180deg, rgba(255,107,82,0.1) 0%, transparent 100%);
                border-radius: 20px 20px 0 0;
            }

            .chart-dot {
                position: absolute;
                bottom: 34px;
                right: 30%;
                width: 14px;
                height: 14px;
                background: var(--color-brand-coral);
                border: 3px solid #fff;
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(255,107,82,0.4);
                z-index: 2;

                .dot-tooltip {
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--color-brand-coral);
                    color: #fff;
                    font-size: 0.7rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                }
            }
        }
    }

    .list-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .list-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            
            .row-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;

                .row-title {
                    font-size: 0.95rem;
                    color: var(--color-text-main);
                    font-weight: 500;
                }
                .row-sub {
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                }
            }

            .row-amount {
                font-size: 1rem;
                font-weight: 500;
                color: var(--color-text-main);
            }
        }
    }
}

.empty-text {
    color: var(--color-text-muted);
    font-size: 0.9rem;
    text-align: center;
    padding: 1rem 0;
}
</style>