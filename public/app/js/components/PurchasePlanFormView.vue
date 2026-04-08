<template>
    <div class="app-container page-content expense-form-container pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                PLAN
            </span>
        </div>

        <div class="form-content animate-slide-up">
            <form @submit.prevent="actions.savePurchasePlan" class="expense-form">
                <div class="form-fields" style="padding-top: 2rem;">
                    <!-- Title -->
                    <div class="form-group">
                        <label class="field-label">商品名称</label>
                        <input 
                            type="text" 
                            v-model="state.purchasePlanForm.item_name" 
                            required
                            class="form-input"
                            placeholder="例如：林氏木业真皮沙发"
                        >
                    </div>
                    
                    <div class="form-row">
                        <!-- Category -->
                        <div class="form-group">
                            <label class="field-label">所属分类</label>
                            <div class="select-wrapper">
                                <select v-model="state.purchasePlanForm.category_id" required class="form-select">
                                    <option value="" disabled selected>选择分类</option>
                                    <option v-for="cat in constants.purchaseCategories" :key="cat" :value="cat">
                                        {{ cat }}
                                    </option>
                                </select>
                                <span class="select-arrow">▼</span>
                            </div>
                        </div>

                        <!-- Decoration Area -->
                        <div class="form-group">
                            <label class="field-label">使用区域</label>
                            <div class="select-wrapper">
                                <select v-model="state.purchasePlanForm.decoration_area" class="form-select">
                                    <option value="">未指定</option>
                                    <option v-for="area in constants.decorationAreas" :key="area.value" :value="area.value">
                                        {{ area.label }}
                                    </option>
                                </select>
                                <span class="select-arrow">▼</span>
                            </div>
                        </div>
                    </div>

                    <!-- Purchase Method -->
                    <div class="form-group">
                        <label class="field-label">购买方式</label>
                        <div class="chip-group">
                            <div 
                                v-for="method in ['线下', '淘宝', '京东', '其他']" 
                                :key="method"
                                @click="state.purchasePlanForm.purchase_method = method"
                                class="chip"
                                :class="{ 'active': state.purchasePlanForm.purchase_method === method }"
                            >
                                {{ method }}
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <!-- Estimated Budget -->
                        <div class="form-group">
                            <label class="field-label">预算金额</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                v-model="state.purchasePlanForm.estimated_budget" 
                                class="form-input"
                                placeholder="0.00"
                            >
                        </div>
                        
                        <!-- Status -->
                        <div class="form-group">
                            <label class="field-label">购买状态</label>
                            <div class="select-wrapper">
                                <select v-model="state.purchasePlanForm.status" class="form-select" style="font-weight: 900;" :style="{color: state.purchasePlanForm.status === '已购买' ? '#34c759' : (state.purchasePlanForm.status === '取消' ? '#ff3b30' : '#111')}">
                                    <option value="计划">计划</option>
                                    <option value="取消">取消</option>
                                    <option value="已购买" disabled>已购买 (请在详情页操作)</option>
                                </select>
                                <span class="select-arrow">▼</span>
                            </div>
                        </div>
                    </div>

                    <!-- Merchant Name -->
                    <div class="form-group">
                        <label class="field-label">商家名称</label>
                        <input 
                            type="text" 
                            v-model="state.purchasePlanForm.merchant_name" 
                            class="form-input"
                            placeholder="选填"
                        >
                    </div>
                    
                    <!-- Product Link -->
                    <div class="form-group">
                        <label class="field-label">商品链接</label>
                        <input 
                            type="url" 
                            v-model="state.purchasePlanForm.product_link" 
                            class="form-input"
                            placeholder="选填，http://..."
                        >
                    </div>

                    <!-- Notes -->
                    <div class="form-group">
                        <label class="field-label">备注</label>
                        <textarea 
                            v-model="state.purchasePlanForm.notes" 
                            rows="3"
                            class="form-textarea"
                            placeholder="填写其他细节..."
                        ></textarea>
                    </div>

                    <div class="form-group full-width">
                        <label class="field-label">相关图片 (最多5张)</label>
                        <div class="image-upload-container">
                            <div class="image-grid">
                                <div v-for="(img, index) in state.purchasePlanImagesPreview" :key="index" class="image-preview-item">
                                    <img :src="img" class="preview-img" />
                                    <button @click.prevent="actions.removePurchasePlanImage(index)" class="btn-remove-image">
                                        <i data-lucide="x" class="icon-small"></i>
                                    </button>
                                </div>
                                <div v-if="state.purchasePlanImagesPreview.length < 5" class="upload-btn-wrapper">
                                    <label class="upload-label" :class="{ 'is-uploading': state.uploadingImages }">
                                        <input type="file" multiple accept="image/*" @change="actions.handlePurchasePlanImageUpload" class="hidden-input" style="display: none;" :disabled="state.uploadingImages" />
                                        <i v-if="!state.uploadingImages" data-lucide="camera" class="upload-icon"></i>
                                        <i v-else data-lucide="loader" class="upload-icon spin"></i>
                                        <span class="upload-text">{{ state.uploadingImages ? '上传中...' : '添加图片' }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-actions" style="margin-top: 2rem;">
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
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

.expense-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
            background-color: $color-black;
            color: $color-white;
            @include shadow-soft;
            border-color: transparent;
        }
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
        background-color: $color-black;
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