<template>
    <div class="memos-feed-section">
        <div class="memos-bg-grid"></div>
        <!-- <div class="feed-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative; z-index: 2;">
            <span class="label" style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-main); letter-spacing: 0.05em; text-transform: uppercase;">灵感记录 <span style="color: var(--color-text-muted); font-weight: 500; margin-left: 0.5rem; font-size: 0.8rem;">/ MEMOS</span></span>
            <button class="circle-btn" @click="actions.navigate('memos')" style="padding: 0.4rem 1.2rem; border-radius: 100px; background: var(--color-card-white); border: 1px solid rgba(0,0,0,0.05); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; color: var(--color-text-main); font-weight: 600; font-size: 0.75rem; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                <span>浏览全部</span>
            </button>
        </div> -->
        <div class="feed-list hide-scrollbar" style="flex: 1; overflow-y: auto; padding-right: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; position: relative; z-index: 2;">
            <div v-if="state.memos.length === 0" class="empty-text" style="padding: 3rem; text-align: center; color: var(--color-text-muted); background: var(--color-card-white); border-radius: 24px; border: 1px solid rgba(0,0,0,0.03);">暂无记录</div>
            
            <!-- Timeline Feed Item -->
            <div v-for="memo in state.memos" :key="memo.id" 
                 class="feed-card" 
                 @click.stop="actions.fetchMemoDetail(memo.id)">
                
                <div class="feed-content">
                    <div class="feed-text-area">
                        <div class="feed-meta">
                            <span class="feed-date">{{ dayjs(memo.created_at).format('MM-DD') }}</span>
                            <span class="feed-time">{{ dayjs(memo.created_at).format('HH:mm') }}</span>
                        </div>
                        
                        <h4 v-if="memo.title" class="feed-title">{{ memo.title }}</h4>
                        <p v-if="memo.content" class="feed-desc">{{ memo.content }}</p>
                        
                        <div class="feed-tags" v-if="memo.tags && memo.tags.length">
                            <span v-for="tag in memo.tags" :key="tag" class="tag">#{{ tag }}</span>
                        </div>
                    </div>
                    
                    <div class="feed-media" v-if="memo.image_urls && memo.image_urls.length > 0">
                        <img :src="memo.image_urls[0]" />
                        <div v-if="memo.image_urls.length > 1" class="media-count">+{{ memo.image_urls.length - 1 }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '/app/js/store.js';

const { state, actions } = useAppStore();
const dayjs = window.dayjs;
</script>

<style scoped lang="scss">
.memos-feed-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    padding-left: 6rem;
}

.memos-bg-grid {
    position: absolute;
    inset: -29%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.15;
    background-size: 40px 40px;
    background-image: 
        linear-gradient(to right, var(--color-text-main) 1px, transparent 1px),
        linear-gradient(to bottom, var(--color-text-main) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at top left, black 0%, transparent 60%);
    -webkit-mask-image: radial-gradient(ellipse at top left, black 0%, transparent 60%);
}

.feed-card {
    position: relative;
    background: var(--color-card-white);
    padding: 1rem;
    border-radius: 28px;
    border: 1px solid rgba(0,0,0,0.04);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    
    /* Subtle noise texture */
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0.2;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        pointer-events: none;
        z-index: 0;
        mix-blend-mode: overlay;
    }

    &:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 20px 40px rgba(0,0,0,0.06);
        border-color: rgba(0,0,0,0.08);
    }

    .feed-content {
        position: relative;
        z-index: 1;
        display: flex;
        gap: 1.5rem;
    }

    .feed-text-area {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .feed-meta {
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
        margin-bottom: 0.8rem;

        .feed-date {
            font-size: 1.1rem;
            font-weight: 900;
            color: var(--color-text-main);
            letter-spacing: -0.02em;
        }
        
        .feed-time {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 0.05em;
        }
    }

    .feed-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--color-text-main);
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .feed-desc {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--color-text-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .feed-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.2rem;

        .tag {
            font-size: 0.7rem;
            font-weight: 700;
            background: rgba(0,0,0,0.04);
            color: var(--color-text-main);
            padding: 0.3rem 0.8rem;
            border-radius: 100px;
            letter-spacing: 0.02em;
        }
    }

    .feed-media {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        overflow: hidden;
        flex-shrink: 0;
        position: relative;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .media-count {
            position: absolute;
            bottom: 6px;
            right: 6px;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            color: white;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.2rem 0.6rem;
            border-radius: 10px;
            letter-spacing: 0.05em;
        }
    }

    &:hover .feed-media img {
        transform: scale(1.05);
    }
}
</style>
