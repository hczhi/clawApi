<template>
    <div class="desktop-detail-wrapper">
        <div v-if="state.currentMemo" class="detail-content animate-fade-in-up">
            
            <!-- Article Header -->
            <div class="article-header">
                <div class="meta-info">
                    <span class="date">{{ dayjs(state.currentMemo.created_at).format('YYYY年MM月DD日 HH:mm') }}</span>
                </div>
                
                <h1 class="article-title" v-if="state.currentMemo.title">{{ state.currentMemo.title }}</h1>
                <h1 class="article-title empty" v-else>无标题备忘录</h1>

                <div class="tags-row" v-if="state.currentMemo.tags && state.currentMemo.tags.length">
                    <span class="tag-badge" v-for="tag in state.currentMemo.tags" :key="tag">
                        #{{ tag }}
                    </span>
                </div>
            </div>

            <!-- Content Area -->
            <div class="article-body" v-if="state.currentMemo.content">
                <p class="content-text">{{ state.currentMemo.content }}</p>
            </div>

            <!-- Reference Link -->
            <div class="reference-link-box" v-if="state.currentMemo.link_url">
                <a :href="state.currentMemo.link_url" target="_blank" class="link-card">
                    <div class="link-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                    <div class="link-content">
                        <span class="label">参考链接 / 外链</span>
                        <span class="url">{{ state.currentMemo.link_url }}</span>
                    </div>
                </a>
            </div>

            <!-- Images Grid -->
            <div class="images-gallery" v-if="state.currentMemo.image_urls && state.currentMemo.image_urls.length > 0">
                <h3 class="gallery-title">图片附件</h3>
                <div class="masonry-grid">
                    <div class="masonry-item" v-for="(img, idx) in state.currentMemo.image_urls" :key="idx" @click="actions.previewImage(img)">
                        <img :src="img" alt="备忘录附件" />
                    </div>
                </div>
            </div>

            <!-- Bottom Actions Bar -->
            <div class="actions-bar">
                <button class="btn-secondary danger" @click="actions.deleteMemo">删除备忘录</button>
                <button class="btn-primary" @click="actions.editMemo(state.currentMemo)">编辑内容</button>
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

/* Article Header */
.article-header {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .meta-info {
        .date {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
    }

    .article-title {
        font-size: 3rem;
        font-weight: 900;
        color: var(--color-text-main);
        line-height: 1.2;
        letter-spacing: -0.02em;
        margin: 0;

        &.empty {
            color: rgba(0, 0, 0, 0.2);
            font-style: italic;
        }
    }

    .tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;

        .tag-badge {
            font-size: 0.8rem;
            font-weight: 700;
            background: rgba(0, 0, 0, 0.04);
            color: var(--color-text-main);
            padding: 0.4rem 1rem;
            border-radius: 100px;
            letter-spacing: 0.02em;
        }
    }
}

/* Article Body */
.article-body {
    .content-text {
        font-size: 1.15rem;
        line-height: 1.8;
        color: var(--color-text-main);
        white-space: pre-wrap;
        margin: 0;
        font-weight: 400;
    }
}

/* Reference Link */
.reference-link-box {
    .link-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        background: var(--color-bg-base);
        padding: 1.5rem 2rem;
        border-radius: 24px;
        text-decoration: none;
        transition: all 0.3s ease;
        border: 1px solid transparent;

        &:hover {
            background: var(--color-card-white);
            border-color: rgba(0, 0, 0, 0.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            transform: translateY(-2px);
        }

        .link-icon {
            width: 3.5rem;
            height: 3.5rem;
            background: var(--color-card-white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-main);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
            flex-shrink: 0;
        }

        .link-content {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            overflow: hidden;

            .label {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--color-text-muted);
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            .url {
                font-size: 0.95rem;
                font-weight: 600;
                color: #007aff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
}

/* Images Gallery */
.images-gallery {
    .gallery-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 1.5rem;
    }

    .masonry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;

        .masonry-item {
            aspect-ratio: 4/3;
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
            transition: all 0.3s ease;

            &:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-soft);
            }

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
        padding: 1rem 2rem;
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