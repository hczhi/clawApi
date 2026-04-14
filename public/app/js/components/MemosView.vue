<template>
    <div class="memos-container app-container page-content pb-safe">
        <!-- Huge Background Text -->
        <div class="massive-bg-wrapper">
            <span class="massive-text">
                MEMOS
            </span>
        </div>

        <div class="page-header">
            <p class="header-subtitle">JOURNAL & NOTES</p>
            <h1 class="header-title">{{ helpers.formatDate(new Date()) }}</h1>
        </div>
        
        <div class="content-scroll">
            <div v-if="state.loading" class="loading-state">
                <div class="spinner"></div>
            </div>
            <div v-else-if="state.memos.length === 0" class="empty-state">
                <div class="empty-icon-wrapper">
                    <i data-lucide="book-open" class="empty-icon"></i>
                </div>
                <p class="empty-text">暂无备忘录，记录此刻灵感</p>
            </div>
            <div v-else class="memos-list">
                <div v-for="(memo, index) in state.memos" :key="memo.id" 
                    @click="actions.fetchMemoDetail(memo.id)" 
                    class="memo-card group"
                    :style="{ animationDelay: `${index * 50}ms` }">
                    
                    <div class="memo-content-wrapper">
                        <!-- Date & Time -->
                        <div class="memo-meta">
                            <span class="memo-date">{{ dayjs(memo.created_at).format('MM-DD') }}</span>
                            <span class="memo-time">{{ dayjs(memo.created_at).format('HH:mm') }}</span>
                        </div>

                        <!-- Main Content -->
                        <div class="memo-main">
                            <h3 v-if="memo.title" class="memo-title">{{ memo.title }}</h3>
                            <p v-if="memo.content" class="memo-text">{{ memo.content }}</p>
                            
                            <!-- Tags -->
                            <div v-if="memo.tags && memo.tags.length" class="memo-tags">
                                <span v-for="tag in memo.tags" :key="tag" class="memo-tag">#{{ tag }}</span>
                            </div>

                            <!-- Link Preview (Simplified) -->
                            <div v-if="memo.link_url" class="memo-link">
                                <i data-lucide="link-2" class="link-icon"></i>
                                <span class="link-text">{{ memo.link_url }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Media Preview -->
                    <div v-if="memo.image_urls && memo.image_urls.length > 0" class="memo-media">
                        <img :src="memo.image_urls[0]" class="memo-image" alt="memo cover" />
                        <div v-if="memo.image_urls.length > 1" class="media-count">
                            +{{ memo.image_urls.length - 1 }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Button -->
        <button class="fab-btn" @click.stop.prevent="actions.editMemo()" aria-label="Add Memo">
            <i data-lucide="plus"></i>
        </button>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from '../store.js';
const { state, constants, computedProps, helpers, actions } = useAppStore();

const dayjs = window.dayjs;

onMounted(() => {
    actions.fetchMemos();
});
</script>

<style scoped lang="scss">
.memos-container {
    padding-top: 4rem;
    position: relative;
    min-height: 100vh;
    background-color: $color-brand-light;
}

.massive-bg-wrapper {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    user-select: none;
    overflow: hidden;
    z-index: 0;
}

.massive-text {
    font-size: 28vh;
    font-weight: 900;
    color: rgba($color-black, 0.02);
    letter-spacing: -0.05em;
    white-space: nowrap;
    transform: rotate(-90deg) scale(1.8);
    transform-origin: center;
    
    @media (min-width: 768px) {
        transform: rotate(0) scale(1);
    }
}

.page-header {
    padding: 2rem 1.5rem;
    position: relative;
    z-index: 10;
}

.header-subtitle {
    font-size: 10px;
    font-weight: bold;
    color: rgba($color-black, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 0.5rem;
}

.header-title {
    font-size: 3rem;
    font-weight: 900;
    color: $color-black;
    letter-spacing: -0.05em;
    line-height: 1;
}

.content-scroll {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 8rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    scroll-behavior: smooth;
    position: relative;
    z-index: 10;
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 0;
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

.empty-icon-wrapper {
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    border: 1px solid rgba($color-black, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    background: rgba($color-black, 0.03);
}

.empty-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: rgba($color-black, 0.3);
}

.empty-text {
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba($color-black, 0.4);
}

.memos-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.memo-card {
    background: $color-white;
    border-radius: 1.5rem;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 20px 40px rgba(0,0,0,0.06);
    }
}

.memo-content-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.memo-meta {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.memo-date {
    font-size: 1.25rem;
    font-weight: 900;
    color: $color-black;
    letter-spacing: -0.03em;
}

.memo-time {
    font-size: 0.75rem;
    font-weight: bold;
    color: rgba($color-black, 0.4);
}

.memo-main {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.memo-title {
    font-size: 1.125rem;
    font-weight: 800;
    color: $color-black;
    line-height: 1.3;
}

.memo-text {
    font-size: 0.875rem;
    color: rgba($color-black, 0.6);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.memo-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.memo-tag {
    font-size: 0.65rem;
    font-weight: 800;
    color: $color-primary;
    background: rgba($color-primary, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.memo-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: rgba($color-black, 0.5);
    background: rgba($color-black, 0.03);
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    margin-top: 0.5rem;
    
    .link-icon {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
    }
    
    .link-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.memo-media {
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    
    @media (min-width: 640px) {
        width: 8rem;
        height: 8rem;
    }
}

.memo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
    
    .group:hover & {
        transform: scale(1.1);
    }
}

.media-count {
    position: absolute;
    bottom: 0.25rem;
    right: 0.25rem;
    background: rgba($color-black, 0.6);
    backdrop-filter: blur(4px);
    color: $color-white;
    font-size: 0.65rem;
    font-weight: bold;
    padding: 0.15rem 0.4rem;
    border-radius: 0.5rem;
}

.fab-btn {
    position: fixed;
    bottom: 2rem;
    right: 1.5rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: $color-primary;
    color: $color-white;
    border: none;
    box-shadow: 0 10px 25px rgba($color-primary, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    
    &:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 15px 35px rgba($color-primary, 0.5);
    }
    
    &:active {
        transform: scale(0.95);
    }
}

@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>