<template>
    <div class="form-container">
        <div class="header">
            <button class="btn-icon" @click="actions.goBack">
                <i data-lucide="arrow-left"></i>
            </button>
            <h2 class="title">{{ state.scheduleForm.id ? '编辑日程' : '添加日程' }}</h2>
            <button class="btn-text" @click="saveSchedule" :disabled="state.saving">
                {{ state.saving ? '保存中...' : '保存' }}
            </button>
        </div>

        <div class="form-content hide-scrollbar">
            <!-- Basic Info -->
            <div class="form-section">
                <div class="input-group">
                    <input type="text" v-model="state.scheduleForm.title" placeholder="日程标题 (如：打拆进场)" class="large-input" />
                </div>
                
                <div class="input-group">
                    <label>开始日期</label>
                    <input type="date" v-model="state.scheduleForm.start_date" />
                </div>
                
                <div class="input-group">
                    <label>结束日期 (可选)</label>
                    <input type="date" v-model="state.scheduleForm.end_date" />
                </div>
            </div>

            <!-- Visual Settings -->
            <div class="form-section">
                <h3 class="section-title">标记颜色</h3>
                <div class="color-picker">
                    <div v-for="color in colors" :key="color" 
                         class="color-swatch" 
                         :style="{ backgroundColor: color }"
                         :class="{ active: state.scheduleForm.color === color }"
                         @click="state.scheduleForm.color = color">
                        <i v-if="state.scheduleForm.color === color" data-lucide="check" class="check-icon"></i>
                    </div>
                </div>
            </div>

            <!-- Notes -->
            <div class="form-section">
                <div class="input-group">
                    <label>备注说明</label>
                    <textarea v-model="state.scheduleForm.notes" rows="4" placeholder="添加一些详细说明..."></textarea>
                </div>
            </div>

            <div v-if="state.scheduleForm.id" class="danger-zone">
                <button class="btn-danger" @click="deleteSchedule" :disabled="state.saving">删除此日程</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useAppStore } from '../store.js';

const { state, actions } = useAppStore();

const colors = [
    '#ff6b52', '#34d399', '#3b82f6', '#af52de', '#ff9500', '#8e8e93'
];

onMounted(() => {
    if (!state.scheduleForm.color) {
        state.scheduleForm.color = colors[0];
    }
    nextTick(() => {
        if (window.lucide?.createIcons) window.lucide.createIcons();
    });
});

const saveSchedule = async () => {
    if (!state.scheduleForm.title || !state.scheduleForm.start_date) {
        alert('请填写标题和开始日期');
        return;
    }
    state.saving = true;
    const success = await actions.saveSchedule(state.scheduleForm);
    state.saving = false;
    if (success) {
        actions.goBack();
    } else {
        alert('保存失败');
    }
};

const deleteSchedule = async () => {
    if (!confirm('确定删除此日程吗？')) return;
    state.saving = true;
    const success = await actions.deleteSchedule(state.scheduleForm.id);
    state.saving = false;
    if (success) {
        actions.goBack();
    } else {
        alert('删除失败');
    }
};
</script>

<style scoped lang="scss">
.form-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-base);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--color-card-white);
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0;
    }

    .btn-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
    }

    .btn-text {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-brand-coral);
        background: none;
        border: none;
        padding: 0.5rem;

        &:disabled {
            opacity: 0.5;
        }
    }
}

.form-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-section {
    background: var(--color-card-white);
    border-radius: 24px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);

    .section-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text-main);
        margin: 0 0 1rem 0;
        letter-spacing: 0.05em;
    }
}

.input-group {
    margin-bottom: 1.5rem;

    &:last-child {
        margin-bottom: 0;
    }

    label {
        display: block;
        font-size: 0.8rem;
        color: var(--color-text-muted);
        margin-bottom: 0.5rem;
        font-weight: 600;
    }

    input, textarea {
        width: 100%;
        padding: 1rem;
        border-radius: 16px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        background: var(--color-bg-base);
        font-size: 1rem;
        color: var(--color-text-main);
        transition: all 0.2s;

        &:focus {
            outline: none;
            border-color: var(--color-brand-coral);
            background: white;
            box-shadow: 0 0 0 4px rgba(255, 107, 82, 0.1);
        }
    }

    .large-input {
        font-size: 1.5rem;
        font-weight: 800;
        padding: 1rem 0;
        border: none;
        background: transparent;
        border-radius: 0;
        border-bottom: 2px solid rgba(0, 0, 0, 0.05);

        &:focus {
            box-shadow: none;
            border-bottom-color: var(--color-brand-coral);
            background: transparent;
        }
        
        &::placeholder {
            color: rgba(0, 0, 0, 0.2);
        }
    }
}

.color-picker {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .color-swatch {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.1);
        }

        &.active {
            box-shadow: 0 0 0 3px white, 0 0 0 5px var(--color-text-main);
        }

        .check-icon {
            color: white;
            width: 20px;
            height: 20px;
        }
    }
}

.danger-zone {
    margin-top: 1rem;

    .btn-danger {
        width: 100%;
        padding: 1.2rem;
        border-radius: 20px;
        background: rgba(255, 59, 48, 0.1);
        color: #ff3b30;
        font-size: 1rem;
        font-weight: 700;
        border: none;
        cursor: pointer;

        &:hover {
            background: #ff3b30;
            color: white;
        }
    }
}
</style>
