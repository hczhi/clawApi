<template>
    <div class="concepts-view-root">
        
        <!-- Header Actions & Stats -->
        <div class="stats-header">
            <div class="stat-card primary-stat">
                <div class="stat-info">
                    <p class="stat-label">设计图库</p>
                    <h2 class="stat-value">家的模样</h2>
                </div>
                <div class="stat-actions">
                    <button class="btn-refresh" @click="actions.fetchConcepts()">
                        <i data-lucide="refresh-cw"></i><span>刷新</span>
                    </button>
                    <button class="btn-primary" @click="actions.navigate('concept-form', { mode: 'add' })">
                        <i data-lucide="plus"></i><span>加灵感</span>
                    </button>
                </div>
            </div>
            
            <div class="stat-card secondary-stat">
                <div class="bg-glow"></div>
                <div class="stat-content">
                    <i data-lucide="image" class="stat-icon"></i>
                    <p class="stat-label">图片总数</p>
                    <h3 class="stat-value">{{ state.concepts.length }} <span class="unit">张</span></h3>
                </div>
            </div>
        </div>

        <!-- Concept Gallery -->
        <div class="gallery-scroll-area hide-scrollbar">
            <div v-if="state.loading" class="loading-state">
                <div class="spinner"></div>
            </div>
            <div v-else-if="state.concepts.length === 0" class="empty-state-card">
                <i data-lucide="image-off" class="empty-icon"></i>
                <p class="empty-title">空空如也</p>
                <p class="empty-subtitle">快去收集你喜欢的装修风格吧</p>
            </div>
            <div v-else class="gallery-grid">
                <div v-for="(concept, index) in state.concepts" :key="concept.id" 
                    class="concept-card"
                    :style="{ animationDelay: `${index * 50}ms` }"
                    @click="actions.fetchConceptDetail(concept.id)">
                    
                    <div class="concept-cover">
                        <img v-if="helpers.getConceptCover(concept)" :src="helpers.getConceptCover(concept)" class="cover-image" />
                        <div v-else class="cover-placeholder">
                            <i data-lucide="image"></i>
                        </div>
                        
                        <div class="concept-overlay">
                            <h3 class="concept-title truncate">{{ concept.title }}</h3>
                            <p class="concept-subtitle">{{ concept.style || '未分类风格' }}</p>
                        </div>
                        
                        <!-- Multi-image Indicator -->
                        <div v-if="getImageCount(concept.image_urls) > 1" class="image-count-badge">
                            <i data-lucide="layers"></i>
                            <span>{{ getImageCount(concept.image_urls) }}</span>
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

const getImageCount = (urls) => {
    try {
        const parsed = typeof urls === 'string' ? JSON.parse(urls) : urls;
        return parsed ? parsed.length : 0;
    } catch(e) { return 0; }
};

onMounted(() => {
    actions.fetchConcepts();
    helpers.updateIcons();
});
</script>

<style scoped lang="scss">
@import '/app/scss/_variables.scss';

.concepts-view-root {
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
    background-color: rgba(255, 255, 255, 0.05);
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

/* Gallery Grid */
.gallery-scroll-area {
    flex: 1;
    overflow-y: auto;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding-bottom: 2.5rem;
    
    @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); }
    @media (min-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
}

.concept-card {
    background-color: $color-white;
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
    cursor: pointer;
    position: relative;
    
    &:hover {
        .cover-image {
            transform: scale(1.1);
        }
        
        .concept-overlay {
            opacity: 1;
        }
    }
}

.concept-cover {
    width: 100%;
    aspect-ratio: 1 / 1;
    position: relative;
    overflow: hidden;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 2s ease-out;
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    background-color: $color-brand-light;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-brand-gray;
    
    i {
        width: 2.5rem;
        height: 2.5rem;
        opacity: 0.2;
    }
}

.concept-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2) 50%, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1.5rem;
}

.concept-title {
    color: $color-white;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin-bottom: 0.25rem;
}

.concept-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.75rem;
    font-weight: 500;
}

.image-count-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    color: $color-white;
    border-radius: 9999px;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    i {
        width: 0.75rem;
        height: 0.75rem;
    }
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