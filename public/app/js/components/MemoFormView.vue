<template>
    <div class="memo-form-container app-container page-content pb-safe">
        <div class="form-content">
            <!-- Title Input -->
            <div class="input-group title-group">
                <input 
                    v-model="state.memoForm.title" 
                    type="text" 
                    class="huge-input" 
                    placeholder="Title..." 
                    autocomplete="off"
                />
            </div>

            <!-- Content Input -->
            <div class="input-group content-group">
                <textarea 
                    v-model="state.memoForm.content" 
                    class="content-textarea" 
                    placeholder="What's on your mind?"
                    rows="8"
                ></textarea>
            </div>

            <!-- Link Input -->
            <div class="input-group">
                <div class="field-label">
                    <i data-lucide="link"></i>
                    <span>REFERENCE LINK</span>
                </div>
                <input 
                    v-model="state.memoForm.link_url" 
                    type="url" 
                    class="standard-input" 
                    placeholder="https://..." 
                    autocomplete="off"
                />
            </div>

            <!-- Tags Input -->
            <div class="input-group">
                <div class="field-label">
                    <i data-lucide="hash"></i>
                    <span>TAGS (Press Enter to add)</span>
                </div>
                <div class="tags-input-wrapper">
                    <div class="tags-list" v-if="state.memoForm.tags && state.memoForm.tags.length">
                        <span v-for="(tag, idx) in state.memoForm.tags" :key="idx" class="tag-chip">
                            {{ tag }}
                            <button class="remove-tag" @click="removeTag(idx)"><i data-lucide="x"></i></button>
                        </span>
                    </div>
                    <input 
                        v-model="tagInput" 
                        @keydown.enter.prevent="addTag"
                        type="text" 
                        class="tag-input-field" 
                        placeholder="Add a tag..." 
                    />
                </div>
            </div>

            <!-- Images Upload -->
            <div class="input-group">
                <div class="field-label">
                    <i data-lucide="image"></i>
                    <span>GALLERY</span>
                </div>
                <div class="image-upload-grid">
                    <div v-for="(img, index) in state.memoImagesPreview" :key="index" class="image-preview-item">
                        <img :src="img" />
                        <button class="remove-img-btn" @click="removeImage(index)">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="upload-btn" :class="{ 'is-uploading': state.uploadingImages }">
                        <label class="upload-label">
                            <input type="file" multiple accept="image/*" @change="handleImageUpload" class="hidden-input" :disabled="state.uploadingImages" />
                            <i v-if="!state.uploadingImages" data-lucide="plus"></i>
                            <div v-else class="spinner-small"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();
const axios = window.axios;

const tagInput = ref('');
const imageInput = ref(null);

const addTag = () => {
    const tag = tagInput.value.trim();
    if (tag && !state.memoForm.tags.includes(tag)) {
        state.memoForm.tags.push(tag);
    }
    tagInput.value = '';
    helpers.updateIcons();
};

const removeTag = (index) => {
    state.memoForm.tags.splice(index, 1);
};

const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    state.uploadingImages = true;
    try {
        const formData = await actions.processImagesToFormData(files);
        
        const res = await axios.post('/api/expenses/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.data.success && res.data.data && res.data.data.urls) {
            state.memoImagesPreview.push(...res.data.data.urls);
            state.memoForm.image_urls = JSON.stringify(state.memoImagesPreview);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        alert('图片上传失败: ' + (error.response?.data?.error || error.message));
    } finally {
        state.uploadingImages = false;
        event.target.value = '';
        helpers.updateIcons();
    }
};

const removeImage = (index) => {
    state.memoImagesPreview.splice(index, 1);
    state.memoForm.image_urls = JSON.stringify(state.memoImagesPreview);
};

onMounted(() => {
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
.memo-form-container {
    padding-top: 1rem;
    background: $color-white;
    min-height: 100vh;
}

.header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    position: sticky;
    top: 0;
    background: rgba($color-white, 0.9);
    backdrop-filter: blur(10px);
    z-index: 50;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.header-title {
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.15em;
    color: $color-black;
    margin: 0;
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
    
    &.save-btn {
        background: $color-primary;
        color: $color-white;
        
        &:hover {
            background: darken($color-primary, 10%);
        }
        
        &:disabled {
            background: rgba($color-black, 0.2);
            transform: none;
            cursor: not-allowed;
        }
    }
}

.spinner-small {
    width: 1rem;
    height: 1rem;
    border: 2px solid $color-white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.form-content {
    padding: 2rem 1.5rem 5rem;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.title-group {
    margin-bottom: -1rem;
}

.huge-input {
    width: 100%;
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: $color-black;
    border: none;
    background: transparent;
    padding: 0;
    outline: none;
    
    &::placeholder {
        color: rgba($color-black, 0.2);
    }
}

.content-textarea {
    width: 100%;
    font-size: 1.125rem;
    line-height: 1.8;
    color: rgba($color-black, 0.8);
    border: none;
    background: transparent;
    padding: 0;
    outline: none;
    resize: vertical;
    min-height: 150px;
    font-family: inherit;
    
    &::placeholder {
        color: rgba($color-black, 0.2);
    }
}

.field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.65rem;
    font-weight: bold;
    color: rgba($color-black, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    
    i {
        width: 1rem;
        height: 1rem;
    }
}

.standard-input {
    width: 100%;
    font-size: 1rem;
    font-weight: 600;
    color: $color-black;
    background: rgba($color-black, 0.03);
    border: 1px solid transparent;
    padding: 1.25rem 1.5rem;
    border-radius: 1rem;
    outline: none;
    transition: all 0.3s ease;
    
    &:focus {
        background: $color-white;
        border-color: rgba($color-black, 0.1);
        box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }
    
    &::placeholder {
        color: rgba($color-black, 0.3);
        font-weight: 500;
    }
}

.tags-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: rgba($color-black, 0.03);
    padding: 1rem;
    border-radius: 1.5rem;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: bold;
    color: $color-black;
    background: $color-white;
    padding: 0.5rem 0.75rem;
    border-radius: 2rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.remove-tag {
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba($color-black, 0.4);
    cursor: pointer;
    
    &:hover {
        color: #ff3b30;
    }
    
    i {
        width: 0.75rem;
        height: 0.75rem;
    }
}

.tag-input-field {
    width: 100%;
    font-size: 0.875rem;
    color: $color-black;
    border: none;
    background: transparent;
    outline: none;
    padding: 0.5rem;
    
    &::placeholder {
        color: rgba($color-black, 0.3);
    }
}

.image-upload-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    
    @media (min-width: 640px) {
        grid-template-columns: repeat(4, 1fr);
    }
}

.image-preview-item {
    aspect-ratio: 1;
    border-radius: 1.5rem;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.remove-img-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: rgba($color-black, 0.6);
    backdrop-filter: blur(4px);
    color: $color-white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    i {
        width: 1rem;
        height: 1rem;
    }
    
    &:hover {
        background: #ff3b30;
    }
}

.upload-btn {
    aspect-ratio: 1;
    border-radius: 1.5rem;
    background: rgba($color-black, 0.03);
    border: 2px dashed rgba($color-black, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba($color-black, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba($color-black, 0.05);
        color: $color-black;
        border-color: rgba($color-black, 0.2);
    }
    
    i {
        width: 2rem;
        height: 2rem;
    }
    
    &.is-uploading {
        pointer-events: none;
    }
}

.hidden-input {
    display: none;
}
</style>