<template>
    <div class="concept-form-container app-container page-content pb-safe">
        <div class="form-wrapper">
            <form @submit.prevent="actions.saveConcept" class="concept-form">
                <div class="form-content">
                    <div class="form-group">
                        <label class="form-label">标题</label>
                        <input type="text" v-model="state.conceptForm.title" required class="form-input" placeholder="例如：极简原木风客厅">
                    </div>

                    <div class="form-group">
                        <label class="form-label">来源</label>
                        <div class="options-group">
                            <div v-for="src in constants.sourceOptions" :key="src.value" @click="state.conceptForm.source_type = src.value" class="option-btn" :class="state.conceptForm.source_type === src.value ? 'is-active' : 'is-inactive'">
                                {{ src.label }}
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">装修区域</label>
                        <div class="options-group">
                            <div v-for="area in constants.decorationAreas" :key="area.value" @click="state.conceptForm.decoration_area = state.conceptForm.decoration_area === area.value ? '' : area.value" class="option-btn" :class="state.conceptForm.decoration_area === area.value ? 'is-active' : 'is-inactive'">
                                {{ area.label }}
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">图片 (最多5张)</label>
                        <div class="images-grid">
                            <div v-for="(img, idx) in state.conceptImagesPreview" :key="idx" class="image-preview">
                                <img :src="img" />
                                <button type="button" @click.prevent="actions.removeConceptImage(idx)" class="remove-img-btn">
                                    <i data-lucide="x"></i>
                                </button>
                            </div>
                            <label v-if="state.conceptImagesPreview.length < 5" class="add-img-btn">
                                <i data-lucide="camera"></i>
                                <span>添加图片</span>
                                <input type="file" multiple accept="image/*" @change="actions.handleConceptImageUpload" class="hidden-input" :disabled="state.uploadingImages">
                            </label>
                        </div>
                        <p v-if="state.uploadingImages" class="uploading-text"><i data-lucide="loader-2"></i> 上传中...</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">风格 (选填)</label>
                        <input type="text" v-model="state.conceptForm.style" class="form-input" placeholder="如：极简、奶油风、工业风">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">链接 (选填)</label>
                        <input type="url" v-model="state.conceptForm.reference_link" class="form-input" placeholder="https://...">
                    </div>

                    <div class="form-group">
                        <label class="form-label">描述 (选填)</label>
                        <textarea v-model="state.conceptForm.description" rows="4" class="form-textarea" placeholder="记录一些设计灵感和心得..."></textarea>
                    </div>
                </div>

                <div class="submit-section pb-safe">
                    <button type="submit" class="submit-btn">
                        <i v-if="state.saving" data-lucide="loader-2"></i>
                        {{ state.saving ? '处理中...' : '保存' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
</script>

<style scoped lang="scss">
.concept-form-container {
    background-color: $color-white;
    padding-bottom: 8rem;
    padding-top: 4rem;
    overflow-y: auto;
}

.form-wrapper {
    padding: 1.5rem;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-label {
    display: block;
    font-size: 11px;
    font-weight: bold;
    color: rgba($color-black, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
    margin-left: 0.25rem;
}

.form-input {
    width: 100%;
    background: rgba($color-black, 0.05);
    color: $color-black;
    font-size: 15px;
    font-weight: 500;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    outline: none;
    border: 2px solid transparent;
    transition: all 0.3s ease;

    &:focus {
        border-color: rgba($color-black, 0.1);
        background: rgba($color-black, 0.02);
    }

    &::placeholder {
        color: rgba($color-black, 0.3);
    }
}

.form-textarea {
    @extend .form-input;
    resize: none;
}

.options-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.option-btn {
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid transparent;

    &.is-active {
        background: $color-black;
        color: $color-white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    &.is-inactive {
        background: rgba($color-black, 0.05);
        color: rgba($color-black, 0.6);

        &:hover {
            background: rgba($color-black, 0.08);
        }
    }
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
}

.image-preview {
    aspect-ratio: 1 / 1;
    border-radius: 0.75rem;
    background: rgba($color-black, 0.05);
    position: relative;
    overflow: hidden;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.remove-img-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: none;
    transition: transform 0.2s ease;

    &:active {
        transform: scale(0.9);
    }

    i {
        width: 0.75rem;
        height: 0.75rem;
    }
}

.add-img-btn {
    aspect-ratio: 1 / 1;
    border-radius: 0.75rem;
    border: 2px dashed rgba($color-black, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba($color-black, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba($color-black, 0.02);
        border-color: rgba($color-black, 0.25);
    }

    &:active {
        transform: scale(0.95);
    }

    i {
        width: 1.5rem;
        height: 1.5rem;
        margin-bottom: 0.25rem;
        opacity: 0.5;
    }

    span {
        font-size: 10px;
        font-weight: 500;
        opacity: 0.6;
    }
}

.hidden-input {
    display: none;
}

.uploading-text {
    font-size: 0.75rem;
    color: $color-black;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

    i {
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.25rem;
        animation: spin 1s linear infinite;
    }
}

.submit-section {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1.5rem;
    background: linear-gradient(to top, $color-white 80%, transparent);
    z-index: 10;
}

.submit-btn {
    width: 100%;
    background: $color-black;
    color: $color-white;
    padding: 1rem 0;
    border-radius: 1.25rem;
    font-weight: 600;
    font-size: 16px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;

    &:active {
        transform: scale(0.98);
    }

    i {
        width: 1.25rem;
        height: 1.25rem;
        margin-right: 0.5rem;
        animation: spin 1s linear infinite;
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}
</style>
