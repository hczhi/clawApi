<template>
    <div class="desktop-detail-wrapper">
        <div v-if="state.currentSchedule" class="detail-content animate-fade-in-up">
            
            <!-- Banner & Title -->
            <div class="header-section">
               
                <div class="title-area">
                    <span class="type-badge">{{ getTypeLabel(state.currentSchedule.type) }}</span>
                    <h1 class="main-title">{{ state.currentSchedule.title }}</h1>
                </div>
            </div>

            <!-- Meta Information -->
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

            <!-- Notes Section -->
            <div class="notes-section" v-if="state.currentSchedule.notes">
                <h3 class="section-title">备注内容</h3>
                <p class="notes-text">{{ state.currentSchedule.notes }}</p>
            </div>

            <!-- Bottom Actions Bar -->
            <div class="actions-bar">
                <button class="btn-secondary danger" @click="deleteSchedule">删除日程</button>
                <button class="btn-primary" @click="editSchedule">编辑日程</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue';
import { useAppStore } from '/app/js/store.js';

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

const deleteSchedule = async () => {
    if (confirm('确定要删除这条日程安排吗？')) {
        await actions.deleteSchedule(state.currentSchedule.id);
        actions.goBack();
    }
};
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

/* Header Section */
.header-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .color-banner {
        height: 160px;
        width: 100%;
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }

    .title-area {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        .type-badge {
            font-size: 0.75rem;
            font-weight: 800;
            color: rgba(0, 0, 0, 0.5);
            background: rgba(0, 0, 0, 0.04);
            padding: 0.4rem 1.2rem;
            border-radius: 100px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .main-title {
            font-size: 3rem;
            font-weight: 900;
            color: var(--color-text-main);
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }
    }
}

/* Meta Card */
.meta-card {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 24px;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 0.5rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 20px;
    background: transparent;
    transition: all 0.3s ease;

    &:hover {
        background: var(--color-card-white);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
        transform: translateY(-2px);
    }

    .icon-box {
        width: 4rem;
        height: 4rem;
        border-radius: 1.2rem;
        background: var(--color-card-white);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-main);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        flex-shrink: 0;
        
        i {
            width: 1.5rem;
            height: 1.5rem;
            opacity: 0.8;
        }
    }

    .meta-text {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
            font-size: 0.75rem;
            color: rgba(0, 0, 0, 0.4);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        span {
            font-size: 1.15rem;
            color: var(--color-text-main);
            font-weight: 700;
        }
    }
}

/* Notes Section */
.notes-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .section-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--color-text-main);
        margin: 0;
        letter-spacing: 0.02em;
    }

    .notes-text {
        font-size: 1.1rem;
        color: rgba(0, 0, 0, 0.7);
        line-height: 1.8;
        margin: 0;
        padding: 2rem;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 24px;
        white-space: pre-wrap;
    }
}

/* Actions Bar */
.actions-bar {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    margin-top: 1rem;

    button {
        padding: 1rem 2.5rem;
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
