<template>
    <div class="memo-detail-container app-container page-content pb-safe">
        <div v-if="state.loading" class="loading-state">
            <div class="spinner"></div>
        </div>
        <div v-else-if="state.currentMemo" class="detail-content">

            <!-- Content Area -->
            <div class="article-body">
                <div class="memo-date-info">
                    {{ dayjs(state.currentMemo.created_at).format('YYYY年MM月DD日 HH:mm') }}
                </div>
                
                <h1 v-if="state.currentMemo.title" class="simple-title">{{ state.currentMemo.title }}</h1>
                
                <!-- Tags -->
                <div v-if="state.currentMemo.tags && state.currentMemo.tags.length" class="article-tags">
                    <span v-for="tag in state.currentMemo.tags" :key="tag" class="tag">#{{ tag }}</span>
                </div>

                <!-- Text Content -->
                <div v-if="state.currentMemo.content" class="article-text">
                    {{ state.currentMemo.content }}
                </div>

                <!-- Link Section -->
                <a v-if="state.currentMemo.link_url" :href="state.currentMemo.link_url" target="_blank" class="reference-link">
                    <div class="link-icon-box">
                        <i data-lucide="external-link"></i>
                    </div>
                    <div class="link-info">
                        <span class="link-label">参考链接</span>
                        <span class="link-url">{{ state.currentMemo.link_url }}</span>
                    </div>
                </a>

                <!-- Images Grid -->
                <div v-if="state.currentMemo.image_urls && state.currentMemo.image_urls.length > 0" class="gallery-grid">
                    <div class="grid-images">
                        <div v-for="(img, idx) in state.currentMemo.image_urls" :key="idx" 
                             class="grid-item" @click="actions.previewImage(img)">
                            <img :src="img" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();

const dayjs = window.dayjs;

onMounted(() => {
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
.memo-detail-container {
    padding: 0;
    min-height: 100vh;
    background: $color-white;
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid $color-black;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.simple-header {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: transparent;
    z-index: 100;
}

.header-title-text {
    font-size: 1rem;
    font-weight: bold;
    color: $color-black;
    letter-spacing: 0.05em;
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

.actions {
    display: flex;
    gap: 0.75rem;
}

.danger:hover {
    background: #ff3b30 !important;
    color: white !important;
}

.article-body {
    padding: 4rem 1.5rem 5rem;
    background: $color-white;
    position: relative;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.memo-date-info {
    font-size: 0.75rem;
    font-weight: bold;
    color: rgba($color-black, 0.4);
    letter-spacing: 0.05em;
}

.simple-title {
    font-size: 1.75rem;
    font-weight: 900;
    color: $color-black;
    line-height: 1.3;
    margin: 0;
}

.article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    
    .tag {
        font-size: 0.75rem;
        font-weight: bold;
        color: $color-primary;
        background: rgba($color-primary, 0.1);
        padding: 0.4rem 0.75rem;
        border-radius: 1rem;
        letter-spacing: 0.05em;
    }
}

.article-text {
    font-size: 1rem;
    line-height: 1.8;
    color: rgba($color-black, 0.8);
    white-space: pre-wrap;
}

.reference-link {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    background: rgba($color-black, 0.03);
    padding: 1.5rem;
    border-radius: 1.5rem;
    text-decoration: none;
    margin-bottom: 3rem;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba($color-black, 0.05);
        transform: translateY(-2px);
    }
    
    .link-icon-box {
        width: 3rem;
        height: 3rem;
        background: $color-white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $color-black;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        flex-shrink: 0;
    }
    
    .link-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .link-label {
        font-size: 0.65rem;
        font-weight: bold;
        color: rgba($color-black, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.25rem;
    }
    
    .link-url {
        font-size: 0.875rem;
        font-weight: 600;
        color: $color-black;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.gallery-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: rgba($color-black, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 1.5rem;
}

.grid-images {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    
    @media (min-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
    }
}

.grid-item {
    aspect-ratio: 1;
    border-radius: 1.5rem;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    
    &:hover img {
        transform: scale(1.05);
    }
}
</style>