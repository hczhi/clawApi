<template>
    <div class="memos-view-root">
        
        <!-- Header Actions & Stats -->
        <div class="stats-header">
            <div class="stat-card primary-stat">
                <div class="stat-info">
                    <p class="stat-label">备忘录</p>
                    <h2 class="stat-value">全部灵感</h2>
                </div>
                <div class="stat-actions">
                    <button class="btn-refresh" @click="actions.fetchMemos()">
                        <i data-lucide="refresh-cw"></i><span>刷新</span>
                    </button>
                    <button class="btn-primary" @click="actions.navigate('memo-form', { mode: 'add' })">
                        <i data-lucide="plus"></i><span>写灵感</span>
                    </button>
                </div>
            </div>
            
            <div class="stat-card secondary-stat">
                <div class="bg-glow"></div>
                <div class="stat-content">
                    <i data-lucide="book-open" class="stat-icon"></i>
                    <p class="stat-label">总数量</p>
                    <h3 class="stat-value">{{ state.memos.length }} <span class="unit">篇</span></h3>
                </div>
            </div>
        </div>

        <!-- Masonry Grid for Memos -->
        <div class="masonry-scroll-area hide-scrollbar">
            <div v-if="state.loading" class="loading-state">
                <div class="spinner"></div>
            </div>
            <div v-else-if="state.memos.length === 0" class="empty-state-card">
                <i data-lucide="inbox" class="empty-icon"></i>
                <p class="empty-title">暂无备忘录</p>
                <p class="empty-subtitle">记录每一个闪光的灵感</p>
            </div>
            <div v-else class="masonry-grid">
                <div v-for="memo in state.memos" :key="memo.id" 
                    class="memo-card"
                    @click="actions.fetchMemoDetail(memo.id)">
                    
                    <!-- Cover Image (If Any) -->
                    <div v-if="memo.image_urls && getCoverImage(memo.image_urls)" class="memo-cover">
                        <img :src="getCoverImage(memo.image_urls)" class="cover-image" />
                        <div v-if="getImageCount(memo.image_urls) > 1" class="image-count-badge">
                            +{{ getImageCount(memo.image_urls) - 1 }}
                        </div>
                    </div>
                    
                    <div class="memo-body">
                        <div class="memo-meta">
                            <p class="memo-date">{{ dayjs(memo.created_at).format('YYYY-MM-DD HH:mm') }}</p>
                            <button class="btn-edit" @click.stop="actions.navigate('memo-form', { mode: 'edit', id: memo.id })">
                                <i data-lucide="edit-2"></i>
                            </button>
                        </div>
                        
                        <h3 v-if="memo.title" class="memo-title">{{ memo.title }}</h3>
                        <p v-if="memo.content" class="memo-text">{{ memo.content }}</p>
                        
                        <!-- Tags -->
                        <div v-if="getTags(memo.tags).length" class="memo-tags">
                            <span v-for="tag in getTags(memo.tags)" :key="tag" class="tag-badge"># {{ tag }}</span>
                        </div>
                        
                        <!-- Link -->
                        <div v-if="memo.link_url" class="memo-link">
                            <i data-lucide="link-2" class="link-icon"></i>
                            <span class="link-text">{{ memo.link_url }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from '/app/js/store.js';

const { state, actions, helpers } = useAppStore();
const dayjs = window.dayjs;

const getCoverImage = (urls) => {
    try {
        const parsed = typeof urls === 'string' ? JSON.parse(urls) : urls;
        return parsed && parsed.length > 0 ? parsed[0] : null;
    } catch(e) { return null; }
};

const getImageCount = (urls) => {
    try {
        const parsed = typeof urls === 'string' ? JSON.parse(urls) : urls;
        return parsed ? parsed.length : 0;
    } catch(e) { return 0; }
};

const getTags = (tags) => {
    try {
        return typeof tags === 'string' ? JSON.parse(tags || '[]') : (tags || []);
    } catch(e) { return []; }
};

onMounted(() => {
    actions.fetchMemos();
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
@import '/app/scss/_variables.scss';

.memos-view-root {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
}

/* Header Stats */
.stats-header {
    display: flex;
    gap: 1.5rem;
    flex-shrink: 0;
}

.stat-card {
    border-radius: 1.5rem;
    padding: 2rem;
    position: relative;
    overflow: hidden;
}

.primary-stat {
    flex: 2;
    background-color: $color-white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.secondary-stat {
    flex: 1;
    background-color: $color-brand-dark;
    color: $color-white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    &:hover .bg-glow {
        transform: scale(1.5);
    }
}

.bg-glow {
    position: absolute;
    right: -2.5rem;
    bottom: -2.5rem;
    width: 8rem;
    height: 8rem;
    background-color: rgba($color-brand-gold, 0.1);
    border-radius: 50%;
    filter: blur(20px);
    transition: transform 0.7s ease;
}

.stat-label {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $color-brand-gray;
    margin-bottom: 0.5rem;
}

.secondary-stat .stat-label {
    color: rgba(255, 255, 255, 0.5);
}

.stat-value {
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    color: $color-brand-dark;
    line-height: 1;
}

.secondary-stat .stat-value {
    color: $color-white;
    font-size: 1.875rem;
}

.unit {
    font-size: 1.125rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
}

.stat-icon {
    width: 2rem;
    height: 2rem;
    color: $color-brand-gold;
    margin-bottom: 1rem;
}

.stat-actions {
    display: flex;
    gap: 1rem;
}

.btn-refresh, .btn-primary {
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    
    i {
        width: 1.25rem;
        height: 1.25rem;
    }
}

.btn-refresh {
    background-color: $color-brand-light;
    color: $color-brand-dark;
    
    &:hover {
        background-color: rgba($color-brand-gray, 0.2);
    }
}

.btn-primary {
    background-color: $color-brand-accent;
    color: $color-white;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    
    &:hover {
        opacity: 0.9;
    }
}

/* Masonry Grid Area */
.masonry-scroll-area {
    flex: 1;
    overflow-y: auto;
}

.masonry-grid {
    column-count: 1;
    column-gap: 1.5rem;
    padding-bottom: 2.5rem;
    
    @media (min-width: 768px) { column-count: 2; }
    @media (min-width: 1024px) { column-count: 3; }
    @media (min-width: 1280px) { column-count: 4; }
}

.memo-card {
    break-inside: avoid;
    margin-bottom: 1.5rem;
    background-color: $color-white;
    border-radius: 2rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
        
        .cover-image {
            transform: scale(1.05);
        }
        
        .btn-edit {
            opacity: 1;
        }
    }
}

.memo-cover {
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    overflow: hidden;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.5s ease-out;
}

.image-count-badge {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
    color: $color-white;
    font-size: 0.75rem;
    font-weight: 700;
}

.memo-body {
    padding: 1.5rem;
}

.memo-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.memo-date {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $color-brand-gray;
}

.btn-edit {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: $color-brand-light;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-brand-dark;
    opacity: 0;
    transition: opacity 0.2s;
    
    i {
        width: 1rem;
        height: 1rem;
    }
}

.memo-title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-bottom: 0.5rem;
}

.memo-text {
    color: rgba($color-brand-dark, 0.8);
    font-size: 0.875rem;
    line-height: 1.625;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.memo-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.tag-badge {
    padding: 0.25rem 0.75rem;
    background-color: $color-brand-light;
    color: $color-brand-dark;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
}

.memo-link {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba($color-brand-accent, 0.8);
    font-size: 0.75rem;
    font-weight: 500;
    background-color: rgba($color-brand-accent, 0.05);
    padding: 0.75rem;
    border-radius: 0.75rem;
    overflow: hidden;
}

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

/* States */
.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5rem 0;
}

.spinner {
    width: 2rem;
    height: 2rem;
    border: 4px solid $color-brand-accent;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% { transform: rotate(360deg); }
}

.empty-state-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8rem 0;
    color: rgba($color-brand-gray, 0.5);
    background-color: $color-white;
    border-radius: 1.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    
    .empty-icon {
        width: 4rem;
        height: 4rem;
        margin-bottom: 1.5rem;
        opacity: 0.3;
    }
    
    .empty-title {
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }
    
    .empty-subtitle {
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
    }
}
</style>