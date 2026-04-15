<template>
    <div class="detail-container">
        <div class="simple-header">
            <button class="back-btn" @click="actions.goBack">
                <i data-lucide="arrow-left"></i>
                <span>详情</span>
            </button>
            <div class="header-actions">
                <button class="icon-btn" @click="editSchedule">
                    <i data-lucide="edit-2"></i>
                </button>
            </div>
        </div>

        <div class="detail-content hide-scrollbar" v-if="state.currentSchedule">
            <div class="color-banner" :style="{ backgroundColor: state.currentSchedule.color || '#ff6b52' }"></div>
            
            <div class="info-section">
                <div class="title-area">
                    <span class="type-badge">{{ getTypeLabel(state.currentSchedule.type) }}</span>
                    <h1 class="main-title">{{ state.currentSchedule.title }}</h1>
                </div>

                <div class="meta-card">
                    <div class="meta-item">
                        <div class="icon-box">
                            <i data-lucide="calendar-clock"></i>
                        </div>
                        <div class="meta-text">
                            <label>开始日期</label>
                            <span>{{ dayjs(state.currentSchedule.start_date).format('YYYY年MM月DD日 dddd') }}</span>
                        </div>
                    </div>
                    
                    <div class="meta-item" v-if="state.currentSchedule.end_date">
                        <div class="icon-box">
                            <i data-lucide="calendar-check-2"></i>
                        </div>
                        <div class="meta-text">
                            <label>结束日期</label>
                            <span>{{ dayjs(state.currentSchedule.end_date).format('YYYY年MM月DD日 dddd') }}</span>
                        </div>
                    </div>
                </div>

                <div class="notes-section" v-if="state.currentSchedule.notes">
                    <h3 class="section-title">备注</h3>
                    <p class="notes-text">{{ state.currentSchedule.notes }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import { useAppStore } from '../store.js';

const { state, actions } = useAppStore();
const dayjs = window.dayjs;

onMounted(() => {
    nextTick(() => {
        if (window.lucide?.createIcons) window.lucide.createIcons();
    });
});

const getTypeLabel = (type) => {
    const types = {
        'custom': '自定义',
        'expense': '关联账单',
        'purchase_plan': '关联清单'
    };
    return types[type] || '其他';
};

const editSchedule = () => {
    actions.navigate('schedule-form', { mode: 'edit', id: state.currentSchedule.id });
};
</script>

<style scoped lang="scss">
.detail-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $color-white;
}

.simple-header {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: $color-white;
    z-index: 100;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: $color-black;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0.5rem 0;

    i {
        width: 1.2rem;
        height: 1.2rem;
    }
}

.icon-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: rgba($color-black, 0.05);
    color: $color-black;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba($color-black, 0.1);
        transform: scale(1.05);
    }
}

.detail-content {
    flex: 1;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
}

.color-banner {
    height: 200px;
    width: 100%;
    flex-shrink: 0;
}

.info-section {
    position: relative;
    z-index: 10;
    margin-top: -40px;
    background: $color-white;
    border-radius: 2rem 2rem 0 0;
    padding: 2.5rem 1.5rem 4rem;
    flex: 1;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.08);
}

.title-area {
    margin-bottom: 2.5rem;

    .type-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 800;
        color: rgba($color-black, 0.5);
        background: rgba($color-black, 0.04);
        padding: 0.4rem 1rem;
        border-radius: 100px;
        margin-bottom: 1rem;
        letter-spacing: 0.05em;
    }

    .main-title {
        font-size: 2rem;
        font-weight: 900;
        color: $color-black;
        margin: 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
    }
}

.meta-card {
    background: rgba($color-black, 0.02);
    border-radius: 1.5rem;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 3rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1.2rem;
    background: transparent;
    transition: all 0.2s;

    .icon-box {
        width: 3rem;
        height: 3rem;
        border-radius: 1rem;
        background: $color-white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $color-black;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        
        i {
            width: 1.25rem;
            height: 1.25rem;
            opacity: 0.8;
        }
    }

    .meta-text {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        label {
            font-size: 0.7rem;
            color: rgba($color-black, 0.4);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        span {
            font-size: 1rem;
            color: $color-black;
            font-weight: 700;
        }
    }
}

.notes-section {
    .section-title {
        font-size: 1rem;
        font-weight: 800;
        color: $color-black;
        margin: 0 0 1rem 0;
        letter-spacing: 0.02em;
    }

    .notes-text {
        font-size: 0.95rem;
        color: rgba($color-black, 0.7);
        line-height: 1.8;
        margin: 0;
        padding: 1.5rem;
        background: rgba($color-black, 0.02);
        border-radius: 1.5rem;
    }
}
</style>
