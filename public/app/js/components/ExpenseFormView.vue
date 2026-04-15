<template>
    <div class="app-container page-content expense-form-container pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                NEW REC.
            </span>
        </div>

        <div class="form-content animate-slide-up">
            <form @submit.prevent="actions.saveExpense" class="expense-form">
                <!-- Amount Input -->
                <div class="amount-section">
                    <label class="section-label">输入金额</label>
                    <div class="amount-input-wrapper">
                        <span class="currency-symbol">¥</span>
                        <input 
                            type="number" 
                            step="0.01" 
                            v-model="state.formData.amount" 
                            required
                            class="amount-input"
                            placeholder="0.00"
                        >
                    </div>
                </div>

                <div class="form-fields">
                    <!-- Title -->
                    <div class="form-group">
                        <label class="field-label">账单标题</label>
                        <input 
                            type="text" 
                            v-model="state.formData.title" 
                            required
                            class="form-input"
                            placeholder="例如：购买客厅沙发"
                        >
                    </div>
                    
                    <div class="form-row">
                        <!-- Category -->
                        <div class="form-group">
                            <label class="field-label">所属分类</label>
                            <div class="select-wrapper">
                                <select v-model="state.formData.category_id" required class="form-select">
                                    <option value="" disabled selected>选择分类</option>
                                    <option v-for="cat in state.categories" :key="cat.id" :value="cat.id">
                                        {{ cat.level > 1 ? '└ ' + cat.name : cat.name }}
                                    </option>
                                </select>
                                <span class="select-arrow">▼</span>
                            </div>
                        </div>

                        <!-- Date -->
                        <div class="form-group">
                            <label class="field-label">发生日期</label>
                            <input 
                                type="date" 
                                v-model="state.formData.payment_date" 
                                required
                                class="form-input"
                            >
                        </div>
                    </div>

                    <!-- Decoration Area -->
                    <div class="form-group">
                        <label class="field-label">装修区域</label>
                        <div class="chip-group">
                            <div 
                                v-for="area in constants.decorationAreas" 
                                :key="area.value"
                                @click="state.formData.decoration_area = state.formData.decoration_area === area.value ? '' : area.value"
                                class="chip"
                                :class="{ 'active': state.formData.decoration_area === area.value }"
                            >
                                {{ area.label }}
                            </div>
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div class="form-group">
                        <label class="field-label">支付方式</label>
                        <div class="chip-group">
                            <div 
                                v-for="method in constants.paymentMethods" 
                                :key="method.value"
                                @click="state.formData.payment_method = method.value"
                                class="chip"
                                :class="{ 'active': state.formData.payment_method === method.value }"
                            >
                                {{ method.label }}
                            </div>
                        </div>
                    </div>

                    <!-- Payer Names -->
                    <div class="form-group">
                        <label class="field-label">支付人</label>
                        <input 
                            type="text" 
                            v-model="state.formData.payer_names" 
                            class="form-input"
                            placeholder="例如：张三, 李四"
                        >
                    </div>

                    <!-- Status -->
                    <div class="form-group">
                        <div class="status-toggle">
                            <div class="toggle-slider"
                                 :class="state.formData.status === 'paid' ? 'pos-left' : 'pos-right'"></div>
                            <label class="toggle-option">
                                <input type="radio" v-model="state.formData.status" value="paid" class="sr-only">
                                <span class="toggle-text" :class="state.formData.status === 'paid' ? 'text-active' : 'text-inactive'">已结清</span>
                            </label>
                            <label class="toggle-option">
                                <input type="radio" v-model="state.formData.status" value="planned" class="sr-only">
                                <span class="toggle-text" :class="state.formData.status === 'planned' ? 'text-active' : 'text-inactive'">计划开支</span>
                            </label>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div class="form-group">
                        <label class="field-label">补充说明</label>
                        <textarea 
                            v-model="state.formData.notes" 
                            rows="3"
                            class="form-textarea"
                            placeholder="填写商品链接、尺寸要求或其他细节..."
                        ></textarea>
                    </div>
                    
                    <div class="form-group full-width">
                        <label class="field-label">账单凭证 (最多5张)</label>
                        <div class="image-upload-container">
                            <div class="image-grid">
                                <div v-for="(img, index) in state.expenseImagesPreview" :key="index" class="image-preview-item">
                                    <img :src="img" class="preview-img" />
                                    <button @click.prevent="actions.removeExpenseImage(index)" class="btn-remove-image">
                                        <i data-lucide="x" class="icon-small"></i>
                                    </button>
                                </div>
                                <div v-if="state.expenseImagesPreview.length < 5" class="upload-action-btn">
                                    <label class="btn-add-image" :class="{ 'is-uploading': state.uploadingImages }">
                                        <input type="file" multiple accept="image/*" @change="actions.handleExpenseImageUpload" class="hidden-input" style="display: none;" :disabled="state.uploadingImages" />
                                        <i v-if="!state.uploadingImages" data-lucide="camera" class="upload-icon"></i>
                                        <i v-else data-lucide="loader" class="upload-icon spin"></i>
                                        <span class="upload-text">{{ state.uploadingImages ? '上传中...' : '添加图片' }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-submit">
                        <span v-if="state.saving" class="spinner"></span>
                        {{ state.saving ? '处理中...' : '确认保存' }}
                    </button>
                </div>
                <div class="spacer-bottom"></div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>

<style scoped lang="scss">
.expense-form-container {
    position: relative;
    display: flex;
    flex-direction: column;
    padding-top: 4rem;
    overflow-y: auto;
}

.massive-bg-wrapper {
    @include absolute-inset;
    @include flex-center;
    pointer-events: none;
    user-select: none;
    overflow: hidden;
    z-index: 0;
    position: fixed;

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

.form-content {
    padding: 1.5rem;
    position: relative;
    z-index: 10;
    margin: 0 auto;
    width: 100%;
}

.expense-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.amount-section {
    text-align: center;
    padding: 1rem 0 2rem;

    .section-label {
        display: block;
        font-size: 10px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 1rem;
    }

    .amount-input-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        color: $color-black;

        .currency-symbol {
            font-size: 1.875rem; line-height: 2.25rem;
            font-family: $font-sans;
            font-weight: 700;
            margin-right: 0.5rem;
        }

        .amount-input {
            width: 60%;
            text-align: center;
            font-size: 3rem; line-height: 1;
            font-family: $font-sans;
            font-weight: 900;
            background: transparent;
            outline: none;
            caret-color: $color-black;

            &::placeholder {
                color: rgba(0, 0, 0, 0.1);
            }

            @media (min-width: 768px) {
                font-size: 3.75rem; line-height: 1;
            }
        }
    }
}

.form-fields {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;

    .field-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.75rem;
        margin-left: 0.25rem;
    }
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

// Common Input Styles
.form-input, .form-select, .form-textarea {
    width: 100%;
    @include glassmorphism(rgba(255, 255, 255, 0.8), 12px);
    color: $color-black;
    font-size: 15px;
    font-weight: 700;
    padding: 1rem 1.25rem;
    border-radius: 2rem;
    outline: none;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:focus {
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
    }

    &::placeholder {
        color: rgba(0, 0, 0, 0.2);
    }
}

.form-textarea {
    resize: none;
}

.select-wrapper {
    position: relative;

    .form-select {
        padding-right: 2.5rem;
        appearance: none;
    }

    .select-arrow {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.3);
        pointer-events: none;
    }
}

.chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .chip {
        padding: 0.75rem 1.25rem;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 700;
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid transparent;

        @include glassmorphism(rgba(255, 255, 255, 0.8), 12px);
        color: rgba(0, 0, 0, 0.6);
        border-color: rgba(0, 0, 0, 0.05);

        &:hover {
            background-color: $color-pure-white;
        }

        &.active {
            background-color: $color-primary;
            color: $color-white;
            @include shadow-soft;
            border-color: transparent;
        }
    }
}

.status-toggle {
    @include glassmorphism(rgba(255, 255, 255, 0.8), 12px);
    border-radius: 9999px;
    padding: 0.25rem;
    display: flex;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.05);

    .toggle-slider {
            position: absolute;
            top: 0.25rem;
            bottom: 0.25rem;
            width: calc(50% - 0.25rem);
            background-color: $color-primary;
            border-radius: 9999px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &.pos-left {
            transform: translateX(0);
        }
        &.pos-right {
            transform: translateX(calc(100% + 0.5rem));
        }
    }

    .toggle-option {
        flex: 1;
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 0;
        cursor: pointer;

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }

        .toggle-text {
            font-size: 13px;
            font-weight: 700;
            transition: color 0.3s ease;

            &.text-active {
                color: $color-white;
                font-weight: 800;
            }
            &.text-inactive {
                color: rgba(0, 0, 0, 0.4);
            }
        }
    }
}

.upload-action-btn {
    width: 100%;
    grid-column: 1 / -1;
    margin-top: 0.5rem;
}

.btn-add-image {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
        background-color: rgba(0, 0, 0, 0.06);
    }

    &:active {
        transform: scale(0.96);
    }

    &.is-uploading {
        opacity: 0.6;
        pointer-events: none;
    }

    .upload-icon {
        width: 1.25rem;
        height: 1.25rem;
        color: rgba(0, 0, 0, 0.6);
        
        &.spin {
            animation: spin 1s linear infinite;
        }
    }

    .upload-text {
        font-size: 13px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.6);
    }
}

.form-actions {
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1.5rem 0;
    background: linear-gradient(to top, $color-white 50%, rgba(250, 250, 250, 0));
    z-index: 20;

    .btn-submit {
        width: 100%;
        background-color: $color-primary;
        color: $color-white;
        padding: 1rem 0;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 16px;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        @include flex-center;

        &:active {
            transform: scale(0.98);
        }

        .spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid $color-white;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
        }
    }
}

.spacer-bottom {
    height: 6rem;
}
</style>
